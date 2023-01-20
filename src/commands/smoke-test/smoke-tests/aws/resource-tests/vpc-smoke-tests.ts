import isNil from 'lodash.isnil';
import get from 'lodash.get';
import isString from 'lodash.isstring';
import isPlainObject from 'lodash.isplainobject';
import * as logger from '../../../../../logger';
import { EC2 } from '@aws-sdk/client-ec2';
import { ServiceQuotas } from '@aws-sdk/client-service-quotas';
import { ChangeType, Json, ResourceDiffRecord, SmokeTestOptions } from '../../../../../types';
import { getCredentials } from '../../../../../utils/aws';
import { QuotaError } from '../../../../../errors/quota-error';
import { ROUTE_TABLE_ASSOCIATION, SUBNET, VPC, getStandardResourceType } from '../resources';
import { CustomError } from '../../../../../errors';

async function checkVpcQuota (resources: ResourceDiffRecord[]) {
  const newVpcCount = resources.filter(resource =>
    getStandardResourceType(resource.resourceType) === VPC &&
    resource.changeType === ChangeType.CREATE
  ).length;

  if (newVpcCount === 0) return;

  logger.info('Checking VPC service quota...');
  const DEFAULT_VPC_QUOTA = 5;
  const DEFAULT_NUMBER_OF_VPCS = 1;

  const config = { credentials: await getCredentials() };

  const quotaClient = new ServiceQuotas(config);
  const quotaResponse = await quotaClient.getAWSDefaultServiceQuota({
    ServiceCode: 'vpc',
    QuotaCode: 'L-F678F1CE'
  });

  const vpcQuota = quotaResponse?.Quota?.Value || DEFAULT_VPC_QUOTA;

  const ec2Client = new EC2(config);
  const vpcResponse = await ec2Client.describeVpcs({});
  
  const currentNumberOfVpcs = vpcResponse?.Vpcs?.length || DEFAULT_NUMBER_OF_VPCS;
  const remainingNumberOfVpcs = vpcQuota - currentNumberOfVpcs;
  const proposedNumberOfVpcs = currentNumberOfVpcs + newVpcCount;
  if (vpcQuota < proposedNumberOfVpcs) {
    throw new QuotaError(`This stack needs to create ${newVpcCount} VPC(s), but only ${remainingNumberOfVpcs} more can be created with the current quota limit! Request a quota increase or choose another region to continue.`);
  }
}

// eslint-disable-next-line no-shadow
enum SubnetType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  ISOLATED = 'ISOLATED'
}

interface SubnetRecord {
  type: SubnetType;
  resourceRecord: ResourceDiffRecord;
}

function referencesLogicalId (resource: Json, property: string, logicalId: string): boolean {
  const referencedProperty = get(resource?.properties, property);
  if (isString(referencedProperty)) return referencedProperty.includes(logicalId);
  if(isPlainObject(referencedProperty)) return referencedProperty.Ref === logicalId;
  return false;
}

function getSubnetsForVpc (vpcResource: ResourceDiffRecord, allResources: ResourceDiffRecord[]): SubnetRecord[] {
  const { logicalId: vpcLogicalId } = vpcResource;
  return allResources.filter((resource: ResourceDiffRecord) => 
    getStandardResourceType(resource.resourceType) === SUBNET &&
    referencesLogicalId(resource, 'vpcId', vpcLogicalId)
  ).map<SubnetRecord>((subnetResource: ResourceDiffRecord) => {
    const { logicalId: subnetLogicalId } = subnetResource;
    
    const routeTableAssociation: ResourceDiffRecord = allResources.find((resource: ResourceDiffRecord) =>
      getStandardResourceType(resource.resourceType) === ROUTE_TABLE_ASSOCIATION &&
      referencesLogicalId(resource, 'subnetId', subnetLogicalId)
    );
    
    const routeTable = allResources.find((resource: ResourceDiffRecord) => referencesLogicalId(routeTableAssociation, 'routeTableId', resource.logicalId));
    
    const routes = routeTable?.properties?.routeSet;
    
    const isPublic = routes?.some((route: Json) => route.destinationCidrBlock === '0.0.0.0/0' && !isNil(route.gatewayId));
    const isPrivate = !isPublic && routes?.some((route: Json) => route.destinationCidrBlock === '0.0.0.0/0' && !isNil(route.natGatewayId));

    let subnetType = SubnetType.ISOLATED;
    if (isPublic) subnetType = SubnetType.PUBLIC;
    if (isPrivate) subnetType = SubnetType.PRIVATE;

    return {
      type: subnetType,
      resourceRecord: subnetResource
    };
  });
}

async function verifyVpcHasPrivateSubnets (resource: ResourceDiffRecord, allResources: ResourceDiffRecord[]) {
  logger.info('Verifying subnet configuration...');
  const subnets = getSubnetsForVpc(resource, allResources);
  const privateSubnets = subnets.filter((subnet: SubnetRecord) => subnet.type === SubnetType.PRIVATE);
  if (privateSubnets.length === 0) {
    throw new CustomError('Missing private subnets!', `Based on the configuration passed, private subnets with a NAT Gateway are required for all vpcs but none was found for "${resource?.logicalId}".`);
  }
}

async function vpcSmokeTest (resource: ResourceDiffRecord, allResources: ResourceDiffRecord[], config: SmokeTestOptions) {
  if (config.requirePrivateSubnet) {
    await verifyVpcHasPrivateSubnets(resource, allResources);
  }
}

export {
  checkVpcQuota,
  vpcSmokeTest
};
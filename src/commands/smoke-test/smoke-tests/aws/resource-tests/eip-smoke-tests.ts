import * as logger from '../../../../../logger';
import { EC2 } from '@aws-sdk/client-ec2';
import { ServiceQuotas } from '@aws-sdk/client-service-quotas';
import { ChangeType, ResourceDiffRecord } from '../../../../../types';
import { getCredentials } from '../../../../../utils/aws';
import { QuotaError } from '../../../../../errors/quota-error';
import { EIP, getStandardResourceType } from '../resources';

async function checkEipQuota (resources: ResourceDiffRecord[]) {
  const newEipCount = resources.filter(resource =>
    getStandardResourceType(resource.resourceType) === EIP &&
    resource.changeType === ChangeType.CREATE
  ).length;
  
  if (newEipCount === 0) return;
    
  logger.info('Checking Elastic IP service quota...');
  const DEFAULT_EIP_QUOTA = 5;
  const DEFAULT_NUMBER_OF_EIPS = 1;

  const config = { credentials: await getCredentials() };

  const quotaClient = new ServiceQuotas(config);
  const quotaResponse = await quotaClient.getAWSDefaultServiceQuota({
    ServiceCode: 'ec2',
    QuotaCode: 'L-0263D0A3'
  });

  const vpcQuota = quotaResponse?.Quota?.Value || DEFAULT_EIP_QUOTA;

  const ec2Client = new EC2(config);
  const eipsResponse = await ec2Client.describeAddresses({});
  
  const currentNumberOfEips = eipsResponse?.Addresses?.length || DEFAULT_NUMBER_OF_EIPS;
  const remainingNumberOfEips = vpcQuota - currentNumberOfEips;
  const proposedNumberOfEips = currentNumberOfEips + newEipCount;
  if (vpcQuota < proposedNumberOfEips) {
    throw new QuotaError(`This stack needs to create ${newEipCount} elastic IP address(es), but only ${remainingNumberOfEips} more can be created within this region with the current quota limit! Release any unassociated EIPs, request a quota increase, or choose another region to continue.`);
  }
}

export {
  checkEipQuota
};
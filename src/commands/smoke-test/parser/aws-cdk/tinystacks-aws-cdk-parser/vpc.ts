import { CdkDiff, Json } from '../../../../../types';
import {
  CloudformationTypes
} from '../../../smoke-tests/aws/resources';

const {
  CFN_ROUTE_TABLE_ASSOCIATION,
  CFN_ROUTE
} = CloudformationTypes;

// https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_Vpc.html
function parseVpc (diff: CdkDiff, cloudformationTemplate: Json): Json {
  const { logicalId } = diff;
  const [ _logicalId, cfnEntry = {} ] = Object.entries<Json>(cloudformationTemplate.Resources).find(([key]) => key === logicalId) || [];
  const cidrBlock = cfnEntry.Properties?.CidrBlock;
  const instanceTenancy = cfnEntry.Properties?.InstanceTenancy;
  const tagSet = cfnEntry.Properties?.Tags;

  return {
    cidrBlock,
    instanceTenancy,
    tagSet
  };
}

// https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_NatGateway.html
function parseNatGateway (diff: CdkDiff, cloudformationTemplate: Json): Json {
  const { logicalId } = diff;
  const [ _logicalId, cfnEntry = {} ] = Object.entries<Json>(cloudformationTemplate.Resources).find(([key]) => key === logicalId) || [];
  const connectivityType = cfnEntry.Properties?.ConnectivityType;
  const subnetId = cfnEntry.Properties?.SubnetId;
  const tagSet = cfnEntry.Properties?.Tags;

  return {
    connectivityType,
    subnetId,
    tagSet
  };
}

// https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_Subnet.html
function parseSubnet (diff: CdkDiff, cloudformationTemplate: Json): Json {
  const { logicalId } = diff;
  const [ _logicalId, cfnEntry = {} ] = Object.entries<Json>(cloudformationTemplate.Resources).find(([key]) => key === logicalId) || [];
  const assignIpv6AddressOnCreation = cfnEntry.Properties?.AssignIpv6AddressOnCreation;
  const availabilityZone = cfnEntry.Properties?.AvailabilityZone;
  const availabilityZoneId = cfnEntry.Properties?.AvailabilityZoneId;
  const cidrBlock = cfnEntry.Properties?.CidrBlock;
  const enableDns64 = cfnEntry.Properties?.EnableDns64;
  const ipv6Native = cfnEntry.Properties?.Ipv6Native;
  const mapPublicIpOnLaunch = cfnEntry.Properties?.MapPublicIpOnLaunch;
  const outpostArn = cfnEntry.Properties?.OutpostArn;
  let privateDnsNameOptionsOnLaunch: Json;
  if (cfnEntry.Properties?.PrivateDnsNameOptionsOnLaunch) {
    privateDnsNameOptionsOnLaunch = {};
    privateDnsNameOptionsOnLaunch['enableResourceNameDnsAAAARecord'] = cfnEntry.Properties?.PrivateDnsNameOptionsOnLaunch?.EnableResourceNameDnsAAAARecord;
    privateDnsNameOptionsOnLaunch['enableResourceNameDnsARecord'] = cfnEntry.Properties?.PrivateDnsNameOptionsOnLaunch?.EnableResourceNameDnsARecord;
    privateDnsNameOptionsOnLaunch['hostnameType'] = cfnEntry.Properties?.PrivateDnsNameOptionsOnLaunch?.HostnameType;
  }
  const vpcId = cfnEntry.Properties?.VpcId;
  const tagSet = cfnEntry.Properties?.Tags;

  return {
    assignIpv6AddressOnCreation,
    availabilityZone,
    availabilityZoneId,
    cidrBlock,
    enableDns64,
    ipv6Native,
    mapPublicIpOnLaunch,
    outpostArn,
    privateDnsNameOptionsOnLaunch,
    vpcId,
    tagSet
  };
}

// https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_RouteTableAssociation.html
function parseRouteTableAssociation (diff: CdkDiff, cloudformationTemplate: Json): Json {
  const { logicalId } = diff;
  const [ _logicalId, cfnEntry = {} ] = Object.entries<Json>(cloudformationTemplate.Resources).find(([key]) => key === logicalId) || [];

  const routeTableId = cfnEntry.Properties?.RouteTableId;
  const subnetId = cfnEntry.Properties?.SubnetId;

  return {
    routeTableId,
    subnetId
  };
}

// https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_Route.html
function parseRoute (diff: CdkDiff, cloudformationTemplate: Json): Json {
  const { logicalId } = diff;
  const [ _logicalId, cfnEntry = {} ] = Object.entries<Json>(cloudformationTemplate.Resources).find(([key]) => key === logicalId) || [];

  const carrierGatewayId =  cfnEntry.Properties?.CarrierGatewayId;
  const destinationCidrBlock =  cfnEntry.Properties?.DestinationCidrBlock;
  const destinationIpv6CidrBlock =  cfnEntry.Properties?.DestinationIpv6CidrBlock;
  const egressOnlyInternetGatewayId =  cfnEntry.Properties?.EgressOnlyInternetGatewayId;
  const gatewayId =  cfnEntry.Properties?.GatewayId;
  const instanceId =  cfnEntry.Properties?.InstanceId;
  const localGatewayId =  cfnEntry.Properties?.LocalGatewayId;
  const natGatewayId =  cfnEntry.Properties?.NatGatewayId;
  const networkInterfaceId =  cfnEntry.Properties?.NetworkInterfaceId;
  const transitGatewayId =  cfnEntry.Properties?.TransitGatewayId;
  const vpcEndpointId =  cfnEntry.Properties?.VpcEndpointId;
  const vpcPeeringConnectionId =  cfnEntry.Properties?.VpcPeeringConnectionId;

  return {
    carrierGatewayId,
    destinationCidrBlock,
    destinationIpv6CidrBlock,
    egressOnlyInternetGatewayId,
    gatewayId,
    instanceId,
    localGatewayId,
    natGatewayId,
    networkInterfaceId,
    transitGatewayId,
    vpcEndpointId,
    vpcPeeringConnectionId
  };
}

// https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_RouteTable.html
function parseRouteTable (diff: CdkDiff, cloudformationTemplate: Json): Json {
  const { logicalId } = diff;
  const resourceEntries = Object.entries<Json>(cloudformationTemplate.Resources);
  const [ _logicalId, cfnEntry = {} ] = resourceEntries.find(([key]) => key === logicalId) || [];

  const associationSet = resourceEntries.filter(([_key, value]: [string, Json]) => 
    value.Type === CFN_ROUTE_TABLE_ASSOCIATION &&
    value.Properties.RouteTableId?.Ref === logicalId
  )
    .map(([_key, value]: [string, Json]) => {
      const routeTableId = value.Properties?.RouteTableId;
      const subnetId = value.Properties?.SubnetId;

      return {
        routeTableId,
        subnetId
      };
    });

  const routeSet = resourceEntries.filter(([_key, value]: [string, Json]) => 
    value.Type === CFN_ROUTE &&
    value.Properties.RouteTableId?.Ref === logicalId
  )
    .map(([_key, value]: [string, Json]) => {
      const carrierGatewayId = value.Properties?.CarrierGatewayId;
      const destinationCidrBlock = value.Properties?.DestinationCidrBlock;
      const destinationIpv6CidrBlock = value.Properties?.DestinationIpv6CidrBlock;
      const egressOnlyInternetGatewayId = value.Properties?.EgressOnlyInternetGatewayId;
      const gatewayId = value.Properties?.GatewayId;
      const instanceId = value.Properties?.InstanceId;
      const localGatewayId = value.Properties?.LocalGatewayId;
      const natGatewayId = value.Properties?.NatGatewayId;
      const networkInterfaceId = value.Properties?.NetworkInterfaceId;
      const transitGatewayId = value.Properties?.TransitGatewayId;
      const vpcEndpointId = value.Properties?.VpcEndpointId;
      const vpcPeeringConnectionId = value.Properties?.VpcPeeringConnectionId;

      return {
        carrierGatewayId,
        destinationCidrBlock,
        destinationIpv6CidrBlock,
        egressOnlyInternetGatewayId,
        gatewayId,
        instanceId,
        localGatewayId,
        natGatewayId,
        networkInterfaceId,
        transitGatewayId,
        vpcEndpointId,
        vpcPeeringConnectionId
      };
    });
    
  const tagSet = cfnEntry.Properties?.Tags;
  const vpcId = cfnEntry.Properties?.VpcId;

  return {
    associationSet,
    routeSet,
    tagSet,
    vpcId
  };
}

export {
  parseVpc,
  parseNatGateway,
  parseSubnet,
  parseRouteTableAssociation,
  parseRoute,
  parseRouteTable
};
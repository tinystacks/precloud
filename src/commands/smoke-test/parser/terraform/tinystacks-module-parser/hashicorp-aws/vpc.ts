import { TfDiff, Json, TxtFile, JsonFile } from '../../../../../../types';
import {
  TerraformTypes
} from '../../../../smoke-tests/aws/resources';
import { getAllOfType, getResource } from './helpers';

const {
  TF_ROUTE_TABLE_ASSOCIATION,
  TF_ROUTE
} = TerraformTypes;

// https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_Vpc.html
function parseVpc (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], _tfJson: JsonFile[]): Json {
  const resource = getResource(diff, tfPlan);
  const cidrBlock = resource?.cidr_block;
  const instanceTenancy = resource?.instance_tenancy;
  const ipv6CidrBlock = resource?.ipv6_cidr_block;
  const ipv6Pool = resource?.ipv6_ipam_pool_id;
  const networkBorderGroup = resource?.ipv6_cidr_block_network_border_group;
  let ipv6CidrBlockAssociationSet: Json;
  if (ipv6CidrBlock || ipv6Pool || networkBorderGroup) {
    ipv6CidrBlockAssociationSet = {
      ipv6CidrBlock,
      ipv6Pool,
      networkBorderGroup
    };
  }
  const tagSet = resource?.tags;

  return {
    cidrBlock,
    instanceTenancy,
    ipv6CidrBlockAssociationSet,
    tagSet
  };
}

// https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_NatGateway.html
function parseNatGateway (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], _tfJson: JsonFile[]): Json {
  const resource = getResource(diff, tfPlan);
  const connectivityType = resource.connectivity_type;
  const subnetId = resource.subnet_id;
  const tagSet = resource.tags;

  return {
    connectivityType,
    subnetId,
    tagSet
  };
}

// https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_Subnet.html
function parseSubnet (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], _tfJson: JsonFile[]): Json {
  const resource = getResource(diff, tfPlan);
  const assignIpv6AddressOnCreation = resource?.assign_ipv6_address_on_creation;
  const availabilityZone = resource?.availability_zone;
  const availabilityZoneId = resource?.availability_zone_id;
  const cidrBlock = resource?.cidr_block;
  const customerOwnedIpv4Pool = resource?.customer_owned_ipv4_pool;
  const enableDns64 = resource?.enable_dns64;
  const ipv6Native = resource?.ipv6_native;
  const mapCustomerOwnedIpOnLaunch = resource?.map_customer_owned_ip_on_launch;
  const mapPublicIpOnLaunch = resource?.map_public_ip_on_launch;
  const outpostArn = resource?.outpost_arn;
  
  const ipv6CidrBlock = resource?.ipv6_cidr_block;
  let ipv6CidrBlockAssociationSet: Json;
  if (ipv6CidrBlock) {
    ipv6CidrBlockAssociationSet = {
      ipv6CidrBlock
    };
  }
  
  const privateDnsHostnameTypeOnLaunch = resource?.private_dns_hostname_type_on_launch;
  const enableResourceNameDnsAAAARecord = resource?.enable_resource_name_dns_aaaa_record_on_launch;
  const enableResourceNameDnsARecord = resource?.enable_resource_name_dns_a_record_on_launch;
  let privateDnsNameOptionsOnLaunch: Json;
  if (privateDnsHostnameTypeOnLaunch || enableResourceNameDnsAAAARecord || enableResourceNameDnsARecord) {
    privateDnsNameOptionsOnLaunch = {
      enableResourceNameDnsAAAARecord,
      enableResourceNameDnsARecord,
      privateDnsHostnameTypeOnLaunch
    };
  }
  const vpcId = resource?.vpc_id;
  const tagSet = resource?.tags;

  return {
    assignIpv6AddressOnCreation,
    availabilityZone,
    availabilityZoneId,
    cidrBlock,
    customerOwnedIpv4Pool,
    enableDns64,
    ipv6CidrBlockAssociationSet,
    ipv6Native,
    mapCustomerOwnedIpOnLaunch,
    mapPublicIpOnLaunch,
    outpostArn,
    privateDnsNameOptionsOnLaunch,
    vpcId,
    tagSet
  };
}

// https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_RouteTableAssociation.html
function parseRouteTableAssociation (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], _tfJson: JsonFile[]): Json {
  const resource = getResource(diff, tfPlan);

  const gatewayId = resource?.gateway_id;
  const routeTableId = resource?.route_table_id;
  const subnetId = resource?.subnet_id;

  return {
    gatewayId,
    routeTableId,
    subnetId
  };
}

// https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_Route.html
function parseRoute (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], _tfJson: JsonFile[]): Json {
  const resource = getResource(diff, tfPlan);

  const carrierGatewayId = resource?.carrier_gateway_id;
  const coreNetworkArn = resource?.core_network_arn;
  const destinationCidrBlock = resource?.destination_cidr_block;
  const destinationIpv6CidrBlock = resource?.destination_ipv6_cidr_block;
  const destinationPrefixListId = resource?.destination_prefix_list_id;
  const egressOnlyInternetGatewayId = resource?.egress_only_gateway_id;
  const gatewayId = resource?.gateway_id;
  const instanceId = resource?.instance_id;
  const localGatewayId = resource?.local_gateway_id;
  const natGatewayId = resource?.nat_gateway_id;
  const networkInterfaceId = resource?.network_interface_id;
  const transitGatewayId = resource?.transit_gateway_id;
  const vpcPeeringConnectionId = resource?.vpc_peering_connection_id;
  const vpcEndpointId = resource?.vpc_endpoint_id;

  return {
    carrierGatewayId,
    coreNetworkArn,
    destinationCidrBlock,
    destinationIpv6CidrBlock,
    destinationPrefixListId,
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
function parseRouteTable (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], _tfJson: JsonFile[]): Json {
  const { logicalId, address, index } = diff;
  const resource = getResource(diff, tfPlan);
  
  const [module, moduleName] = address?.split('.') || [];
  const moduleAddress = `${module}.${moduleName}`;

  const associationSet = getAllOfType(tfPlan, TF_ROUTE_TABLE_ASSOCIATION, moduleAddress).filter((entry: TfDiff & Json) => 
    entry.properties?.route_table_id?.includes(logicalId) &&
    entry.index === index
  )
    .map((entry: TfDiff & Json) => {
      const gatewayId = entry?.properties?.gateway_id;
      const routeTableId = entry?.properties?.route_table_id;
      const subnetId = entry?.properties?.subnet_id;

      return {
        gatewayId,
        routeTableId,
        subnetId
      };
    });

  
  
  const routeSet = getAllOfType(tfPlan, TF_ROUTE, moduleAddress).filter((entry: TfDiff & Json) => 
    entry.properties.route_table_id?.includes(logicalId) &&
    entry.index === index
  )
    .map((entry: TfDiff & Json) => {
      const carrierGatewayId = entry?.properties?.carrier_gateway_id;
      const coreNetworkArn = entry?.properties?.core_network_arn;
      const destinationCidrBlock = entry?.properties?.destination_cidr_block;
      const destinationIpv6CidrBlock = entry?.properties?.destination_ipv6_cidr_block;
      const destinationPrefixListId = entry?.properties?.destination_prefix_list_id;
      const egressOnlyInternetGatewayId = entry?.properties?.egress_only_gateway_id;
      const gatewayId = entry?.properties?.gateway_id;
      const instanceId = entry?.properties?.instance_id;
      const localGatewayId = entry?.properties?.local_gateway_id;
      const natGatewayId = entry?.properties?.nat_gateway_id;
      const networkInterfaceId = entry?.properties?.network_interface_id;
      const transitGatewayId = entry?.properties?.transit_gateway_id;
      const vpcPeeringConnectionId = entry?.properties?.vpc_peering_connection_id;
      const vpcEndpointId = entry?.properties?.vpc_endpoint_id;

      return {
        carrierGatewayId,
        coreNetworkArn,
        destinationCidrBlock,
        destinationIpv6CidrBlock,
        destinationPrefixListId,
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

    
  const tagSet = resource?.tags;
  const vpcId = resource?.vpc_id;

  return {
    associationSet,
    routeSet,
    tagSet,
    vpcId
  };
}

// https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_InternetGateway.html
function parseInternetGateway (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], _tfJson: JsonFile[]): Json {
  const resource = getResource(diff, tfPlan);

  const vpcId = resource?.vpc_id;
  let attachmentSet;
  if (vpcId) {
    attachmentSet = [{ vpcId }];
  }
  
  const tagSet = resource?.tags;

  return {
    attachmentSet,
    tagSet
  };
}

export {
  parseVpc,
  parseNatGateway,
  parseSubnet,
  parseRouteTableAssociation,
  parseRoute,
  parseRouteTable,
  parseInternetGateway
};
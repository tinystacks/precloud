import { TfDiff, Json, TxtFile, JsonFile } from '../../../../../types';
import {
  TerraformTypes
} from '../../../../smoke-tests/aws/resources';
import { getTfEntry, resolveValue } from './helpers';

const {
  TF_ROUTE_TABLE_ASSOCIATION,
  TF_ROUTE
} = TerraformTypes;

// https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_Vpc.html
function parseVpc (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], tfJson: JsonFile[]): Json {
  const tfEntry = getTfEntry(diff, tfJson);
  const cidrBlock = resolveValue(diff, tfPlan, tfEntry, 'cidr_block');
  const instanceTenancy = resolveValue(diff, tfPlan, tfEntry, 'instance_tenancy');
  const ipv6CidrBlock = resolveValue(diff, tfPlan, tfEntry, 'ipv6_cidr_block');
  const ipv6Pool = resolveValue(diff, tfPlan, tfEntry, 'ipv6_ipam_pool_id');
  const networkBorderGroup = resolveValue(diff, tfPlan, tfEntry, 'ipv6_cidr_block_network_border_group');
  let ipv6CidrBlockAssociationSet: Json;
  if (ipv6CidrBlock || ipv6Pool || networkBorderGroup) {
    ipv6CidrBlockAssociationSet = {
      ipv6CidrBlock,
      ipv6Pool,
      networkBorderGroup
    };
  }
  const tagSet = tfEntry?.tags;

  return {
    cidrBlock,
    instanceTenancy,
    ipv6CidrBlockAssociationSet,
    tagSet
  };
}

// https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_NatGateway.html
function parseNatGateway (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], tfJson: JsonFile[]): Json {
  const tfEntry = getTfEntry(diff, tfJson);
  const connectivityType = resolveValue(diff, tfPlan, tfEntry, 'connectivity_type');
  const subnetId = resolveValue(diff, tfPlan, tfEntry, 'subnet_id');
  const tagSet = resolveValue(diff, tfPlan, tfEntry, 'tags');

  return {
    connectivityType,
    subnetId,
    tagSet
  };
}

// https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_Subnet.html
function parseSubnet (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], tfJson: JsonFile[]): Json {
  const tfEntry = getTfEntry(diff, tfJson);
  const assignIpv6AddressOnCreation = resolveValue(diff, tfPlan, tfEntry, 'assign_ipv6_address_on_creation');
  const availabilityZone = resolveValue(diff, tfPlan, tfEntry, 'availability_zone');
  const availabilityZoneId = resolveValue(diff, tfPlan, tfEntry, 'availability_zone_id');
  const cidrBlock = resolveValue(diff, tfPlan, tfEntry, 'cidr_block');
  const customerOwnedIpv4Pool = resolveValue(diff, tfPlan, tfEntry, 'customer_owned_ipv4_pool');
  const enableDns64 = resolveValue(diff, tfPlan, tfEntry, 'enable_dns64');
  const ipv6Native = resolveValue(diff, tfPlan, tfEntry, 'ipv6_native');
  const mapCustomerOwnedIpOnLaunch = resolveValue(diff, tfPlan, tfEntry, 'map_customer_owned_ip_on_launch');
  const mapPublicIpOnLaunch = resolveValue(diff, tfPlan, tfEntry, 'map_public_ip_on_launch');
  const outpostArn = resolveValue(diff, tfPlan, tfEntry, 'outpost_arn');
  
  const ipv6CidrBlock = resolveValue(diff, tfPlan, tfEntry, 'ipv6_cidr_block');
  let ipv6CidrBlockAssociationSet: Json;
  if (ipv6CidrBlock) {
    ipv6CidrBlockAssociationSet = {
      ipv6CidrBlock
    };
  }
  
  const privateDnsHostnameTypeOnLaunch = resolveValue(diff, tfPlan, tfEntry, 'private_dns_hostname_type_on_launch');
  const enableResourceNameDnsAAAARecord = resolveValue(diff, tfPlan, tfEntry, 'enable_resource_name_dns_aaaa_record_on_launch');
  const enableResourceNameDnsARecord = resolveValue(diff, tfPlan, tfEntry, 'enable_resource_name_dns_a_record_on_launch');
  let privateDnsNameOptionsOnLaunch: Json;
  if (privateDnsHostnameTypeOnLaunch || enableResourceNameDnsAAAARecord || enableResourceNameDnsARecord) {
    privateDnsNameOptionsOnLaunch = {
      enableResourceNameDnsAAAARecord,
      enableResourceNameDnsARecord,
      privateDnsHostnameTypeOnLaunch
    };
  }
  const vpcId = resolveValue(diff, tfPlan, tfEntry, 'vpc_id');
  const tagSet = resolveValue(diff, tfPlan, tfEntry, 'tags');

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
function parseRouteTableAssociation (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], tfJson: JsonFile[]): Json {
  const tfEntry = getTfEntry(diff, tfJson);

  const gatewayId = resolveValue(diff, tfPlan, tfEntry, 'gateway_id');
  const routeTableId = resolveValue(diff, tfPlan, tfEntry, 'route_table_id');
  const subnetId = resolveValue(diff, tfPlan, tfEntry, 'subnet_id');

  return {
    gatewayId,
    routeTableId,
    subnetId
  };
}

// https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_Route.html
function parseRoute (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], tfJson: JsonFile[]): Json {
  const tfEntry = getTfEntry(diff, tfJson);

  const carrierGatewayId = resolveValue(diff, tfPlan, tfEntry, 'carrier_gateway_id');
  const coreNetworkArn = resolveValue(diff, tfPlan, tfEntry, 'core_network_arn');
  const destinationCidrBlock = resolveValue(diff, tfPlan, tfEntry, 'destination_cidr_block');
  const destinationIpv6CidrBlock = resolveValue(diff, tfPlan, tfEntry, 'destination_ipv6_cidr_block');
  const destinationPrefixListId = resolveValue(diff, tfPlan, tfEntry, 'destination_prefix_list_id');
  const egressOnlyInternetGatewayId = resolveValue(diff, tfPlan, tfEntry, 'egress_only_gateway_id');
  const gatewayId = resolveValue(diff, tfPlan, tfEntry, 'gateway_id');
  const instanceId = resolveValue(diff, tfPlan, tfEntry, 'instance_id');
  const localGatewayId = resolveValue(diff, tfPlan, tfEntry, 'local_gateway_id');
  const natGatewayId = resolveValue(diff, tfPlan, tfEntry, 'nat_gateway_id');
  const networkInterfaceId = resolveValue(diff, tfPlan, tfEntry, 'network_interface_id');
  const transitGatewayId = resolveValue(diff, tfPlan, tfEntry, 'transit_gateway_id');
  const vpcPeeringConnectionId = resolveValue(diff, tfPlan, tfEntry, 'vpc_peering_connection_id');
  const vpcEndpointId = resolveValue(diff, tfPlan, tfEntry, 'vpc_endpoint_id');

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

interface TfJsonEntry {
  type: string;
  logicalId: string;
  properties: Json
}

// https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_RouteTable.html
function parseRouteTable (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], tfJson: JsonFile[]): Json {
  const { logicalId } = diff;
  const tfEntry = getTfEntry(diff, tfJson);
  
  const resourceEntries = tfJson.reduce<TfJsonEntry[]>((acc, tfConfig: Json) => {
    const configResources = tfConfig.contents?.resource || {};
    Object.entries(configResources).forEach(([resourceType, resourceMap]) => {
      Object.entries(resourceMap).forEach(([resourceLogicalId, resource]) => {
        acc.push({
          type: resourceType,
          logicalId: resourceLogicalId,
          properties: (resource as Json[])?.at(0)
        });
      });
    });
    return acc;
  }, []);

  const associationSet = resourceEntries.filter((entry: TfJsonEntry) => 
    entry.type === TF_ROUTE_TABLE_ASSOCIATION &&
    entry.properties?.route_table_id?.includes(logicalId)
  )
    .map((entry: TfJsonEntry) => {
      const gatewayId = resolveValue(diff, tfPlan, entry.properties, 'gateway_id');
      const routeTableId = resolveValue(diff, tfPlan, entry.properties, 'route_table_id');
      const subnetId = resolveValue(diff, tfPlan, entry.properties, 'subnet_id');

      return {
        gatewayId,
        routeTableId,
        subnetId
      };
    });

  const routeSet = [];
  if (tfEntry?.route) {
    routeSet.push(
      ...tfEntry.route.map((route: Json) => {
        const carrierGatewayId = resolveValue(diff, tfPlan, route, 'carrier_gateway_id');
        const coreNetworkArn = resolveValue(diff, tfPlan, route, 'core_network_arn');
        const destinationCidrBlock = resolveValue(diff, tfPlan, route, 'destination_cidr_block');
        const destinationIpv6CidrBlock = resolveValue(diff, tfPlan, route, 'destination_ipv6_cidr_block');
        const destinationPrefixListId = resolveValue(diff, tfPlan, route, 'destination_prefix_list_id');
        const egressOnlyInternetGatewayId = resolveValue(diff, tfPlan, route, 'egress_only_gateway_id');
        const gatewayId = resolveValue(diff, tfPlan, route, 'gateway_id');
        const instanceId = resolveValue(diff, tfPlan, route, 'instance_id');
        const localGatewayId = resolveValue(diff, tfPlan, route, 'local_gateway_id');
        const natGatewayId = resolveValue(diff, tfPlan, route, 'nat_gateway_id');
        const networkInterfaceId = resolveValue(diff, tfPlan, route, 'network_interface_id');
        const transitGatewayId = resolveValue(diff, tfPlan, route, 'transit_gateway_id');
        const vpcPeeringConnectionId = resolveValue(diff, tfPlan, route, 'vpc_peering_connection_id');
        const vpcEndpointId = resolveValue(diff, tfPlan, route, 'vpc_endpoint_id');

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
      })
    );
  } else {
    routeSet.push(
      ...resourceEntries.filter((entry: TfJsonEntry) => 
        entry.type === TF_ROUTE &&
        entry.properties?.route_table_id?.includes(logicalId)
      )
        .map((entry: TfJsonEntry) => {
          const carrierGatewayId = resolveValue(diff, tfPlan, entry.properties, 'carrier_gateway_id');
          const coreNetworkArn = resolveValue(diff, tfPlan, entry.properties, 'core_network_arn');
          const destinationCidrBlock = resolveValue(diff, tfPlan, entry.properties, 'destination_cidr_block');
          const destinationIpv6CidrBlock = resolveValue(diff, tfPlan, entry.properties, 'destination_ipv6_cidr_block');
          const destinationPrefixListId = resolveValue(diff, tfPlan, entry.properties, 'destination_prefix_list_id');
          const egressOnlyInternetGatewayId = resolveValue(diff, tfPlan, entry.properties, 'egress_only_gateway_id');
          const gatewayId = resolveValue(diff, tfPlan, entry.properties, 'gateway_id');
          const instanceId = resolveValue(diff, tfPlan, entry.properties, 'instance_id');
          const localGatewayId = resolveValue(diff, tfPlan, entry.properties, 'local_gateway_id');
          const natGatewayId = resolveValue(diff, tfPlan, entry.properties, 'nat_gateway_id');
          const networkInterfaceId = resolveValue(diff, tfPlan, entry.properties, 'network_interface_id');
          const transitGatewayId = resolveValue(diff, tfPlan, entry.properties, 'transit_gateway_id');
          const vpcPeeringConnectionId = resolveValue(diff, tfPlan, entry.properties, 'vpc_peering_connection_id');
          const vpcEndpointId = resolveValue(diff, tfPlan, entry.properties, 'vpc_endpoint_id');

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
        })
    );
  }

    
  const tagSet = resolveValue(diff, tfPlan, tfEntry, 'tags');
  const vpcId = resolveValue(diff, tfPlan, tfEntry, 'vpc_id');

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
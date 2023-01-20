import { 
  parseNatGateway,
  parseRoute,
  parseRouteTable,
  parseRouteTableAssociation,
  parseSubnet,
  parseVpc
 } from '../../../../src/commands/smoke-test/parser/aws-cdk/tinystacks-aws-cdk-parser/vpc';
import { CloudformationTypes } from '../../../../src/commands/smoke-test/smoke-tests/aws/resources';
import { CDK_DIFF_CREATE_SYMBOL } from '../../../../src/constants';
import { CdkDiff, Json } from '../../../../src/types';

describe('VPC Resource Parser', () => {
  it('parseVpc', () => {
    const mockDiff: CdkDiff = {
      cdkPath: 'Vpc/Vpc/Resource',
      logicalId: 'VpcC3027511',
      changeTypeSymbol: CDK_DIFF_CREATE_SYMBOL,
      resourceType: CloudformationTypes.CFN_VPC
    };
    const mockCloudformationTemplate: Json = {
      Resources: {
        'VpcC3027511': {
          'Type': 'AWS::EC2::VPC',
          'Properties': {
           'CidrBlock': '10.40.0.0/16',
           'EnableDnsHostnames': true,
           'EnableDnsSupport': true,
           'InstanceTenancy': 'default',
           'Tags': [
            {
             'Key': 'Name',
             'Value': 'SmokeTestApp/Vpc/Vpc'
            }
           ]
          },
          'Metadata': {
           'aws:cdk:path': 'SmokeTestApp/Vpc/Vpc/Resource'
          }
         }
      }
    };

    const parsedVpc = parseVpc(mockDiff, mockCloudformationTemplate);

    expect(parsedVpc).toHaveProperty('cidrBlock', '10.40.0.0/16');
    expect(parsedVpc).toHaveProperty('instanceTenancy', 'default');
    expect(parsedVpc).toHaveProperty('tagSet', [{ 'Key':'Name', 'Value':'SmokeTestApp/Vpc/Vpc' }]);
  });
  it('parseNatGateway', () => {
    const mockDiff: CdkDiff = {
      cdkPath: 'Vpc/Vpc/PublicSubnetSubnet1',
      logicalId: 'VpcPublicSubnetSubnet1NATGatewayEDDB9575',
      changeTypeSymbol: CDK_DIFF_CREATE_SYMBOL,
      resourceType: CloudformationTypes.CFN_NAT_GATEWAY
    };
    const mockCloudformationTemplate: Json = {
      Resources: {
        'VpcPublicSubnetSubnet1NATGatewayEDDB9575': {
          'Type': 'AWS::EC2::NatGateway',
          'Properties': {
            'SubnetId': {
              'Ref': 'VpcPublicSubnetSubnet1SubnetCE01ADA6'
            },
            'AllocationId': {
              'Fn::GetAtt': [
                'VpcPublicSubnetSubnet1EIP4F45FFE5',
                'AllocationId'
              ]
            },
            'Tags': [
              {
                'Key': 'Name',
                'Value': 'SmokeTestApp/Vpc/Vpc/PublicSubnetSubnet1'
              }
            ]
          },
          'Metadata': {
            'aws:cdk:path': 'SmokeTestApp/Vpc/Vpc/PublicSubnetSubnet1/NATGateway'
          }
        }
      }
    };
    
    const parsedNat = parseNatGateway(mockDiff, mockCloudformationTemplate);
    
    expect(parsedNat).toHaveProperty('subnetId', { 'Ref': 'VpcPublicSubnetSubnet1SubnetCE01ADA6' });
    expect(parsedNat).toHaveProperty('tagSet', [{ 'Key': 'Name', 'Value': 'SmokeTestApp/Vpc/Vpc/PublicSubnetSubnet1' }]);
  });
  it('parseSubnet', () => {
    const mockDiff: CdkDiff = {
      cdkPath: 'Vpc/Vpc/PublicSubnetSubnet1/Subnet',
      logicalId: 'VpcPublicSubnetSubnet1SubnetCE01ADA6',
      changeTypeSymbol: CDK_DIFF_CREATE_SYMBOL,
      resourceType: CloudformationTypes.CFN_SUBNET
    };
    const mockCloudformationTemplate: Json = {
      Resources: {
        'VpcPublicSubnetSubnet1SubnetCE01ADA6': {
          'Type': 'AWS::EC2::Subnet',
          'Properties': {
            'VpcId': {
              'Ref': 'VpcC3027511'
            },
            'AvailabilityZone': {
              'Fn::Select': [
                0,
                {
                  'Fn::GetAZs': ''
                }
              ]
            },
            'CidrBlock': '10.40.64.0/19',
            'MapPublicIpOnLaunch': true,
            'Tags': [
              {
                'Key': 'aws-cdk:subnet-name',
                'Value': 'PublicSubnet'
              },
              {
                'Key': 'aws-cdk:subnet-type',
                'Value': 'Public'
              },
              {
                'Key': 'Name',
                'Value': 'SmokeTestApp/Vpc/Vpc/PublicSubnetSubnet1'
              }
            ]
          },
          'Metadata': {
            'aws:cdk:path': 'SmokeTestApp/Vpc/Vpc/PublicSubnetSubnet1/Subnet'
          }
        }
      }
    };
    
    const parsedSubnet = parseSubnet(mockDiff, mockCloudformationTemplate);
    
    expect(parsedSubnet).toHaveProperty('vpcId', { 'Ref': 'VpcC3027511' });
    expect(parsedSubnet).toHaveProperty('availabilityZone', {
      'Fn::Select': [
        0,
        {
          'Fn::GetAZs': ''
        }
      ]
    });
    expect(parsedSubnet).toHaveProperty('cidrBlock', '10.40.64.0/19');
    expect(parsedSubnet).toHaveProperty('mapPublicIpOnLaunch', true);
    expect(parsedSubnet).toHaveProperty('tagSet', [
      {
        'Key': 'aws-cdk:subnet-name',
        'Value': 'PublicSubnet'
      },
      {
        'Key': 'aws-cdk:subnet-type',
        'Value': 'Public'
      },
      {
        'Key': 'Name',
        'Value': 'SmokeTestApp/Vpc/Vpc/PublicSubnetSubnet1'
      }
    ]);
  });
  it('parseRouteTableAssociation', () => {
    const mockDiff: CdkDiff = {
      cdkPath: 'Vpc/Vpc/PublicSubnetSubnet1/RouteTableAssociation',
      logicalId: 'VpcPublicSubnetSubnet1RouteTableAssociationAF3B2E14',
      changeTypeSymbol: CDK_DIFF_CREATE_SYMBOL,
      resourceType: CloudformationTypes.CFN_ROUTE_TABLE_ASSOCIATION
    };
    const mockCloudformationTemplate: Json = {
      Resources: {
        'VpcPublicSubnetSubnet1RouteTableAssociationAF3B2E14': {
          'Type': 'AWS::EC2::SubnetRouteTableAssociation',
          'Properties': {
           'RouteTableId': {
            'Ref': 'VpcPublicSubnetSubnet1RouteTableD16E6674'
           },
           'SubnetId': {
            'Ref': 'VpcPublicSubnetSubnet1SubnetCE01ADA6'
           }
          },
          'Metadata': {
           'aws:cdk:path': 'SmokeTestApp/Vpc/Vpc/PublicSubnetSubnet1/RouteTableAssociation'
          }
        }
      }
    };
  
    const parsedRta = parseRouteTableAssociation(mockDiff, mockCloudformationTemplate);
  
    expect(parsedRta).toHaveProperty('routeTableId', { 'Ref': 'VpcPublicSubnetSubnet1RouteTableD16E6674' });
    expect(parsedRta).toHaveProperty('subnetId', { 'Ref': 'VpcPublicSubnetSubnet1SubnetCE01ADA6' });
  });
  it('parseRoute', () => {
    const mockDiff: CdkDiff = {
      cdkPath: 'Vpc/Vpc/PublicSubnetSubnet1/DefaultRoute',
      logicalId: 'VpcPublicSubnetSubnet1DefaultRoute0E1DFC20',
      changeTypeSymbol: CDK_DIFF_CREATE_SYMBOL,
      resourceType: CloudformationTypes.CFN_ROUTE
    };
    const mockCloudformationTemplate: Json = {
      Resources: {
        'VpcPublicSubnetSubnet1DefaultRoute0E1DFC20': {
          'Type': 'AWS::EC2::Route',
          'Properties': {
           'RouteTableId': {
            'Ref': 'VpcPublicSubnetSubnet1RouteTableD16E6674'
           },
           'DestinationCidrBlock': '0.0.0.0/0',
           'GatewayId': {
            'Ref': 'VpcIGW488B0FEB'
           }
          },
          'DependsOn': [
           'VpcVPCGW42EC8516'
          ],
          'Metadata': {
           'aws:cdk:path': 'SmokeTestApp/Vpc/Vpc/PublicSubnetSubnet1/DefaultRoute'
          }
         }
      }
    };
  
    const parsedRoute = parseRoute(mockDiff, mockCloudformationTemplate);
  
    expect(parsedRoute).toHaveProperty('destinationCidrBlock', '0.0.0.0/0');
    expect(parsedRoute).toHaveProperty('gatewayId', { 'Ref': 'VpcIGW488B0FEB' });
  });
  it('parseRouteTable', () => {
    const mockDiff: CdkDiff = {
      cdkPath: 'Vpc/Vpc/PublicSubnetSubnet1/RouteTable',
      logicalId: 'VpcPublicSubnetSubnet1RouteTableD16E6674',
      changeTypeSymbol: CDK_DIFF_CREATE_SYMBOL,
      resourceType: CloudformationTypes.CFN_ROUTE_TABLE
    };
    const mockCloudformationTemplate: Json = require('../../../test-data/vpc-stack/cdk/with-nat/template.json');
  
    const parsedRouteTable = parseRouteTable(mockDiff, mockCloudformationTemplate);
  
    expect(parsedRouteTable).toHaveProperty('vpcId', { 'Ref': 'VpcC3027511' });
    expect(parsedRouteTable).toHaveProperty('associationSet', [
      {
        routeTableId: { 'Ref': 'VpcPublicSubnetSubnet1RouteTableD16E6674' },
        subnetId: { 'Ref': 'VpcPublicSubnetSubnet1SubnetCE01ADA6' }
      }
    ]);
    expect(parsedRouteTable).toHaveProperty('routeSet', [
      {
        destinationCidrBlock: '0.0.0.0/0',
        gatewayId: { 'Ref': 'VpcIGW488B0FEB' }
      }
    ]);
    expect(parsedRouteTable).toHaveProperty('tagSet', [
      {
        'Key': 'Name',
        'Value': 'SmokeTestApp/Vpc/Vpc/PublicSubnetSubnet1'
      }
    ]);
  });
});
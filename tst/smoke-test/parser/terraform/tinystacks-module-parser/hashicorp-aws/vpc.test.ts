import * as fs from 'fs';
import * as path from 'path';
import { TfDiff } from '../../../../../../src/types';
import {
  parseNatGateway,
  parseRoute,
  parseRouteTable,
  parseRouteTableAssociation,
  parseSubnet,
  parseVpc
} from '../../../../../../src/commands/smoke-test/parser/terraform/tinystacks-module-parser/hashicorp-aws';

const mockTfFile = fs.readFileSync(path.resolve(__dirname, '../../../../test-data/tf-module-stack/main.tf')).toString();
const mockTfJson = require('../../../../test-data/tf-module-stack/tf-json.json');
const mockTfPlan = require('../../../../test-data/tf-module-stack/plan.json');

const mockTfFiles = [
  {
    name: 'main.tf',
    contents: mockTfFile
  }
];

describe('Terraform Vpc Module Parser Tests', () => {
  it('parseVpc', () => {
    const mockDiff: TfDiff = {
      action: 'create',
      resourceType: 'aws_vpc',
      address: 'module.my_vpc.aws_vpc.ts_aws_vpc',
      logicalId: 'ts_aws_vpc'
    };

    const parsedVpc = parseVpc(mockDiff, mockTfPlan, mockTfFiles, mockTfJson);

    expect(parsedVpc).toHaveProperty('cidrBlock', '10.0.0.0/16');
    expect(parsedVpc).toHaveProperty('instanceTenancy', 'default');
  });
  it('parseNatGateway', () => {
    const mockDiff: TfDiff = {
      action: 'create',
      resourceType: 'aws_nat_gateway',
      address: 'module.my_vpc.aws_nat_gateway.ts_aws_nat_gateway',
      logicalId: 'ts_aws_nat_gateway'
    };

    const parsedNat = parseNatGateway(mockDiff, mockTfPlan, mockTfFiles, mockTfJson);

    expect(parsedNat).toHaveProperty('subnetId', 'aws_subnet.ts_aws_subnet_public_igw');
  });
  it('parseSubnet', () => {
    const mockDiff: TfDiff = {
      action: 'create',
      resourceType: 'aws_subnet',
      address: 'module.my_vpc.aws_subnet.ts_aws_subnet_private_ngw[\"us-east-1a\"]',
      logicalId: 'ts_aws_subnet_private_ngw',
      index: 'us-east-1a'
    };

    const parsedSubnet = parseSubnet(mockDiff, mockTfPlan, mockTfFiles, mockTfJson);

    expect(parsedSubnet).toHaveProperty('vpcId', 'aws_vpc.ts_aws_vpc.id');
    expect(parsedSubnet).toHaveProperty('cidrBlock', '10.0.48.0/20');
  });
  it('parseRouteTableAssociation', () => {
    const mockDiff: TfDiff = {
      action: 'create',
      resourceType: 'aws_route_table_association',
      address: 'module.my_vpc.aws_route_table_association.ts_aws_route_table_association_private_ngw["us-east-1a"]',
      logicalId: 'ts_aws_route_table_association_private_ngw',
      index: 'us-east-1a'
    };

    const parsedRta = parseRouteTableAssociation(mockDiff, mockTfPlan, mockTfFiles, mockTfJson);

    expect(parsedRta).toHaveProperty('subnetId', 'aws_subnet.ts_aws_subnet_private_ngw');
    expect(parsedRta).toHaveProperty('routeTableId', 'aws_route_table.ts_aws_route_table_private_ngw');
  });
  it('parseRoute', () => {
    const mockDiff: TfDiff = {
      action: 'create',
      resourceType: 'aws_route',
      address: 'module.my_vpc.aws_route.ts_aws_route_private_ngw["us-east-1a"]',
      logicalId: 'ts_aws_route_private_ngw',
      index: 'us-east-1a'
    };

    const parsedRoute = parseRoute(mockDiff, mockTfPlan, mockTfFiles, mockTfJson);

    expect(parsedRoute).toHaveProperty('destinationCidrBlock', '0.0.0.0/0');
    expect(parsedRoute).toHaveProperty('natGatewayId', 'aws_nat_gateway.ts_aws_nat_gateway');
  });
  it('parseRouteTable', () => {
    const mockDiff: TfDiff = {
      action: 'create',
      resourceType: 'aws_route_table',
      address: 'module.my_vpc.aws_route_table.ts_aws_route_table_private_ngw["us-east-1a"]',
      logicalId: 'ts_aws_route_table_private_ngw',
      index: 'us-east-1a'
    };

    const parsedRouteTable = parseRouteTable(mockDiff, mockTfPlan, mockTfFiles, mockTfJson);

    console.info(JSON.stringify(parsedRouteTable));

    expect(parsedRouteTable).toHaveProperty('associationSet', [
      {
        subnetId: 'aws_subnet.ts_aws_subnet_private_ngw',
        routeTableId: 'aws_route_table.ts_aws_route_table_private_ngw'
      }
    ]);
    expect(parsedRouteTable).toHaveProperty('routeSet', [
      {
        destinationCidrBlock: '0.0.0.0/0',
        natGatewayId: 'aws_nat_gateway.ts_aws_nat_gateway'
      }
    ]);
  });
});
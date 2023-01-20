import * as fs from 'fs';
import * as path from 'path';
import { TfDiff } from '../../../../../src/types';
import {
  parseNatGateway,
  parseRoute,
  parseRouteTable,
  parseRouteTableAssociation,
  parseSubnet,
  parseVpc
} from '../../../../../src/commands/smoke-test/parser/terraform/tinystacks-resource-parser/hashicorp-aws';

const mockTfFile = fs.readFileSync(path.resolve(__dirname, '../../../../test-data/vpc-stack/tf/with-nat/main.tf')).toString();
const mockTfJson = require('../../../../test-data/vpc-stack/tf/with-nat/tf-json.json');
const mockTfPlan = require('../../../../test-data/vpc-stack/tf/with-nat/plan.json');

const mockTfFiles = [
  {
    name: 'main.tf',
    contents: mockTfFile
  }
];

describe('Terraform Vpc Resource Parser Tests', () => {
  it('parseVpc', () => {
    const mockDiff: TfDiff = {
      action: 'create',
      resourceType: 'aws_vpc',
      address: 'aws_vpc.ts_aws_vpc',
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
      address: 'aws_nat_gateway.ts_aws_nat_gateway',
      logicalId: 'ts_aws_nat_gateway'
    };

    const parsedNat = parseNatGateway(mockDiff, mockTfPlan, mockTfFiles, mockTfJson);

    expect(parsedNat).toHaveProperty('subnetId', '${aws_subnet.ts_aws_subnet_public_igw.id}');
  });
  it('parseSubnet', () => {
    const mockDiff: TfDiff = {
      action: 'create',
      resourceType: 'aws_subnet',
      address: 'aws_subnet.ts_aws_subnet_private_ngw',
      logicalId: 'ts_aws_subnet_private_ngw'
    };

    const parsedSubnet = parseSubnet(mockDiff, mockTfPlan, mockTfFiles, mockTfJson);

    expect(parsedSubnet).toHaveProperty('vpcId', '${aws_vpc.ts_aws_vpc.id}');
    expect(parsedSubnet).toHaveProperty('cidrBlock', '10.0.32.0/20');
  });
  it('parseRouteTableAssociation', () => {
    const mockDiff: TfDiff = {
      action: 'create',
      resourceType: 'aws_route_table_association',
      address: 'aws_route_table_association.ts_aws_route_table_association_private_ngw',
      logicalId: 'ts_aws_route_table_association_private_ngw'
    };

    const parsedRta = parseRouteTableAssociation(mockDiff, mockTfPlan, mockTfFiles, mockTfJson);

    expect(parsedRta).toHaveProperty('subnetId', '${aws_subnet.ts_aws_subnet_private_ngw.id}');
    expect(parsedRta).toHaveProperty('routeTableId', '${aws_route_table.ts_aws_route_table_private_ngw.id}');
  });
  it('parseRoute', () => {
    const mockDiff: TfDiff = {
      action: 'create',
      resourceType: 'aws_route',
      address: 'aws_route.ts_aws_route_private_ngw',
      logicalId: 'ts_aws_route_private_ngw'
    };

    const parsedRoute = parseRoute(mockDiff, mockTfPlan, mockTfFiles, mockTfJson);

    expect(parsedRoute).toHaveProperty('destinationCidrBlock', '0.0.0.0/0');
    expect(parsedRoute).toHaveProperty('natGatewayId', '${aws_nat_gateway.ts_aws_nat_gateway.id}');
  });
  it('parseRouteTable', () => {
    const mockDiff: TfDiff = {
      action: 'create',
      resourceType: 'aws_route_table',
      address: 'aws_route_table.ts_aws_route_table_private_ngw',
      logicalId: 'ts_aws_route_table_private_ngw'
    };

    const parsedRouteTable = parseRouteTable(mockDiff, mockTfPlan, mockTfFiles, mockTfJson);

    expect(parsedRouteTable).toHaveProperty('associationSet', [
      {
        subnetId: '${aws_subnet.ts_aws_subnet_private_ngw.id}',
        routeTableId: '${aws_route_table.ts_aws_route_table_private_ngw.id}'
      }
    ]);
    expect(parsedRouteTable).toHaveProperty('routeSet', [
      {
        destinationCidrBlock: '0.0.0.0/0',
        natGatewayId: '${aws_nat_gateway.ts_aws_nat_gateway.id}'
      }
    ]);
  });
});
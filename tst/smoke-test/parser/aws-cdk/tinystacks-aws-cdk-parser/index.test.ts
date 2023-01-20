const mockParseSqsQueue = jest.fn();
const mockParseS3Bucket = jest.fn();
const mockParseEip = jest.fn();
const mockParseVpc = jest.fn();
const mockParseNatGateway = jest.fn();
const mockParseSubnet = jest.fn();
const mockParseRouteTableAssociation = jest.fn();
const mockParseRoute = jest.fn();
const mockParseRouteTable = jest.fn();

jest.mock('../../../../../src/commands/smoke-test/parser/aws-cdk/tinystacks-aws-cdk-parser/ec2', () => ({
  parseEip: mockParseEip
}));
jest.mock('../../../../../src/commands/smoke-test/parser/aws-cdk/tinystacks-aws-cdk-parser/s3', () => ({
  parseS3Bucket: mockParseS3Bucket
}));
jest.mock('../../../../../src/commands/smoke-test/parser/aws-cdk/tinystacks-aws-cdk-parser/sqs', () => ({
  parseSqsQueue: mockParseSqsQueue
}));
jest.mock('../../../../../src/commands/smoke-test/parser/aws-cdk/tinystacks-aws-cdk-parser/vpc', () => ({
  parseNatGateway: mockParseNatGateway,
  parseRoute: mockParseRoute,
  parseRouteTable: mockParseRouteTable,
  parseRouteTableAssociation: mockParseRouteTableAssociation,
  parseSubnet: mockParseSubnet,
  parseVpc: mockParseVpc
}));

import { parseResource } from '../../../../../src/commands/smoke-test/parser/aws-cdk/tinystacks-aws-cdk-parser';
import { CloudformationTypes } from '../../../../../src/commands/smoke-test/smoke-tests/aws/resources';
import { CDK_DIFF_CREATE_SYMBOL } from '../../../../../src/constants/index';
import { CdkDiff, Json } from '../../../../../src/types';

describe('tinystacks-aws-cdk-parser', () => {
  const mockCloudformationTemplate: Json = {};
  afterEach(() => {
    // for mocks
    jest.resetAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  it('returns undefined if there is no parser for the resource type', () => {
    const mockDiff: CdkDiff = {
      changeTypeSymbol: CDK_DIFF_CREATE_SYMBOL,
      resourceType: 'AWS::NOT::SUPPORTED',
      cdkPath: 'NotSupportedResource',
      logicalId: 'NotSupportedResource'
    };
    
    const parsedResource = parseResource(mockDiff, mockCloudformationTemplate);

    expect(parsedResource).toBeUndefined();
    expect(mockParseSqsQueue).not.toBeCalled();
    expect(mockParseS3Bucket).not.toBeCalled();
    expect(mockParseEip).not.toBeCalled();
    expect(mockParseVpc).not.toBeCalled();
    expect(mockParseNatGateway).not.toBeCalled();
    expect(mockParseSubnet).not.toBeCalled();
    expect(mockParseRouteTableAssociation).not.toBeCalled();
    expect(mockParseRoute).not.toBeCalled();
    expect(mockParseRouteTable).not.toBeCalled();
  });
  it('parses SQS queue', () => {
    const mockDiff: CdkDiff = {
      changeTypeSymbol: CDK_DIFF_CREATE_SYMBOL,
      resourceType: CloudformationTypes.CFN_SQS_QUEUE,
      cdkPath: 'SqsQueue',
      logicalId: 'SqsQueue'
    };
    
    parseResource(mockDiff, mockCloudformationTemplate);

    expect(mockParseSqsQueue).toBeCalled();
    expect(mockParseSqsQueue).toBeCalledWith(mockDiff, mockCloudformationTemplate);
    
    expect(mockParseS3Bucket).not.toBeCalled();
    expect(mockParseEip).not.toBeCalled();
    expect(mockParseVpc).not.toBeCalled();
    expect(mockParseNatGateway).not.toBeCalled();
    expect(mockParseSubnet).not.toBeCalled();
    expect(mockParseRouteTableAssociation).not.toBeCalled();
    expect(mockParseRoute).not.toBeCalled();
    expect(mockParseRouteTable).not.toBeCalled();
  });
  it('parses S3 bucket', () => {
    const mockDiff: CdkDiff = {
      changeTypeSymbol: CDK_DIFF_CREATE_SYMBOL,
      resourceType: CloudformationTypes.CFN_S3_BUCKET,
      cdkPath: 'S3Bucket',
      logicalId: 'S3Bucket'
    };
    
    parseResource(mockDiff, mockCloudformationTemplate);

    expect(mockParseS3Bucket).toBeCalled();
    expect(mockParseS3Bucket).toBeCalledWith(mockDiff, mockCloudformationTemplate);
    
    expect(mockParseSqsQueue).not.toBeCalled();
    expect(mockParseEip).not.toBeCalled();
    expect(mockParseVpc).not.toBeCalled();
    expect(mockParseNatGateway).not.toBeCalled();
    expect(mockParseSubnet).not.toBeCalled();
    expect(mockParseRouteTableAssociation).not.toBeCalled();
    expect(mockParseRoute).not.toBeCalled();
    expect(mockParseRouteTable).not.toBeCalled();
  });
  it('parses EIP', () => {
    const mockDiff: CdkDiff = {
      changeTypeSymbol: CDK_DIFF_CREATE_SYMBOL,
      resourceType: CloudformationTypes.CFN_EIP,
      cdkPath: 'EIP',
      logicalId: 'EIP'
    };
    
    parseResource(mockDiff, mockCloudformationTemplate);

    expect(mockParseEip).toBeCalled();
    expect(mockParseEip).toBeCalledWith(mockDiff, mockCloudformationTemplate);
    
    expect(mockParseSqsQueue).not.toBeCalled();
    expect(mockParseS3Bucket).not.toBeCalled();
    expect(mockParseVpc).not.toBeCalled();
    expect(mockParseNatGateway).not.toBeCalled();
    expect(mockParseSubnet).not.toBeCalled();
    expect(mockParseRouteTableAssociation).not.toBeCalled();
    expect(mockParseRoute).not.toBeCalled();
    expect(mockParseRouteTable).not.toBeCalled();
  });
  it('parses VPC', () => {
    const mockDiff: CdkDiff = {
      changeTypeSymbol: CDK_DIFF_CREATE_SYMBOL,
      resourceType: CloudformationTypes.CFN_VPC,
      cdkPath: 'VPC',
      logicalId: 'VPC'
    };
    
    parseResource(mockDiff, mockCloudformationTemplate);

    expect(mockParseVpc).toBeCalled();
    expect(mockParseVpc).toBeCalledWith(mockDiff, mockCloudformationTemplate);
    
    expect(mockParseSqsQueue).not.toBeCalled();
    expect(mockParseS3Bucket).not.toBeCalled();
    expect(mockParseEip).not.toBeCalled();
    expect(mockParseNatGateway).not.toBeCalled();
    expect(mockParseSubnet).not.toBeCalled();
    expect(mockParseRouteTableAssociation).not.toBeCalled();
    expect(mockParseRoute).not.toBeCalled();
    expect(mockParseRouteTable).not.toBeCalled();
  });
  it('parses Nat Gateway', () => {
    const mockDiff: CdkDiff = {
      changeTypeSymbol: CDK_DIFF_CREATE_SYMBOL,
      resourceType: CloudformationTypes.CFN_NAT_GATEWAY,
      cdkPath: 'NatGateway',
      logicalId: 'NatGateway'
    };
    
    parseResource(mockDiff, mockCloudformationTemplate);

    expect(mockParseNatGateway).toBeCalled();
    expect(mockParseNatGateway).toBeCalledWith(mockDiff, mockCloudformationTemplate);
    
    expect(mockParseSqsQueue).not.toBeCalled();
    expect(mockParseS3Bucket).not.toBeCalled();
    expect(mockParseEip).not.toBeCalled();
    expect(mockParseVpc).not.toBeCalled();
    expect(mockParseSubnet).not.toBeCalled();
    expect(mockParseRouteTableAssociation).not.toBeCalled();
    expect(mockParseRoute).not.toBeCalled();
    expect(mockParseRouteTable).not.toBeCalled();
  });
  it('parses Subnet', () => {
    const mockDiff: CdkDiff = {
      changeTypeSymbol: CDK_DIFF_CREATE_SYMBOL,
      resourceType: CloudformationTypes.CFN_SUBNET,
      cdkPath: 'Subnet',
      logicalId: 'Subnet'
    };
    
    parseResource(mockDiff, mockCloudformationTemplate);

    expect(mockParseSubnet).toBeCalled();
    expect(mockParseSubnet).toBeCalledWith(mockDiff, mockCloudformationTemplate);
    
    expect(mockParseSqsQueue).not.toBeCalled();
    expect(mockParseS3Bucket).not.toBeCalled();
    expect(mockParseEip).not.toBeCalled();
    expect(mockParseVpc).not.toBeCalled();
    expect(mockParseNatGateway).not.toBeCalled();
    expect(mockParseRouteTableAssociation).not.toBeCalled();
    expect(mockParseRoute).not.toBeCalled();
    expect(mockParseRouteTable).not.toBeCalled();
  });
  it('parses Route Table Association', () => {
    const mockDiff: CdkDiff = {
      changeTypeSymbol: CDK_DIFF_CREATE_SYMBOL,
      resourceType: CloudformationTypes.CFN_ROUTE_TABLE_ASSOCIATION,
      cdkPath: 'RouteTableAssociation',
      logicalId: 'RouteTableAssociation'
    };
    
    parseResource(mockDiff, mockCloudformationTemplate);

    expect(mockParseRouteTableAssociation).toBeCalled();
    expect(mockParseRouteTableAssociation).toBeCalledWith(mockDiff, mockCloudformationTemplate);
    
    expect(mockParseSqsQueue).not.toBeCalled();
    expect(mockParseS3Bucket).not.toBeCalled();
    expect(mockParseEip).not.toBeCalled();
    expect(mockParseVpc).not.toBeCalled();
    expect(mockParseNatGateway).not.toBeCalled();
    expect(mockParseSubnet).not.toBeCalled();
    expect(mockParseRoute).not.toBeCalled();
    expect(mockParseRouteTable).not.toBeCalled();
  });
  it('parses Route', () => {
    const mockDiff: CdkDiff = {
      changeTypeSymbol: CDK_DIFF_CREATE_SYMBOL,
      resourceType: CloudformationTypes.CFN_ROUTE,
      cdkPath: 'Route',
      logicalId: 'Route'
    };
    
    parseResource(mockDiff, mockCloudformationTemplate);

    expect(mockParseRoute).toBeCalled();
    expect(mockParseRoute).toBeCalledWith(mockDiff, mockCloudformationTemplate);
    
    expect(mockParseSqsQueue).not.toBeCalled();
    expect(mockParseS3Bucket).not.toBeCalled();
    expect(mockParseEip).not.toBeCalled();
    expect(mockParseVpc).not.toBeCalled();
    expect(mockParseNatGateway).not.toBeCalled();
    expect(mockParseSubnet).not.toBeCalled();
    expect(mockParseRouteTableAssociation).not.toBeCalled();
    expect(mockParseRouteTable).not.toBeCalled();
  });
  it('parses Route Table', () => {
    const mockDiff: CdkDiff = {
      changeTypeSymbol: CDK_DIFF_CREATE_SYMBOL,
      resourceType: CloudformationTypes.CFN_ROUTE_TABLE,
      cdkPath: 'RouteTable',
      logicalId: 'RouteTablee'
    };
    
    parseResource(mockDiff, mockCloudformationTemplate);

    expect(mockParseRouteTable).toBeCalled();
    expect(mockParseRouteTable).toBeCalledWith(mockDiff, mockCloudformationTemplate);
    
    expect(mockParseSqsQueue).not.toBeCalled();
    expect(mockParseS3Bucket).not.toBeCalled();
    expect(mockParseEip).not.toBeCalled();
    expect(mockParseVpc).not.toBeCalled();
    expect(mockParseNatGateway).not.toBeCalled();
    expect(mockParseSubnet).not.toBeCalled();
    expect(mockParseRouteTableAssociation).not.toBeCalled();
    expect(mockParseRoute).not.toBeCalled();
  });
})
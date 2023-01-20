const mockLoggerInfo = jest.fn();
const mockGetCredentials = jest.fn();
const mockDescribeVpcs = jest.fn();
const mockEc2 = jest.fn();
const mockGetAwsDefaultServiceQuota = jest.fn();
const mockServiceQuotas = jest.fn();

jest.mock('../../../../../src/logger', () => ({
  info: mockLoggerInfo
}));

jest.mock('../../../../../src/utils/aws', () => ({
  getCredentials: mockGetCredentials
}));

jest.mock('@aws-sdk/client-ec2', () => ({
  __esModule: true,
  EC2: mockEc2
}));

jest.mock('@aws-sdk/client-service-quotas', () => ({
  __esModule: true,
  ServiceQuotas: mockServiceQuotas
}));

import {
  ChangeType, IacFormat, ResourceDiffRecord
} from '../../../../../src/types';
import {
  checkVpcQuota, vpcSmokeTest
} from '../../../../../src/commands/smoke-test/smoke-tests/aws/resource-tests';

describe('vpc smoke tests', () => {
  beforeEach(() => {
    mockEc2.mockReturnValue({
      describeVpcs: mockDescribeVpcs
    });
    mockServiceQuotas.mockReturnValue({
      getAWSDefaultServiceQuota: mockGetAwsDefaultServiceQuota
    });
  });

  afterEach(() => {
    // for mocks
    jest.resetAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  describe('checkVpcQuota', () => {
    it('does nothing if change type is not create', async () => {
      const resource = {
        changeType: ChangeType.UPDATE
      } as ResourceDiffRecord;

      await checkVpcQuota([resource]);

      expect(mockLoggerInfo).not.toBeCalled();
      expect(mockGetCredentials).not.toBeCalled();
      expect(mockServiceQuotas).not.toBeCalled();
      expect(mockGetAwsDefaultServiceQuota).not.toBeCalled();
      expect(mockEc2).not.toBeCalled();
      expect(mockDescribeVpcs).not.toBeCalled();
    });
    it('validates quota would not be exceeded if change type is create', async () => {
      const resource = {
        changeType: ChangeType.CREATE,
        format: IacFormat.awsCdk,
        resourceType: 'AWS::EC2::VPC',
        resourceRecord: {
          properties: {}
        }
      } as unknown as ResourceDiffRecord;

      mockGetAwsDefaultServiceQuota.mockResolvedValueOnce({
        Quota: {
          Value: 5
        }
      });
      mockDescribeVpcs.mockResolvedValueOnce({
        Vpcs: Array(2)
      });
      

      await checkVpcQuota([resource, resource]);

      expect(mockLoggerInfo).toBeCalled();
      expect(mockLoggerInfo).toBeCalledWith('Checking VPC service quota...');
      expect(mockGetCredentials).toBeCalled();
      expect(mockGetAwsDefaultServiceQuota).toBeCalled();
      expect(mockDescribeVpcs).toBeCalled();
    });
    it('throws a QuotaError if new vpc would exceed quota limit', async () => {
      const resource = {
        changeType: ChangeType.CREATE,
        format: IacFormat.tf,
        resourceType: 'aws_vpc',
        resourceRecord: {
          properties: {}
        }
      } as unknown as ResourceDiffRecord;
      
      mockGetAwsDefaultServiceQuota.mockResolvedValueOnce({
        Quota: {
          Value: 5
        }
      });
      mockDescribeVpcs.mockResolvedValueOnce({
        Vpcs: Array(5)
      });

      let thrownError;
      try {
        await checkVpcQuota([resource]);
      } catch (error) {
        thrownError = error;
      } finally {
        expect(mockLoggerInfo).toBeCalled();
        expect(mockLoggerInfo).toBeCalledWith('Checking VPC service quota...');
        expect(mockGetCredentials).toBeCalled();
        expect(mockGetAwsDefaultServiceQuota).toBeCalled();
        expect(mockDescribeVpcs).toBeCalled();

        expect(thrownError).not.toBeUndefined();
        expect(thrownError).toHaveProperty('name', 'CustomError');
        expect(thrownError).toHaveProperty('message', 'Quota Limit Reached!');
        expect(thrownError).toHaveProperty('reason', 'This stack needs to create 1 VPC(s), but only 0 more can be created with the current quota limit! Request a quota increase or choose another region to continue.');
      }
    });
  });

  describe('vpcSmokeTest', () => {
    it('does nothing if requirePrivateSubnet is undefined', async () => {
      const mockVpc: ResourceDiffRecord = {
        "format": IacFormat.tf,
        "resourceType": "aws_vpc",
        "changeType": ChangeType.CREATE,
        "address": "module.ts_aws_vpc_hello_world.aws_vpc.ts_aws_vpc",
        "logicalId": "ts_aws_vpc",
        "providerName": "registry.terraform.io/hashicorp/aws",
        "properties": {
          "cidrBlock": "10.0.0.0/16",
          "instanceTenancy": "default",
        }
      };
      const allResources = require('../../../test-data/vpc-stack/tf/with-nat/tf-diff.json');

      let thrownError;
      try {
        await vpcSmokeTest(mockVpc, allResources, {});
      } catch (error) {
        thrownError = error;
      } finally {
        expect(mockLoggerInfo).not.toBeCalled();
        expect(thrownError).toBeUndefined();
      }
    });
    it('does nothing if requirePrivateSubnet is false', async () => {
      const mockVpc: ResourceDiffRecord = {
        "stackName": "SmokeTestApp",
        "format": IacFormat.awsCdk,
        "changeType": ChangeType.CREATE,
        "resourceType": "AWS::EC2::VPC",
        "address": "Vpc/Vpc",
        "logicalId": "VpcC3027511",
        "properties": {
          "cidrBlock": "10.40.0.0/16",
          "instanceTenancy": "default",
          "tagSet": [
            {
              "Key": "Name",
              "Value": "SmokeTestApp/Vpc/Vpc"
            }
          ]
        }
      };
      const allResources = require('../../../test-data/vpc-stack/tf/with-nat/tf-diff.json');

      let thrownError;
      try {
        await vpcSmokeTest(mockVpc, allResources, { requirePrivateSubnet: false });
      } catch (error) {
        thrownError = error;
      } finally {
        expect(mockLoggerInfo).not.toBeCalled();
        expect(thrownError).toBeUndefined();
      }
    });
    it('validates the route table for the private subnet has a route pointing to a NAT gateway', async () => {
      const mockVpc = {
        "stackName": "SmokeTestApp",
        "format": "aws-cdk",
        "changeType": "CREATE",
        "resourceType": "AWS::EC2::VPC",
        "address": "Vpc/Vpc",
        "logicalId": "VpcC3027511",
        "properties": {
          "cidrBlock": "10.40.0.0/16",
          "instanceTenancy": "default",
          "tagSet": [
            {
              "Key": "Name",
              "Value": "SmokeTestApp/Vpc/Vpc"
            }
          ]
        }
      } as ResourceDiffRecord;
      const allResources = require('../../../test-data/vpc-stack/cdk/with-nat/aws-cdk-diff.json');

      let thrownError;
      try {
        await vpcSmokeTest(mockVpc, allResources, { requirePrivateSubnet: true });
      } catch (error) {
        thrownError = error;
      } finally {
        expect(mockLoggerInfo).toBeCalled();
        expect(mockLoggerInfo).toBeCalledWith('Verifying subnet configuration...');
        expect(thrownError).toBeUndefined();
      }
    });
    it('throws if there is not a subnet with a route pointing to a NAT gateway', async () => {
      const mockVpc: ResourceDiffRecord = {
        "stackName": "SmokeTestApp",
        "format": IacFormat.awsCdk,
        "changeType": ChangeType.CREATE,
        "resourceType": "AWS::EC2::VPC",
        "address": "Vpc/Vpc",
        "logicalId": "VpcC3027511",
        "properties": {
          "cidrBlock": "10.40.0.0/16",
          "instanceTenancy": "default",
          "tagSet": [
            {
              "Key": "Name",
              "Value": "SmokeTestApp/Vpc/Vpc"
            }
          ]
        }
      };
      const allResources = require('../../../test-data/vpc-stack/cdk/no-nat/aws-cdk-diff.json');

      let thrownError;
      try {
        await vpcSmokeTest(mockVpc, allResources, { requirePrivateSubnet: true });
      } catch (error) {
        thrownError = error;
      } finally {
        expect(mockLoggerInfo).toBeCalled();
        expect(mockLoggerInfo).toBeCalledWith('Verifying subnet configuration...');
        
        expect(thrownError).toBeDefined();
        expect(thrownError).toHaveProperty('name', 'CustomError');
        expect(thrownError).toHaveProperty('message', 'Missing private subnets!');
        expect(thrownError).toHaveProperty('reason', 'Based on the configuration passed, private subnets with a NAT Gateway are required for all vpcs but none was found for "VpcC3027511".');
      }
    });
  });
});
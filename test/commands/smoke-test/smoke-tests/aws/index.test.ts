import MockResourceTester, { mockTestResource } from './MockResourceTester';
import MockQuotaChecker, { mockCheckQuotas } from './MockQuotaChecker';

jest.mock('@tinystacks/aws-resource-tests', () => MockResourceTester);
jest.mock('@tinystacks/aws-quota-checks', () => MockQuotaChecker);

import {
  testAwsResource,
  checkAwsQuotas
} from '../../../../../src/commands/smoke-test/smoke-tests/aws';
import { S3_BUCKET } from '../../../../../src/commands/smoke-test/smoke-tests/aws/resources';
import { ResourceDiffRecord } from '../../../../../src/types';

describe('aws smoke tests', () => {
  beforeEach(() => {
    process.env.VERBOSE = 'true';
  });
  afterEach(() => {
    delete process.env.VERBOSE;
  });
  it('testAwsResource', async () => {
    const mockResource = {
      resourceType: 'AWS::SQS::Queue'
    } as ResourceDiffRecord;
    
    await testAwsResource(mockResource, [mockResource], {});
  
    expect(mockTestResource).toBeCalled();
  });

  it('checkAwsQuotas', async () => {
    const mockResource = {
      resourceType: 'AWS::S3::Bucket'
    } as ResourceDiffRecord;
    
    await checkAwsQuotas(S3_BUCKET, [mockResource], {});
  
    expect(mockCheckQuotas).toBeCalled();
  });
});
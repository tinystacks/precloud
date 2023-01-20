const mockSqsQueueSmokeTest = jest.fn();
const mockCheckS3Quota = jest.fn();

jest.mock('../../../src/commands/smoke-test/smoke-tests/aws/resource-tests', () => ({
  sqsQueueSmokeTest: mockSqsQueueSmokeTest,
  checkS3Quota: mockCheckS3Quota
}));

import {
  smokeTestAwsResource,
  checkAwsQuotas
} from '../../../src/commands/smoke-test/smoke-tests/aws';
import { S3_BUCKET } from '../../../src/commands/smoke-test/smoke-tests/aws/resources';
import { ResourceDiffRecord } from '../../../src/types';

describe('aws smoke tests', () => {
  it('smokeTestAwsResource', async () => {
    const mockResource = {
      resourceType: 'AWS::SQS::Queue'
    } as ResourceDiffRecord;
    
    await smokeTestAwsResource(mockResource, [mockResource], {});
  
    expect(mockSqsQueueSmokeTest).toBeCalled();
  });

  it('checkAwsQuotas', async () => {
    const mockResource = {
      resourceType: 'AWS::S3::Bucket'
    } as ResourceDiffRecord;
    
    await checkAwsQuotas(S3_BUCKET, [mockResource]);
  
    expect(mockCheckS3Quota).toBeCalled();
  });
});

import { ResourceDiffRecord, SmokeTestOptions } from '../../../types';
import {
  SQS_QUEUE,
  S3_BUCKET,
  getStandardResourceType,
  VPC,
  EIP
} from './resources';
import {
  checkEipQuota,
  checkS3Quota,
  checkVpcQuota,
  s3BucketSmokeTest,
  sqsQueueSmokeTest,
  vpcSmokeTest
} from './resource-tests';

const smokeTests: {
  [key: string]: (resource: ResourceDiffRecord, allResources: ResourceDiffRecord[], config: SmokeTestOptions) => Promise<void>
} = {
  [SQS_QUEUE]: sqsQueueSmokeTest,
  [S3_BUCKET]: s3BucketSmokeTest,
  [VPC]: vpcSmokeTest
};

const quotaChecks: {
  [key: string]: (resources: ResourceDiffRecord[]) => Promise<void>
} = {
  [S3_BUCKET]: checkS3Quota,
  [VPC]: checkVpcQuota,
  [EIP]: checkEipQuota
};

async function smokeTestAwsResource (resource: ResourceDiffRecord, allResources: ResourceDiffRecord[], config: SmokeTestOptions) {
  const resourceType = getStandardResourceType(resource.resourceType);
  const smokeTest = smokeTests[resourceType];
  if (smokeTest) return smokeTest(resource, allResources, config);
}

async function checkAwsQuotas (resourceType: string, resources: ResourceDiffRecord[]) {
  const standardResourceType = getStandardResourceType(resourceType);
  const quotaCheck = quotaChecks[standardResourceType];
  if (quotaCheck) return quotaCheck(resources);
}

export {
  smokeTestAwsResource,
  checkAwsQuotas
};
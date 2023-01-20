import * as logger from '../../../../logger';
import { S3 } from '@aws-sdk/client-s3';
import { ServiceQuotas } from '@aws-sdk/client-service-quotas';
import { ConflictError } from '../../../../errors';
import { ChangeType, ResourceDiffRecord, SmokeTestOptions } from '../../../../types';
import { getCredentials } from '../../../../utils/aws';
import { QuotaError } from '../../../../errors/quota-error';
import { S3_BUCKET, getStandardResourceType } from '../resources';

async function checkS3Quota (resources: ResourceDiffRecord[]) {
  const newBucketCount = resources.filter(resource =>
    getStandardResourceType(resource.resourceType) === S3_BUCKET &&
    resource.changeType === ChangeType.CREATE
  ).length;

  if (newBucketCount === 0) return;
  
  logger.info('Checking S3 bucket service quota...');
  const DEFAULT_BUCKET_QUOTA = 100;
  const DEFAULT_NUMBER_OF_BUCKETS = 1;

  const config = { credentials: await getCredentials() };

  const quotaClient = new ServiceQuotas(config);
  const quotaResponse = await quotaClient.getAWSDefaultServiceQuota({
    ServiceCode: 's3',
    QuotaCode: 'L-DC2B2D3D'
  });

  const { Quota: {
    Value: s3Quota = DEFAULT_BUCKET_QUOTA
  } = {} } = quotaResponse || {};

  const s3Client = new S3(config);
  const s3Response = await s3Client.listBuckets({});
  
  const currentNumberOfBuckets = s3Response?.Buckets?.length || DEFAULT_NUMBER_OF_BUCKETS;
  const remainingNumberOfBuckets = s3Quota - currentNumberOfBuckets;
  const proposedNumberOfBuckets = currentNumberOfBuckets + newBucketCount;
  if (s3Quota < proposedNumberOfBuckets) {
    throw new QuotaError(`This stack needs to create ${newBucketCount} S3 bucket(s), but only ${remainingNumberOfBuckets} more can be created with the current quota limit!  Request a quota increase to continue.`);
  } 
}

async function validateBucketNameIsUnique (bucketName: string) {
  logger.info(`Checking if S3 bucket name ${bucketName} is unique...`);
  const s3Client = new S3({
    credentials: await getCredentials()
  });

  let error;
  try {
    await s3Client.headBucket({
      Bucket: bucketName
    });
  } catch (err) {
    error = err as any;
  }

  if (!error || error?.$metadata?.httpStatusCode === 403) {
    throw new ConflictError(`An S3 bucket with name ${bucketName} already exists!`);
  } else if (error.$metadata?.httpStatusCode !== 404) {
    throw error;
  }
}

async function s3BucketSmokeTest (resource: ResourceDiffRecord, _allResources?: ResourceDiffRecord[], _config?: SmokeTestOptions) {
  if (resource.changeType === ChangeType.CREATE) {
    if (resource.properties?.Name) await validateBucketNameIsUnique(resource.properties?.Name);
  }
}

export {
  checkS3Quota,
  s3BucketSmokeTest
};
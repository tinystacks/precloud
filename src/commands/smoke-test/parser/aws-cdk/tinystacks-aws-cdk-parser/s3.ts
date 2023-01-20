import { CdkDiff, Json } from '../../../../../types';

// https://docs.aws.amazon.com/AmazonS3/latest/API/API_Bucket.html
function parseS3Bucket (diff: CdkDiff, cloudformationTemplate: Json): Json {
  const { logicalId } = diff;
  const [ _logicalId, cfnEntry = {} ] = Object.entries<Json>(cloudformationTemplate.Resources).find(([key]) => key === logicalId) || [];
  const name = cfnEntry.Properties?.BucketName;
  return {
    Name: name
  };
}

export {
  parseS3Bucket
};
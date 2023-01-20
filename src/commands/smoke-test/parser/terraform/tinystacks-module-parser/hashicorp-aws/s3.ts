import { TfDiff, Json, TxtFile, JsonFile } from '../../../../../../types';
import { getResource } from './helpers';

// https://docs.aws.amazon.com/AmazonS3/latest/API/API_Bucket.html
function parseS3Bucket (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], _tfJson: JsonFile[]): Json {
  const resource = getResource(diff, tfPlan);
  const name = resource?.bucket;
  return {
    Name: name
  };
}

export {
  parseS3Bucket
};
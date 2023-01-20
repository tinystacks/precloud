import { TfDiff, Json, TxtFile, JsonFile } from '../../../../../types';
import { getTfEntry, resolveValue } from './helpers';

// https://docs.aws.amazon.com/AmazonS3/latest/API/API_Bucket.html
function parseS3Bucket (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], tfJson: JsonFile[]): Json {
  const tfEntry = getTfEntry(diff, tfJson);
  const name = resolveValue(diff, tfPlan, tfEntry, 'bucket');
  return {
    Name: name
  };
}

export {
  parseS3Bucket
};
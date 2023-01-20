import { TfDiff, Json, TxtFile, JsonFile } from '../../../../../../types';
import { getTfEntry, resolveValue } from './helpers';

// https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_CreateQueue.html
function parseSqsQueue (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], tfJson: JsonFile[]): Json {
  const tfEntry = getTfEntry(diff, tfJson);
  const queueName = resolveValue(diff, tfPlan, tfEntry, 'name');
  const tags = resolveValue(diff, tfPlan, tfEntry, 'tags');
  const attributes = Object.fromEntries(
    Object.entries<Json>(tfEntry || {})
      .filter(([propertyName]) => propertyName !== 'name' && propertyName !== 'tags')
      .map(([propertyName]) => [propertyName, resolveValue(diff, tfPlan, tfEntry, propertyName)])
  );
  return {
    QueueName: queueName,
    Tags: tags,
    Attributes: attributes
  };
}

export {
  parseSqsQueue
};
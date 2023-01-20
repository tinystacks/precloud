import { TfDiff, Json, TxtFile, JsonFile } from '../../../../../types';
import { getResource } from './helpers';

// https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_CreateQueue.html
function parseSqsQueue (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], _tfJson: JsonFile[]): Json {
  const resource = getResource(diff, tfPlan);
  const queueName = resource?.name;
  const tags = resource?.tags;
  const attributes = Object.fromEntries(
    Object.entries<Json>(resource || {})
      .filter(([propertyName]) => propertyName !== 'name' && propertyName !== 'tags')
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
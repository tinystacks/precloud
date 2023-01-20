import { CdkDiff, Json } from '../../../../types';

// https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_CreateQueue.html
function parseSqsQueue (diff: CdkDiff, cloudformationTemplate: Json): Json {
  const { logicalId } = diff;
  const [ _logicalId, cfnEntry = {} ] = Object.entries<Json>(cloudformationTemplate.Resources).find(([key]) => key === logicalId) || [];
  const queueName = cfnEntry.Properties?.QueueName;
  const tags = cfnEntry.Properties?.Tags;
  const attributes = Object.fromEntries(
    Object.entries<Json>(cfnEntry.Properties || {})
      .filter(([propertyName]) => propertyName !== 'QueueName' && propertyName !== 'Tags')
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
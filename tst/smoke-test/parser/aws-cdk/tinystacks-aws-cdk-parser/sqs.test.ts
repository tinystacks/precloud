import { parseSqsQueue } from "../../../../../src/commands/smoke-test/parser/aws-cdk/tinystacks-aws-cdk-parser/sqs";
import { CloudformationTypes } from "../../../../../src/commands/smoke-test/smoke-tests/aws/resources";
import { CDK_DIFF_CREATE_SYMBOL } from "../../../../../src/constants";
import { CdkDiff, Json } from "../../../../../src/types";

describe('SQS Resource Parser', () => {
  it('parseSqsQueue', () => {
    const mockDiff: CdkDiff = {
      cdkPath: 'SmokeTestQueue/Resource',
      logicalId: 'SmokeTestQueueB0847F6A',
      changeTypeSymbol: CDK_DIFF_CREATE_SYMBOL,
      resourceType: CloudformationTypes.CFN_SQS_QUEUE
    };
    const mockCloudformationTemplate: Json = {
      Resources: {
        "SmokeTestQueueB0847F6A": {
          "Type": "AWS::SQS::Queue",
          "Properties": {
           "QueueName": "smoke-test-queue",
           "VisibilityTimeout": 45
          },
          "UpdateReplacePolicy": "Delete",
          "DeletionPolicy": "Delete",
          "Metadata": {
           "aws:cdk:path": "TestStack/SmokeTestQueue/Resource"
          }
         }
      }
    };

    const parsedQueue = parseSqsQueue(mockDiff, mockCloudformationTemplate);

    expect(parsedQueue).toHaveProperty('QueueName', 'smoke-test-queue');
    expect(parsedQueue).toHaveProperty('Attributes', {
      "VisibilityTimeout": 45
    });
  })
});
import * as fs from 'fs';
import * as path from 'path';
import { TfDiff } from '../../../../../../src/types';
import { parseSqsQueue } from '../../../../../../src/commands/smoke-test/parser/terraform/tinystacks-resource-parser/hashicorp-aws';

const mockTfFile = fs.readFileSync(path.resolve(__dirname, '../../../../test-data/vpc-stack/tf/with-nat/main.tf')).toString();
const mockTfJson = require('../../../../test-data/vpc-stack/tf/with-nat/tf-json.json');
const mockTfPlan = require('../../../../test-data/vpc-stack/tf/with-nat/plan.json');

const mockTfFiles = [
  {
    name: 'main.tf',
    contents: mockTfFile
  }
];

describe('Terraform SQS Resource Parser Tests', () => {
  it('parseSqsQueue', () => {
    const mockDiff: TfDiff = {
      action: 'create',
      resourceType: 'aws_sqs_queue',
      address: 'aws_sqs_queue.ts_queue',
      logicalId: 'ts_queue'
    };

    const parsedQueue = parseSqsQueue(mockDiff, mockTfPlan, mockTfFiles, mockTfJson);

    expect(parsedQueue).toHaveProperty('QueueName', 'smoke-test-queue');
    expect(parsedQueue).toHaveProperty('Attributes', {
      "visibility_timeout": 45
    });
  });
});
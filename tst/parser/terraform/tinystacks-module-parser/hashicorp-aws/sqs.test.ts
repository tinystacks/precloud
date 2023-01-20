import * as fs from 'fs';
import * as path from 'path';
import { TfDiff } from '../../../../../src/types';
import { parseSqsQueue } from '../../../../../src/commands/smoke-test/parser/terraform/tinystacks-module-parser/hashicorp-aws';

const mockTfFile = fs.readFileSync(path.resolve(__dirname, '../../../../test-data/tf-module-stack/main.tf')).toString();
const mockTfJson = require('../../../../test-data/tf-module-stack/tf-json.json');
const mockTfPlan = require('../../../../test-data/tf-module-stack/plan.json');

const mockTfFiles = [
  {
    name: 'main.tf',
    contents: mockTfFile
  }
];

describe('Terraform SQS Module Parser Tests', () => {
  xit('parseSqsQueue', () => {
    // no sqs queue in current module
    const mockDiff: TfDiff = {
      action: 'create',
      resourceType: 'aws_sqs_queue',
      address: 'module.my_vpc.aws_sqs_queue.ts_queue',
      logicalId: 'ts_queue'
    };

    const parsedQueue = parseSqsQueue(mockDiff, mockTfPlan, mockTfFiles, mockTfJson);

    expect(parsedQueue).toHaveProperty('QueueName', 'smoke-test-queue');
    expect(parsedQueue).toHaveProperty('Attributes', {
      "visibility_timeout": 45
    });
  });
});
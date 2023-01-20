import * as fs from 'fs';
import * as path from 'path';
import { TfDiff } from '../../../../../src/types';
import { parseS3Bucket } from '../../../../../src/commands/smoke-test/parser/terraform/tinystacks-module-parser/hashicorp-aws';

const mockTfFile = fs.readFileSync(path.resolve(__dirname, '../../../../test-data/tf-module-stack/main.tf')).toString();
const mockTfJson = require('../../../../test-data/tf-module-stack/tf-json.json');
const mockTfPlan = require('../../../../test-data/tf-module-stack/plan.json');

const mockTfFiles = [
  {
    name: 'main.tf',
    contents: mockTfFile
  }
];

describe('Terraform S3 Module Parser Tests', () => {
  xit('parseS3Bucket', () => {
    // no s3 bucket in current module
    const mockDiff: TfDiff = {
      action: 'create',
      resourceType: 'aws_s3_bucket',
      address: 'module.my_vpc.aws_s3_bucket.ts_bucket',
      logicalId: 'ts_bucket'
    };

    const parsedBucket = parseS3Bucket(mockDiff, mockTfPlan, mockTfFiles, mockTfJson);

    expect(parsedBucket).toHaveProperty('Name', 'smoke-test-bucket');
  });
});
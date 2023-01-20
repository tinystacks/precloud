import * as fs from 'fs';
import * as path from 'path';
import { TfDiff } from '../../../../../../src/types';
import { parseEip } from '../../../../../../src/commands/smoke-test/parser/terraform/tinystacks-resource-parser/hashicorp-aws';

const mockTfFile = fs.readFileSync(path.resolve(__dirname, '../../../../test-data/vpc-stack/tf/with-nat/main.tf')).toString();
const mockTfJson = require('../../../../test-data/vpc-stack/tf/with-nat/tf-json.json');
const mockTfPlan = require('../../../../test-data/vpc-stack/tf/with-nat/plan.json');

const mockTfFiles = [
  {
    name: 'main.tf',
    contents: mockTfFile
  }
];

describe('Terraform EC2 Resource Parser Tests', () => {
  it('parseEip', () => {
    const mockDiff: TfDiff = {
      action: 'create',
      resourceType: 'aws_eip',
      address: 'aws_eip.ts_aws_eip_nat',
      logicalId: 'ts_aws_eip_nat'
    };

    const parsedEip = parseEip(mockDiff, mockTfPlan, mockTfFiles, mockTfJson);

    expect(parsedEip).toHaveProperty('domain', 'vpc');
  });
});
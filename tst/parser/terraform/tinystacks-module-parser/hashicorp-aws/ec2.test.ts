import * as fs from 'fs';
import * as path from 'path';
import { TfDiff } from '../../../../../src/types';
import { parseEip } from '../../../../../src/commands/smoke-test/parser/terraform/tinystacks-module-parser/hashicorp-aws';

const mockTfFile = fs.readFileSync(path.resolve(__dirname, '../../../../test-data/tf-module-stack/main.tf')).toString();
const mockTfJson = require('../../../../test-data/tf-module-stack/tf-json.json');
const mockTfPlan = require('../../../../test-data/tf-module-stack/plan.json');

const mockTfFiles = [
  {
    name: 'main.tf',
    contents: mockTfFile
  }
];

describe('Terraform EC2 Module Parser Tests', () => {
  it('parseEip', () => {
    const mockDiff: TfDiff = {
      action: 'create',
      resourceType: 'aws_eip',
      address: 'module.my_vpc.aws_eip.ts_aws_eip_nat',
      logicalId: 'ts_aws_eip_nat'
    };

    const parsedEip = parseEip(mockDiff, mockTfPlan, mockTfFiles, mockTfJson);

    expect(parsedEip).toHaveProperty('domain', 'vpc');
  });
});
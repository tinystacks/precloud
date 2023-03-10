import { MockParser } from './MockParser';
const mockResolve = jest.fn();
const mockReadFileSync = jest.fn();

jest.mock('path', () => {
  const original = jest.requireActual('path');
  return {
    resolve: mockResolve,
    realResolve: original.resolve
  };
});

jest.mock('fs', () => {
  const original = jest.requireActual('fs');
  return {
    readFileSync: mockReadFileSync,
    realRFS: original.readFileSync
  };
});

jest.mock('@tinystacks/terraform-resource-parser', () => (MockParser));
jest.mock('@tinystacks/terraform-module-parser', () => (MockParser));

import {
  parseTerraformDiff
} from '../../../../../src/commands/check/parser/terraform';
import { ChangeType, IacFormat } from '../../../../../src/types';

const fs = require('fs');
const path = require('path');

// TODO: update test data with a tf plan that performs a replacement to test "afterAction" branch
const mockSimpleTfPlan = fs.realRFS(path.realResolve(__dirname, '../../test-data/simple-sqs-stack/MockTfPlan.json'));
const mockComplexTfPlan = fs.realRFS(path.realResolve(__dirname, '../../test-data/tf-module-stack/plan.json'));

describe('aws-cdk parser', () => {
  beforeEach(() => {
    // because we're not returning mock values from mockParseResource
    jest.spyOn(global.console, 'warn').mockReturnValue();
  });
  afterEach(() => {
    mockReadFileSync.mockReset();
  });

  describe('parseTerraformDiff', () => {
    it ('capture resource type and change type correctly', async () => {
      mockReadFileSync.mockReturnValueOnce(mockSimpleTfPlan);
      
      const result = await parseTerraformDiff('mock-file', {});
      
      expect(Array.isArray(result)).toEqual(true);
      expect(result.length).toEqual(3);
      
      expect(result[0]).toHaveProperty('format', IacFormat.tf);
      expect(result[0]).toHaveProperty('resourceType', 'aws_sqs_queue');
      expect(result[0]).toHaveProperty('changeType', ChangeType.UPDATE);
      expect(result[0]).toHaveProperty('properties');
      
      expect(result[1]).toHaveProperty('format', IacFormat.tf);
      expect(result[1]).toHaveProperty('resourceType', 'aws_sqs_queue');
      expect(result[1]).toHaveProperty('changeType', ChangeType.DELETE);
      expect(result[1]).toHaveProperty('properties');
      
      expect(result[2]).toHaveProperty('format', IacFormat.tf);
      expect(result[2]).toHaveProperty('resourceType', 'aws_sqs_queue');
      expect(result[2]).toHaveProperty('changeType', ChangeType.CREATE);
      expect(result[2]).toHaveProperty('properties');
    });
    it('captures references and parses modules', async () => {
      mockReadFileSync.mockReturnValueOnce(mockComplexTfPlan);
      
      const result = await parseTerraformDiff('mock-file', {});

      expect(Array.isArray(result)).toEqual(true);
      expect(result.length).toEqual(25);

      expect(result[0]).toHaveProperty('address');
      expect(result[0].address.startsWith('module.')).toBe(true);
    });
  });
});
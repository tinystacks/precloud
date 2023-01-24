const mockExistsSync = jest.fn();
const mockMkdirSync = jest.fn();
const mockWriteFileSync = jest.fn();
const mockRunCommand = jest.fn();
const mockParseCdkDiff = jest.fn();
const mockParseTerraformDiff = jest.fn();

jest.mock('fs', () => ({
  existsSync: mockExistsSync,
  mkdirSync: mockMkdirSync,
  writeFileSync: mockWriteFileSync
}));

jest.mock('../../../src/utils/os', () => ({
  runCommand: mockRunCommand
}));

jest.mock('../../../src/commands/check/parser', () => ({
  parseCdkDiff: mockParseCdkDiff,
  parseTerraformDiff: mockParseTerraformDiff
}));

import {
  prepareForCheck
} from '../../../src/commands/check/prepare';
import { IacFormat, OsOutput } from '../../../src/types';

describe('prepare', () => {
  afterEach(() => {
    // for mocks
    jest.resetAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  describe('prepareForCheck', () => {
    it('creates tmp directory if it does not exist', async () => {
      mockExistsSync.mockReturnValueOnce(false);
      const result = await prepareForCheck({ format: 'mock-format' as IacFormat });

      expect(mockExistsSync).toBeCalled();
      expect(mockMkdirSync).toBeCalled();
      expect(mockMkdirSync).toBeCalledWith('/tmp/precloud/tmp', { recursive: true });
      expect(result).toEqual([]);
    });
    it('runs cdk diff and calls parse for cdk format', async () => {
      const mockCdkDiffOutput: OsOutput = {
        exitCode: 0,
        stderr: 'mock cdk diff',
        stdout: ''
      };
      mockExistsSync.mockReturnValueOnce(true);
      mockRunCommand.mockResolvedValueOnce(mockCdkDiffOutput);

      await prepareForCheck({ format: IacFormat.awsCdk });

      expect(mockExistsSync).toBeCalled();
      expect(mockMkdirSync).not.toBeCalled();
      
      expect(mockRunCommand).toBeCalled();
      expect(mockRunCommand).toBeCalledWith('cdk diff');

      expect(mockWriteFileSync).toBeCalled();
      expect(mockWriteFileSync).toBeCalledWith('/tmp/precloud/tmp/diff.txt', 'mock cdk diff');

      expect(mockParseCdkDiff).toBeCalled();
      expect(mockParseCdkDiff).toBeCalledWith('mock cdk diff', { format: 'aws-cdk' });
    });
    it('throws on non-zero exit code', async () => {
      const mockCdkDiffOutput: OsOutput = {
        exitCode: 1,
        stderr: 'mock cdk diff',
        stdout: ''
      };
      mockExistsSync.mockReturnValueOnce(true);
      mockRunCommand.mockResolvedValueOnce(mockCdkDiffOutput);

      let thrownError;
      try {
        await prepareForCheck({ format: IacFormat.awsCdk });
      } catch (error) {
        thrownError = error;
      } finally {
        expect(mockExistsSync).toBeCalled();
        expect(mockMkdirSync).not.toBeCalled();
        
        expect(mockRunCommand).toBeCalled();
        expect(mockRunCommand).toBeCalledWith('cdk diff');

        expect(thrownError).toHaveProperty('name', 'CliError');
        expect(thrownError).toHaveProperty('message', 'cdk diff failed with exit code 1');
  
        expect(mockWriteFileSync).not.toBeCalled();  
        expect(mockParseCdkDiff).not.toBeCalled();
      }

    });
    it('runs terraform init, plan, and show and calls parse for terraform format', async () => {
      const mockOsOutput: OsOutput = {
        exitCode: 0,
        stderr: '',
        stdout: ''
      };
      mockExistsSync.mockReturnValueOnce(true);
      mockRunCommand.mockResolvedValueOnce(mockOsOutput);
      mockRunCommand.mockResolvedValueOnce(mockOsOutput);
      mockRunCommand.mockResolvedValueOnce(mockOsOutput);

      await prepareForCheck({ format: IacFormat.tf });

      expect(mockExistsSync).toBeCalled();
      expect(mockMkdirSync).not.toBeCalled();
      
      expect(mockRunCommand).toBeCalled();
      expect(mockRunCommand).toBeCalledTimes(3);
      expect(mockRunCommand).toBeCalledWith('terraform init');
      expect(mockRunCommand).toBeCalledWith('terraform plan -out=/tmp/precloud/tmp/tfplan');
      expect(mockRunCommand).toBeCalledWith('terraform show -no-color -json /tmp/precloud/tmp/tfplan > /tmp/precloud/tmp/plan.json');

      expect(mockParseTerraformDiff).toBeCalled();
      expect(mockParseTerraformDiff).toBeCalledWith('/tmp/precloud/tmp/plan.json', { format: 'tf' });
    });
  });
});
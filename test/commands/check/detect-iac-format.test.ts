const mockResolve = jest.fn();
const mockReadDirSync = jest.fn();

jest.mock('path', () => ({
  resolve: mockResolve
}));

jest.mock('fs', () => ({
  readdirSync: mockReadDirSync
}));

import { detectIacFormat } from '../../../src/commands/check/detect-iac-format';
import { IacFormat } from '../../../src/types';

describe('detectIacFormat', () => {
  afterEach(() => {
    // for mocks
    jest.resetAllMocks();
    // for spies
    jest.restoreAllMocks();
  });
  
  it('returns aws-cdk if cdk.json is detected', () => {
    mockReadDirSync.mockReturnValue(['cdk.json']);

    const format = detectIacFormat();

    expect(format).toEqual(IacFormat.awsCdk);
  });
  it('returns tf if terraform files are detected', () => {
    mockReadDirSync.mockReturnValue(['main.tf']);

    const format = detectIacFormat();

    expect(format).toEqual(IacFormat.tf);
  });
  it('throws if both cdk and terraform files are present', () => {
    mockReadDirSync.mockReturnValue(['main.tf', 'cdk.json']);

    let thrownError;
    try {
      detectIacFormat();
    } catch (error) {
      thrownError = error;
    } finally {
      expect(thrownError).toBeDefined();
      expect(thrownError).toHaveProperty('name', 'CliError');
      expect(thrownError).toHaveProperty('message', 'Cannot determine IaC format!');
      expect(thrownError).toHaveProperty('reason', 'Both AWS cdk and terraform files exist in this repository.');
      expect(thrownError).toHaveProperty('hints', ['You can specify which format to use via the "--format" flag']);
    }
  });
  it('throws if neither cdk and terraform files are present', () => {
    mockReadDirSync.mockReturnValue([]);

    let thrownError;
    try {
      detectIacFormat();
    } catch (error) {
      thrownError = error;
    } finally {
      expect(thrownError).toBeDefined();
      expect(thrownError).toHaveProperty('name', 'CliError');
      expect(thrownError).toHaveProperty('message', 'Cannot determine IaC format!');
      expect(thrownError).toHaveProperty('reason', 'Neither AWS cdk nor terraform files exist in this repository.');
      expect(thrownError).toHaveProperty('hints', [
        'Are you running this command in the correct directory?',
        'You can specify which format to use via the "--format" flag'
      ]);
    }
  });
});
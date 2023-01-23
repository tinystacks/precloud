const mockReadFileSync = jest.fn();
const mockResolve = jest.fn();
const mockLogError = jest.fn();
jest.mock('fs', () => {
  return {
    readFileSync: mockReadFileSync
  };
});
jest.mock('path', () => {
  return {
    resolve: mockResolve
  };
});
jest.mock('../../../src/logger', () => {
  return {
    error: mockLogError
  };
});
import * as fs from 'fs';
import * as path from 'path';
import {
  getConfig
} from '../../../src/commands/smoke-test/get-config';
import { IacFormat } from '../../../src/types';

describe('get-config tests', () => {
  beforeEach(() => {
    mockResolve.mockImplementation(fileName => fileName);
  });
  afterEach(() => {
    // for mocks
    jest.resetAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  it('defaults config file name if not specified', () => {
    getConfig({});

    expect(mockResolve).toBeCalled();
    expect(mockResolve).toBeCalledWith('predeploy.config.json');
    expect(mockReadFileSync).toBeCalled();
    expect(mockReadFileSync).toBeCalledWith('predeploy.config.json');
    expect(mockLogError).not.toBeCalled();
  });
  it('defaults to empty object if the file cannot be read', () => {
    const config = getConfig({});
 
    expect(mockResolve).toBeCalled();
    expect(mockResolve).toBeCalledWith('predeploy.config.json');
    expect(mockReadFileSync).toBeCalled();
    expect(mockReadFileSync).toBeCalledWith('predeploy.config.json');
    expect(mockLogError).not.toBeCalled();

    expect(config).toEqual({});
  });
  it('logs error and defaults to empty object if the config file cannot be parsed as JSON', () => {
    mockReadFileSync.mockReturnValueOnce('not json');

    const config = getConfig({});
 
    expect(mockResolve).toBeCalled();
    expect(mockResolve).toBeCalledWith('predeploy.config.json');
    expect(mockReadFileSync).toBeCalled();
    expect(mockReadFileSync).toBeCalledWith('predeploy.config.json');
    
    expect(mockLogError).toBeCalled();
    expect(mockLogError).toBeCalledWith('Invalid config file! The contents of predeploy.config.json could not be parsed as JSON.  Correct any syntax issues and try again.');
    expect(config).toEqual({});
  });
  it('sets verbose if specified via the cli', () => {
    delete process.env.VERBOSE;
    mockReadFileSync.mockReturnValueOnce('{ "format": "aws-cdk" }');

    const config = getConfig({ verbose: true });
 
    expect(mockResolve).toBeCalled();
    expect(mockResolve).toBeCalledWith('predeploy.config.json');
    expect(mockReadFileSync).toBeCalled();
    expect(mockReadFileSync).toBeCalledWith('predeploy.config.json');
    expect(mockLogError).not.toBeCalled();
    
    expect(config).toEqual({
      format: 'aws-cdk',
      verbose: true
    });
    expect(process.env.VERBOSE).toEqual('true');
  });
  it('sets verbose if specified via the config file', () => {
    delete process.env.VERBOSE;
    mockReadFileSync.mockReturnValueOnce('{ "format": "aws-cdk", "verbose": true }');

    const config = getConfig({ configFile: 'mock.config.json' });
 
    expect(mockResolve).toBeCalled();
    expect(mockResolve).toBeCalledWith('mock.config.json');
    expect(mockReadFileSync).toBeCalled();
    expect(mockReadFileSync).toBeCalledWith('mock.config.json');
    expect(mockLogError).not.toBeCalled();
    
    expect(config).toEqual({
      format: 'aws-cdk',
      verbose: true,
      configFile: 'mock.config.json'
    });
    expect(process.env.VERBOSE).toEqual('true');
  });
  it('prioritized cli options over config values', () => {
    delete process.env.VERBOSE;
    mockReadFileSync.mockReturnValueOnce('{ "format": "aws-cdk", "verbose": true }');

    const config = getConfig({ format: IacFormat.tf, verbose: false  });
 
    expect(mockResolve).toBeCalled();
    expect(mockResolve).toBeCalledWith('predeploy.config.json');
    expect(mockReadFileSync).toBeCalled();
    expect(mockReadFileSync).toBeCalledWith('predeploy.config.json');
    expect(mockLogError).not.toBeCalled();
    
    expect(config).toEqual({
      format: 'tf',
      verbose: false
    });
    expect(process.env.VERBOSE).toEqual('false');
  });
});
const mockRed = jest.fn();
const mockMagenta = jest.fn();
const mockYellow = jest.fn();
const mockBlue = jest.fn();
const mockGray = jest.fn();
const mockGreen = jest.fn();
const mockConsole = jest.fn();

jest.mock('colors', () => ({
  red: mockRed,
  magenta: mockMagenta,
  yellow: mockYellow,
  blue: mockBlue,
  gray: mockGray,
  green: mockGreen
}));

import { CliError } from '../../src/errors';
import logger from '../../src/logger';

describe('logger', () => {
  beforeEach(() => {
    mockRed.mockImplementation(message => message);
    mockMagenta.mockImplementation(message => message);
    mockYellow.mockImplementation(message => message);
    mockBlue.mockImplementation(message => message);
    mockGray.mockImplementation(message => message);
    mockGreen.mockImplementation(message => message);

    jest.spyOn(global.console, 'error').mockImplementation(mockConsole);
    jest.spyOn(global.console, 'debug').mockImplementation(mockConsole);
    jest.spyOn(global.console, 'warn').mockImplementation(mockConsole);
    jest.spyOn(global.console, 'info').mockImplementation(mockConsole);
    jest.spyOn(global.console, 'log').mockImplementation(mockConsole);
  });

  afterEach(() => {
    // for mocks
    jest.resetAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  it('error', () => {
    logger.error('Error!');

    expect(console.error).toBeCalled();
    expect(console.error).toBeCalledWith('Error: Error!');
    expect(mockRed).toBeCalled();
    expect(mockRed).toBeCalledWith('Error: Error!');
  });

  it('debug', () => {
    logger.debug('Debug');

    expect(console.debug).toBeCalled();
    expect(console.debug).toBeCalledWith('Debug: Debug');
    expect(mockYellow).toBeCalled();
    expect(mockYellow).toBeCalledWith('Debug: Debug');
  });

  it('warn', () => {
    logger.warn('Warn');

    expect(console.warn).toBeCalled();
    expect(console.warn).toBeCalledWith('Warning: Warn');
    expect(mockYellow).toBeCalled();
    expect(mockYellow).toBeCalledWith('Warning: Warn');
  });
  
  it('info', () => {
    logger.info('Info');

    expect(console.info).toBeCalled();
    expect(console.info).toBeCalledWith('Info: Info');
    expect(mockBlue).toBeCalled();
    expect(mockBlue).toBeCalledWith('Info: Info');
  });

  it('log', () => {
    logger.log('Log');
  
    expect(console.log).toBeCalled();
    expect(console.log).toBeCalledWith('Log');
    expect(mockGray).toBeCalled();
    expect(mockGray).toBeCalledWith('Log');
  });

  it('hint', () => {
    logger.hint('Hint');
  
    expect(console.log).toBeCalled();
    expect(console.log).toBeCalledWith('Hint: Hint');
    expect(mockMagenta).toBeCalled();
    expect(mockMagenta).toBeCalledWith('Hint: Hint');
  });

  it('success', () => {
    logger.success('Success');
  
    expect(console.log).toBeCalled();
    expect(console.log).toBeCalledWith('Success: Success');
    expect(mockGreen).toBeCalled();
    expect(mockGreen).toBeCalledWith('Success: Success');
  });
  
  describe('verbose', () => {
    it('logs if VERBOSE env var is true', () => {
      process.env.VERBOSE = 'true';
      logger.verbose('Verbose');
      expect(console.log).toBeCalled();
      expect(console.log).toBeCalledWith('Verbose');
      expect(mockGray).toBeCalled();
      expect(mockGray).toBeCalledWith('Verbose');
    });
    it('does not log if VERBOSE env var is false', () => {
      process.env.VERBOSE = 'false';
      logger.verbose('Verbose');
      expect(console.log).not.toBeCalled();
      expect(mockGray).not.toBeCalled();
    });
    it('does not log if VERBOSE env var is undefined', () => {
      process.env.VERBOSE = undefined;
      logger.verbose('Verbose');
      expect(console.log).not.toBeCalled();
      expect(mockGray).not.toBeCalled();
    });
  });

  describe('cliError', () => {
    beforeEach(() => {
      jest.spyOn(logger, 'error').mockImplementation(jest.fn());
      jest.spyOn(logger, 'hint').mockImplementation(jest.fn());
      jest.spyOn(global.console, 'error').mockImplementation(jest.fn());
    });
    it ('logs with special format if the error is a CliError', () => {
      const error = new CliError('Error!', 'Test error.', 'Hint 1', 'hint 2');

      logger.cliError(error);

      expect(logger.error).toBeCalled();
      expect(logger.error).toBeCalledWith('Error!\n\tTest error.');
      expect(logger.hint).toBeCalledTimes(2);
      expect(logger.hint).toBeCalledWith('Hint 1');
      expect(logger.hint).toBeCalledWith('hint 2');
      expect(global.console.error).not.toBeCalled();
    });
    it ('logs unexpected error if the error is not a CliError', () => {
      const error = new Error('Error!');

      logger.cliError(error);

      expect(logger.error).toBeCalled();
      expect(logger.error).toBeCalledWith('An unexpected error occurred!');
      expect(logger.hint).not.toBeCalled();
      expect(global.console.error).toBeCalled();
      expect(global.console.error).toBeCalledWith(error);
    });
  });
});
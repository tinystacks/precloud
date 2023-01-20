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

import {
  error,
  debug,
  warn,
  info,
  log,
  hint,
  success
} from '../../src/logger';
import * as colors from 'colors';

describe('logger', () => {
  beforeEach(() => {
    mockRed.mockImplementation(message => message);
    mockMagenta.mockImplementation(message => message);
    mockYellow.mockImplementation(message => message);
    mockBlue.mockImplementation(message => message);
    mockGray.mockImplementation(message => message);
    mockGreen.mockImplementation(message => message);

    jest.spyOn(global.console, 'error').mockImplementation(mockConsole)
    jest.spyOn(global.console, 'debug').mockImplementation(mockConsole)
    jest.spyOn(global.console, 'warn').mockImplementation(mockConsole)
    jest.spyOn(global.console, 'info').mockImplementation(mockConsole)
    jest.spyOn(global.console, 'log').mockImplementation(mockConsole)
  });

  afterEach(() => {
    // for mocks
    jest.resetAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  it('error', () => {
    error('Error!');

    expect(console.error).toBeCalled();
    expect(console.error).toBeCalledWith('Error: Error!');
    expect(mockRed).toBeCalled();
    expect(mockRed).toBeCalledWith('Error: Error!');
  });

  it('debug', () => {
    debug('Debug');

    expect(console.debug).toBeCalled();
    expect(console.debug).toBeCalledWith('Debug: Debug');
    expect(mockYellow).toBeCalled();
    expect(mockYellow).toBeCalledWith('Debug: Debug');
  });

  it('warn', () => {
    warn('Warn');

    expect(console.warn).toBeCalled();
    expect(console.warn).toBeCalledWith('Warning: Warn');
    expect(mockYellow).toBeCalled();
    expect(mockYellow).toBeCalledWith('Warning: Warn');
  });
  
  it('info', () => {
    info('Info');

    expect(console.info).toBeCalled();
    expect(console.info).toBeCalledWith('Info: Info');
    expect(mockBlue).toBeCalled();
    expect(mockBlue).toBeCalledWith('Info: Info');
  });

  it('log', () => {
    log('Log');
  
    expect(console.log).toBeCalled();
    expect(console.log).toBeCalledWith('Log');
    expect(mockGray).toBeCalled();
    expect(mockGray).toBeCalledWith('Log');
  });

  it('hint', () => {
    hint('Hint');
  
    expect(console.log).toBeCalled();
    expect(console.log).toBeCalledWith('Hint: Hint');
    expect(mockMagenta).toBeCalled();
    expect(mockMagenta).toBeCalledWith('Hint: Hint');
  });

  it('success', () => {
    success('Success');
  
    expect(console.log).toBeCalled();
    expect(console.log).toBeCalledWith('Success: Success');
    expect(mockGreen).toBeCalled();
    expect(mockGreen).toBeCalledWith('Success: Success');
  });
});
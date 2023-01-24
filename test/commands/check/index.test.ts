const mockLoggerInfo = jest.fn();
const mockLoggerSuccess = jest.fn();
const mockDetectIacFormat = jest.fn();
const mockPrepareForCheck = jest.fn();
const mockTestResource = jest.fn();
const mockCheckTemplates = jest.fn();

jest.mock('../../../src/logger', () => ({
  info: mockLoggerInfo,
  success: mockLoggerSuccess
}));

jest.mock('../../../src/commands/check/detect-iac-format.ts', () => ({
  detectIacFormat: mockDetectIacFormat
}));

jest.mock('../../../src/commands/check/prepare.ts', () => ({
  prepareForCheck: mockPrepareForCheck
}));

jest.mock('../../../src/commands/check/checks', () => ({
  testResource: mockTestResource,
  checkTemplates: mockCheckTemplates
}));

import { check } from '../../../src/commands/check';
import { ChangeType, IacFormat } from '../../../src/types';

describe('check', () => {
  beforeEach(() => {
    mockCheckTemplates.mockResolvedValue(undefined);
    mockTestResource.mockResolvedValue(undefined);
  });
  afterEach(() => {
    // for mocks
    jest.resetAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  it('detects IaC format if not passed', async () => {
    mockDetectIacFormat.mockReturnValueOnce('mock-format');
    mockPrepareForCheck.mockResolvedValueOnce([]); // Because we don't care about the calls after this point

    await check({});

    expect(mockDetectIacFormat).toBeCalled();
    expect(mockLoggerInfo).toBeCalledWith('No IaC format specified. Using detected format: mock-format');
    expect(mockPrepareForCheck).toBeCalledWith({ format: 'mock-format' });
  });
  it('runs check on each resource returned', async () => {
    const mockSqs = {
      stackName: 'mock-stack',
      format: IacFormat.awsCdk,
      resourceType: 'AWS::SQS::Queue',
      changeType: ChangeType.CREATE,
      resourceRecord: {}
    };
    const mockVpc = {
      stackName: 'mock-stack',
      format: IacFormat.awsCdk,
      resourceType: 'AWS::EC2::VPC',
      changeType: ChangeType.CREATE,
      resourceRecord: {}
    };
    mockDetectIacFormat.mockReturnValueOnce('mock-format');
    mockPrepareForCheck.mockResolvedValueOnce([
      mockSqs,
      mockVpc
    ]);

    const mockConfig = { format: IacFormat.awsCdk };
    await check(mockConfig);

    expect(mockDetectIacFormat).not.toBeCalled();
    expect(mockLoggerInfo).not.toBeCalled();
    expect(mockPrepareForCheck).toBeCalledWith(mockConfig);
    expect(mockTestResource).toBeCalledTimes(2);
    expect(mockTestResource).toBeCalledWith(mockSqs, [mockSqs, mockVpc], mockConfig);
    expect(mockTestResource).toBeCalledWith(mockVpc, [mockSqs, mockVpc], mockConfig);
    expect(mockCheckTemplates).toBeCalledTimes(1);
    expect(mockCheckTemplates).toBeCalledWith([mockSqs, mockVpc], mockConfig);
    expect(mockLoggerSuccess).toBeCalledWith('PreCloud Check passed!');
  });
});
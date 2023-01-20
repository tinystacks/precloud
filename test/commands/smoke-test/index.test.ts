const mockLoggerInfo = jest.fn();
const mockLoggerSuccess = jest.fn();
const mockDetectIacFormat = jest.fn();
const mockPrepareForSmokeTest = jest.fn();
const mockTestResource = jest.fn();
const mockCheckTemplates = jest.fn();

jest.mock('../../../src/logger', () => ({
  info: mockLoggerInfo,
  success: mockLoggerSuccess
}));

jest.mock('../../../src/commands/smoke-test/detect-iac-format.ts', () => ({
  detectIacFormat: mockDetectIacFormat
}));

jest.mock('../../../src/commands/smoke-test/prepare.ts', () => ({
  prepareForSmokeTest: mockPrepareForSmokeTest
}));

jest.mock('../../../src/commands/smoke-test/smoke-tests', () => ({
  testResource: mockTestResource,
  checkTemplates: mockCheckTemplates
}));

import { smokeTest } from '../../../src/commands/smoke-test';
import { ChangeType, IacFormat } from '../../../src/types';

describe('smokeTest', () => {
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
    mockPrepareForSmokeTest.mockResolvedValueOnce([]); // Because we don't care about the calls after this point

    await smokeTest({});

    expect(mockDetectIacFormat).toBeCalled();
    expect(mockLoggerInfo).toBeCalledWith('No IaC format specified. Using detected format: mock-format');
    expect(mockPrepareForSmokeTest).toBeCalledWith({ format: 'mock-format' });
  });
  it('runs smoke test on each resource returned', async () => {
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
    mockPrepareForSmokeTest.mockResolvedValueOnce([
      mockSqs,
      mockVpc
    ]);

    const mockConfig = { format: IacFormat.awsCdk };
    await smokeTest(mockConfig);

    expect(mockDetectIacFormat).not.toBeCalled();
    expect(mockLoggerInfo).not.toBeCalled();
    expect(mockPrepareForSmokeTest).toBeCalledWith(mockConfig);
    expect(mockTestResource).toBeCalledTimes(2);
    expect(mockTestResource).toBeCalledWith(mockSqs, [mockSqs, mockVpc], mockConfig);
    expect(mockTestResource).toBeCalledWith(mockVpc, [mockSqs, mockVpc], mockConfig);
    expect(mockCheckTemplates).toBeCalledTimes(1);
    expect(mockCheckTemplates).toBeCalledWith([mockSqs, mockVpc], mockConfig);
    expect(mockLoggerSuccess).toBeCalledWith('Smoke test passed!');
  });
});
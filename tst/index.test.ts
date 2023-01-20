const mockLoggerInfo = jest.fn();
const mockLoggerSuccess = jest.fn();
const mockDetectIacFormat = jest.fn();
const mockPrepareForSmokeTest = jest.fn();
const mockSmokeTestAwsResource = jest.fn();
const mockCheckAwsQuotas = jest.fn();

jest.mock('../src/logger', () => ({
  info: mockLoggerInfo,
  success: mockLoggerSuccess
}));

jest.mock('../src/commands/smoke-test/detect-iac-format.ts', () => ({
  detectIacFormat: mockDetectIacFormat
}));

jest.mock('../src/commands/smoke-test/prepare.ts', () => ({
  prepareForSmokeTest: mockPrepareForSmokeTest
}));

jest.mock('../src/commands/smoke-test/smoke-tests', () => ({
  smokeTestAwsResource: mockSmokeTestAwsResource,
  checkAwsQuotas: mockCheckAwsQuotas
}));

import { smokeTest } from '../src/commands/smoke-test';
import { SQS_QUEUE, VPC } from '../src/commands/smoke-test/smoke-tests/aws/resources';
import { ChangeType, IacFormat } from '../src/types';

describe('smokeTest', () => {
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

    await smokeTest({ format: IacFormat.awsCdk });

    expect(mockDetectIacFormat).not.toBeCalled();
    expect(mockLoggerInfo).not.toBeCalled();
    expect(mockPrepareForSmokeTest).toBeCalledWith({ format: IacFormat.awsCdk });
    expect(mockSmokeTestAwsResource).toBeCalledTimes(2);
    expect(mockSmokeTestAwsResource).toBeCalledWith(mockSqs, [mockSqs, mockVpc], { format: IacFormat.awsCdk });
    expect(mockSmokeTestAwsResource).toBeCalledWith(mockVpc, [mockSqs, mockVpc], { format: IacFormat.awsCdk });
    expect(mockCheckAwsQuotas).toBeCalledTimes(2);
    expect(mockCheckAwsQuotas).toBeCalledWith(SQS_QUEUE, [mockSqs]);
    expect(mockCheckAwsQuotas).toBeCalledWith(VPC, [mockVpc]);
    expect(mockLoggerSuccess).toBeCalledWith('Smoke test passed!');
  });
});
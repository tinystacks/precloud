const mockLoggerInfo = jest.fn();
const mockGetCredentials = jest.fn();
const mockListQueues = jest.fn();
const mockSqs = jest.fn();

jest.mock('../../../../../src/logger', () => ({
  info: mockLoggerInfo
}));

jest.mock('../../../../../src/utils/aws', () => ({
  getCredentials: mockGetCredentials
}));

jest.mock('@aws-sdk/client-sqs', () => ({
  __esModule: true,
  SQS: mockSqs
}));

import {
  ChangeType, ResourceDiffRecord
} from '../../../../../src/types';
import {
  sqsQueueSmokeTest
} from '../../../../../src/commands/smoke-test/smoke-tests/aws/resource-tests';

describe('sqs smoke tests', () => {
  beforeEach(() => {
    mockSqs.mockReturnValueOnce({
      listQueues: mockListQueues
    });
  });

  afterEach(() => {
    // for mocks
    jest.resetAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  describe('sqsQueueSmokeTest', () => {
    it('does nothing if change type is not create', async () => {
      const resource = {
        changeType: ChangeType.UPDATE
      } as ResourceDiffRecord;

      await sqsQueueSmokeTest(resource);

      expect(mockLoggerInfo).not.toBeCalled();
      expect(mockGetCredentials).not.toBeCalled();
      expect(mockListQueues).not.toBeCalled();
    });
    it('validates name is unique if change type is create', async () => {
      const resource = {
        changeType: ChangeType.CREATE,
        properties: {
          QueueName: 'mock-queue'
        }
      } as unknown as ResourceDiffRecord;

      await sqsQueueSmokeTest(resource);

      expect(mockLoggerInfo).toBeCalled();
      expect(mockLoggerInfo).toBeCalledWith('Checking if queue name mock-queue is unique...');
      expect(mockGetCredentials).toBeCalled();
      expect(mockListQueues).toBeCalled();
      expect(mockListQueues).toBeCalledWith({
        QueueNamePrefix: 'mock-queue'
      });
    });
    it('throws a ConflictError if name is not unique and change type is create', async () => {
      const resource = {
        changeType: ChangeType.CREATE,
        properties: {
          QueueName: 'mock-queue'
        }
      } as unknown as ResourceDiffRecord;
      mockListQueues.mockResolvedValueOnce({
        QueueUrls: ['https://aws-stuff/mock-queue']
      })

      let thrownError;
      try {
        await sqsQueueSmokeTest(resource);
      } catch (error) {
        thrownError = error;
      } finally {
        expect(mockLoggerInfo).toBeCalled();
        expect(mockLoggerInfo).toBeCalledWith('Checking if queue name mock-queue is unique...');
        expect(mockGetCredentials).toBeCalled();
        expect(mockListQueues).toBeCalled();
        expect(mockListQueues).toBeCalledWith({
          QueueNamePrefix: 'mock-queue'
        });

        expect(thrownError).not.toBeUndefined();
        expect(thrownError).toHaveProperty('name', 'CustomError');
        expect(thrownError).toHaveProperty('message', 'Conflict!');
        expect(thrownError).toHaveProperty('reason', 'An SQS queue with name mock-queue already exists!');
      }
    });
  });
});
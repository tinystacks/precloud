const mockFromNodeProviderChain = jest.fn();
const mockFromEnv = jest.fn();

jest.mock('@aws-sdk/credential-providers', () => ({
  fromNodeProviderChain: mockFromNodeProviderChain,  
  fromEnv: mockFromEnv
}));

import {
  getCredentials
} from '../../../src/utils/aws';

describe('aws utils', () => {
  afterEach(() => {
    // for mocks
    jest.resetAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  describe('getCredentials', () => {
    it('prefers credentials from environment', async () => {
      mockFromEnv.mockReturnValueOnce(async () => 'env-creds');
      mockFromNodeProviderChain.mockReturnValueOnce(async () => 'chain-creds');

      const result = await getCredentials();

      expect(result).toEqual('env-creds');
    });
    it('return credentials from node provider chain if environment credentials are nil', async () => {
      mockFromEnv.mockReturnValueOnce((): any => undefined);
      mockFromNodeProviderChain.mockReturnValueOnce(() => 'chain-creds');

      const result = await getCredentials();

      expect(result).toEqual('chain-creds');
    });
  });
});
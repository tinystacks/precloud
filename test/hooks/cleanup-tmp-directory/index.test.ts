const mockRmSync = jest.fn();

jest.mock('fs', () => ({
  rmSync: mockRmSync
}));

import {
  cleanupTmpDirectory
} from '../../../src/hooks/cleanup-tmp-directory';

test('cleanupTmpDirectory', () => {
  cleanupTmpDirectory();
  
  expect(mockRmSync).toBeCalled();
  expect(mockRmSync).toBeCalledWith('/tmp/precloud/tmp', { recursive: true, force: true });
});
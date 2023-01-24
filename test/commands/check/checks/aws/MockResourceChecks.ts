import { ResourceChecks } from '../../../../../src/abstracts';

const mockCheckResource = jest.fn();
class MockResourceChecks extends ResourceChecks {
  checkResource = mockCheckResource;
}

export {
  mockCheckResource,
  MockResourceChecks
};
export default MockResourceChecks;
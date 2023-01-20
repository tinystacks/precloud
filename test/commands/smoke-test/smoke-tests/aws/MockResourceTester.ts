import { ResourceTester } from '../../../../../src/abstracts';

const mockTestResource = jest.fn();
class MockResourceTester extends ResourceTester {
  testResource = mockTestResource;
}

export {
  mockTestResource,
  MockResourceTester
};
export default MockResourceTester;
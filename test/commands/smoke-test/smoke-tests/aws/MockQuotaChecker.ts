import { QuotaChecker } from '../../../../../src/abstracts';

const mockCheckQuotas = jest.fn();
class MockQuotaChecker extends QuotaChecker {
  checkQuota = mockCheckQuotas;
}

export {
  mockCheckQuotas,
  MockQuotaChecker
};
export default MockQuotaChecker;
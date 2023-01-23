import { TemplateChecks } from '../../../../../src/abstracts';

const mockCheckTemplate = jest.fn();
class MockTemplateChecks extends TemplateChecks {
  checkTemplate = mockCheckTemplate;
}

export {
  mockCheckTemplate,
  MockTemplateChecks
};
export default MockTemplateChecks;
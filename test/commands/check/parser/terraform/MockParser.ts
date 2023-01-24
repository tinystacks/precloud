import { TerraformParser } from '../../../../../src/abstracts';

const mockParseResource = jest.fn();
mockParseResource.mockResolvedValue({});

class MockParser extends TerraformParser {
  constructor () { super(); }
  parseResource = mockParseResource;
}

export {
  MockParser
};
export default MockParser;
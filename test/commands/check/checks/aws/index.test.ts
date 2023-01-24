import MockResourceChecks, { mockCheckResource } from './MockResourceChecks';
import MockTemplateChecks, { mockCheckTemplate } from './MockTemplateChecks';

jest.mock('@tinystacks/aws-resource-checks', () => MockResourceChecks);
jest.mock('@tinystacks/aws-template-checks', () => MockTemplateChecks);

import {
  testResource,
  checkTemplates
} from '../../../../../src/commands/check/checks/aws';
import { ResourceDiffRecord } from '../../../../../src/types';

describe('aws schecks', () => {
  beforeEach(() => {
    process.env.VERBOSE = 'true';
  });
  afterEach(() => {
    delete process.env.VERBOSE;
  });
  it('testAwsResource', async () => {
    const mockResource = {
      resourceType: 'AWS::SQS::Queue'
    } as ResourceDiffRecord;
    
    await testResource(mockResource, [mockResource], {});
  
    expect(mockCheckResource).toBeCalled();
  });

  it('checkTemplates', async () => {
    const mockResource = {
      resourceType: 'AWS::S3::Bucket'
    } as ResourceDiffRecord;
    
    await checkTemplates([mockResource], {});
  
    expect(mockCheckTemplate).toBeCalled();
  });
});
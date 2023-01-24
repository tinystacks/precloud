import TemplateChecks from '../../../../abstracts/template-checks';
import { TINYSTACKS_AWS_TEMPLATE_CHECKS, TINYSTACKS_AWS_RESOURCE_CHECKS } from '../../../../constants';
import { ResourceDiffRecord, CheckOptions } from '../../../../types';
import logger from '../../../../logger';
import ResourceChecks from '../../../../abstracts/resource-checks';

const resourceChecksCache: {
  [name: string]: ResourceChecks
} = {};

async function tryToUseResourceChecks (resource: ResourceDiffRecord, allResources: ResourceDiffRecord[], config: CheckOptions, resourceChecksName: string): Promise<void> {
  let resourceChecksInstance = resourceChecksCache[resourceChecksName];
  try {
    if (!resourceChecksInstance) {
      const modulePath = resourceChecksName === TINYSTACKS_AWS_RESOURCE_CHECKS ?
        resourceChecksName :
        require.resolve(resourceChecksName, { paths: [process.cwd()] });
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const resourceChecks = require(modulePath);
      const mainExport = resourceChecks?.default ? resourceChecks.default : resourceChecks;
      if (mainExport) {
        resourceChecksInstance = new mainExport();
        const isInstance = resourceChecksInstance instanceof ResourceChecks;
        const hasCheckResource = resourceChecksInstance.checkResource && typeof resourceChecksInstance.checkResource === 'function';
        if (isInstance || hasCheckResource) {
          resourceChecksCache[resourceChecksName] = resourceChecksInstance;
        } else {
          logger.warn(`Invalid resource tester: ${resourceChecksName}.`);
          logger.warn(`The main export from ${resourceChecksName} does not properly implement ResourceChecks.`);
        }
      }
    }
  }
  catch (error) {
    logger.warn(`Invalid resource tester: ${resourceChecksName}.`);
    logger.warn(`The main export from ${resourceChecksName} could not be instantiated.`);
    logger.verbose(error);
  }
  if (resourceChecksInstance) {
    await resourceChecksInstance.checkResource(resource, allResources, config);
  }
}

async function testResource (resource: ResourceDiffRecord, allResources: ResourceDiffRecord[], config: CheckOptions) {
  const {
    resourceChecks = []
  } = config;
  if (!resourceChecks.includes(TINYSTACKS_AWS_RESOURCE_CHECKS)) resourceChecks.push(TINYSTACKS_AWS_RESOURCE_CHECKS);
  for (const resourceCheck of resourceChecks) {
    await tryToUseResourceChecks(resource, allResources, config, resourceCheck);
  }
}

const templateChecksCache: {
  [name: string]: TemplateChecks
} = {};

async function tryToUseTemplateChecks (resources: ResourceDiffRecord[], config: CheckOptions, templateChecksName: string): Promise<void> {
  let templateChecksInstance = templateChecksCache[templateChecksName];
  try {
    if (!templateChecksInstance) {
      const modulePath = templateChecksName === TINYSTACKS_AWS_TEMPLATE_CHECKS ?
        templateChecksName :
        require.resolve(templateChecksName, { paths: [process.cwd()] });
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const templateChecks = require(modulePath);
      const mainExport = templateChecks?.default ? templateChecks.default : templateChecks;
      if (mainExport) {
        templateChecksInstance = new mainExport();
        const isInstance = templateChecksInstance instanceof TemplateChecks;
        const hasCheckTemplate = templateChecksInstance.checkTemplate && typeof templateChecksInstance.checkTemplate === 'function';
        if (isInstance || hasCheckTemplate) {
          templateChecksCache[templateChecksName] = templateChecksInstance;
        } else {
          logger.warn(`Invalid template check module: ${templateChecksName}.`);
          logger.warn(`The main export from ${templateChecksName} does not properly implement TemplateChecks.`);
        }
      }
    }
  }
  catch (error) {
    logger.warn(`Invalid template check module: ${templateChecksName}.`);
    logger.warn(`The main export from ${templateChecksName} could not be instantiated.`);
    logger.verbose(error);
  }
  if (templateChecksInstance) {
    await templateChecksInstance.checkTemplate(resources, config);
  }
}

async function checkTemplates (resources: ResourceDiffRecord[], config: CheckOptions) {
  const {
    templateChecks = []
  } = config;
  if (!templateChecks.includes(TINYSTACKS_AWS_TEMPLATE_CHECKS)) templateChecks.push(TINYSTACKS_AWS_TEMPLATE_CHECKS);
  const errors: Error[] = [];
  for (const templateCheck of templateChecks) {
    await tryToUseTemplateChecks(resources, config, templateCheck)
      .catch(error => errors.push(error));
  }
  errors.forEach(logger.cliError, logger);
}

export {
  testResource,
  checkTemplates
};
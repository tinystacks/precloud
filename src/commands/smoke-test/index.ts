import logger from '../../logger';
import { SmokeTestOptions } from '../../types';
import { detectIacFormat } from './detect-iac-format';
import { getConfig } from './get-config';
import { prepareForSmokeTest } from './prepare';
import { checkTemplates, testResource } from './smoke-tests';

async function smokeTest (options: SmokeTestOptions) {
  const config = getConfig(options);
  let { format } = config;
  if (!format) {
    format = detectIacFormat();
    logger.info(`No IaC format specified. Using detected format: ${format}`);
    config.format = format;
  }

  const resourceDiffRecords = await prepareForSmokeTest(config);
  const errors: Error[] = [];
  await checkTemplates(resourceDiffRecords, config)
    .catch(error => errors.push(error));
  for (const resource of resourceDiffRecords) {
    await testResource(resource, resourceDiffRecords, config)
      .catch(error => errors.push(error));
  }
  if (errors.length === 0 ) {
    logger.success('Smoke test passed!');
    return;
  }
  errors.forEach(logger.cliError, logger);
}

export {
  smokeTest
};
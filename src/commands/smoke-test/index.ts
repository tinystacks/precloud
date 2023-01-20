import { AWS_TF_PROVIDER_NAME } from '../../constants';
import logger from '../../logger';
import { IacFormat, ResourceDiffRecord, SmokeTestOptions } from '../../types';
import { detectIacFormat } from './detect-iac-format';
import { getConfig } from './get-config';
import { prepareForSmokeTest } from './prepare';
import { checkAwsQuotas, testAwsResource } from './smoke-tests';
import { getStandardResourceType } from './smoke-tests/aws/resources';

async function smokeTestResource (resource: ResourceDiffRecord, allResources: ResourceDiffRecord[], config: SmokeTestOptions) {
  const { format } = config;
  const isAwsResource = format === IacFormat.awsCdk || (format === IacFormat.tf && resource.providerName === AWS_TF_PROVIDER_NAME);
  if (isAwsResource) return testAwsResource(resource, allResources, config);
}

interface ResourceGroup {
  [key: string]: ResourceDiffRecord[]
}

async function checkQuotas (allResources: ResourceDiffRecord[], config: SmokeTestOptions): Promise<Error[]> {
  const groupedByType: ResourceGroup = allResources.reduce<ResourceGroup>((acc: ResourceGroup, resource: ResourceDiffRecord) => {
    const resourceType = getStandardResourceType(resource.resourceType);
    acc[resourceType] = acc[resourceType] || [];
    acc[resourceType].push(resource);
    return acc;
  }, {});
  const resourceGroups = Object.entries(groupedByType);
  const quotaCheckErrors: Error[] = [];
  for (const [resourceType, resources] of resourceGroups) {
    const {
      format,
      providerName
    } = resources.at(0) || {};
    const isAwsResourceType = format === IacFormat.awsCdk || (format === IacFormat.tf && providerName === AWS_TF_PROVIDER_NAME);
    if (isAwsResourceType) await checkAwsQuotas(resourceType, resources, config).catch(error => quotaCheckErrors.push(error));
  }
  return quotaCheckErrors;
}

async function smokeTest (options: SmokeTestOptions) {
  const config = getConfig(options);
  let { format } = config;
  if (!format) {
    format = detectIacFormat();
    logger.info(`No IaC format specified. Using detected format: ${format}`);
    config.format = format;
  }

  const resourceDiffRecords = await prepareForSmokeTest(config);
  const quotaErrors = await checkQuotas(resourceDiffRecords, config);
  const smokeTestErrors: Error[] = [];
  for (const resource of resourceDiffRecords) {
    await smokeTestResource(resource, resourceDiffRecords, config).catch(error => smokeTestErrors.push(error));
  }
  if (quotaErrors.length === 0 && smokeTestErrors.length === 0) {
    logger.success('Smoke test passed!');
    return;
  }
  quotaErrors.forEach(logger.cliError, logger);
  smokeTestErrors.forEach(logger.cliError, logger);
}

export {
  smokeTest
};
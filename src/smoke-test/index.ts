import { AWS_TF_PROVIDER_NAME } from '../constants';
import * as logger from '../logger';
import { IacFormat, ResourceDiffRecord, SmokeTestOptions } from '../types';
import { detectIacFormat } from './detect-iac-format';
import { getConfig } from './get-config';
import { prepareForSmokeTest } from './prepare';
import { checkAwsQuotas, smokeTestAwsResource } from './smoke-tests';
import { getStandardResourceType } from './smoke-tests/aws/resources';

async function smokeTestResource (resource: ResourceDiffRecord, allResources: ResourceDiffRecord[], config: SmokeTestOptions) {
  const { format } = config;
  const isAwsResource = format === IacFormat.awsCdk || (format === IacFormat.tf && resource.providerName === AWS_TF_PROVIDER_NAME);
  if (isAwsResource) return smokeTestAwsResource(resource, allResources, config);
}

interface ResourceGroup {
  [key: string]: ResourceDiffRecord[]
}

async function checkQuotas (allResources: ResourceDiffRecord[]) {
  const groupedByType: ResourceGroup = allResources.reduce<ResourceGroup>((acc: ResourceGroup, resource: ResourceDiffRecord) => {
    const resourceType = getStandardResourceType(resource.resourceType);
    acc[resourceType] = acc[resourceType] || [];
    acc[resourceType].push(resource);
    return acc;
  }, {});
  const resourceGroups = Object.entries(groupedByType);
  for (const [resourceType, resources] of resourceGroups) {
    const {
      format,
      providerName
    } = resources.at(0) || {};
    const isAwsResourceType = format === IacFormat.awsCdk || (format === IacFormat.tf && providerName === AWS_TF_PROVIDER_NAME);
    if (isAwsResourceType) await checkAwsQuotas(resourceType, resources);
  }
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
  await checkQuotas(resourceDiffRecords);
  for (const resource of resourceDiffRecords) {
    await smokeTestResource(resource, resourceDiffRecords, config);
  }
  logger.success('Smoke test passed!');
}

export {
  smokeTest
};
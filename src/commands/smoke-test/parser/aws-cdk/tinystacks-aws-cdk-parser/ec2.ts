import { CdkDiff, Json } from '../../../../../types';

// https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_Address.html
function parseEip (diff: CdkDiff, cloudformationTemplate: Json): Json {
  const { logicalId } = diff;
  const [ _logicalId, cfnEntry = {} ] = Object.entries<Json>(cloudformationTemplate.Resources).find(([key]) => key === logicalId) || [];
  const domain = cfnEntry.Properties?.Domain;
  const instanceId = cfnEntry.Properties?.InstanceId;
  const networkBorderGroup = cfnEntry.Properties?.NetworkBorderGroup;
  const publicIpv4Pool = cfnEntry.Properties?.PublicIpv4Pool;
  const tagSet = cfnEntry.Properties?.Tags;

  return {
    domain,
    instanceId,
    networkBorderGroup,
    publicIpv4Pool,
    tagSet
  };
}

export {
  parseEip
};
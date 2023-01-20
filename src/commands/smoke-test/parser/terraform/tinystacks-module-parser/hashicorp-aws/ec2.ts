import { TfDiff, Json, TxtFile, JsonFile } from '../../../../../../types';
import { getResource } from './helpers';

// https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_Address.html
function parseEip (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], _tfJson: JsonFile[]): Json {
  const resource = getResource(diff, tfPlan);

  const domain = resource?.vpc === true ? 'vpc' : 'standard';
  const instanceId = resource?.instance;
  const customerOwnedIpv4Pool = resource?.customer_owned_ipv4_pool;
  const networkBorderGroup = resource?.network_border_group;
  const networkInterfaceId = resource?.network_interface;
  const publicIpv4Pool = resource?.public_ipv4_pool;
  const tagSet = resource?.tags;

  return {
    domain,
    instanceId,
    customerOwnedIpv4Pool,
    networkBorderGroup,
    networkInterfaceId,
    publicIpv4Pool,
    tagSet
  };
}

export {
  parseEip
};
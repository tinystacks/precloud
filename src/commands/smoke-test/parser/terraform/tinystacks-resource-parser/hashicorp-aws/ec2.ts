import { TfDiff, Json, TxtFile, JsonFile } from '../../../../../../types';
import { getTfEntry, resolveValue } from './helpers';

// https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_Address.html
function parseEip (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], tfJson: JsonFile[]): Json {
  const tfEntry = getTfEntry(diff, tfJson);
  const domain = tfEntry?.vpc === true ? 'vpc' : 'standard';
  const instanceId = resolveValue(diff, tfPlan, tfEntry, 'instance');
  const customerOwnedIpv4Pool = resolveValue(diff, tfPlan, tfEntry, 'customer_owned_ipv4_pool');
  const networkBorderGroup = resolveValue(diff, tfPlan, tfEntry, 'network_border_group');
  const networkInterfaceId = resolveValue(diff, tfPlan, tfEntry, 'network_interface');
  const publicIpv4Pool = resolveValue(diff, tfPlan, tfEntry, 'public_ipv4_pool');
  const tagSet = resolveValue(diff, tfPlan, tfEntry, 'tags');

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
import {
  fromNodeProviderChain,
  fromEnv
} from '@aws-sdk/credential-providers';

async function getCredentials () {
  const envProvider = fromEnv();
  const envCreds = await envProvider();
  const nodeChainProvider = fromNodeProviderChain();
  const nodeChainCreds = await nodeChainProvider();
  return envCreds || nodeChainCreds;
}

export {
  getCredentials
};
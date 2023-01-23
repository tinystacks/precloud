import logger from '../../logger';
import isNil from 'lodash.isnil';
import { resolve as resolvePath } from 'path';
import { readFileSync } from 'fs';
import { SmokeTestOptions } from '../../types';

function tryReadFile (filePath: string): string | undefined {
  try {
    const fileContents = readFileSync(resolvePath(filePath));
    return fileContents.toString();
  } catch (error) {
    return undefined;
  }
}

function tryParseConfig (configString: string, fileName: string) {
  try {
    const configJson = JSON.parse(configString);
    return configJson;
  } catch (error) {
    logger.error(`Invalid config file! The contents of ${fileName} could not be parsed as JSON.  Correct any syntax issues and try again.`);
    return {};
  }
}

function getConfig (options: SmokeTestOptions): SmokeTestOptions {
  const {
    configFile = 'predeploy.config.json'
  } = options;
  const config = tryParseConfig(tryReadFile(configFile) || '{}', configFile);

  const verbose = !isNil(options.verbose) ? options.verbose : config.verbose;
  if (!isNil(verbose)) {
    process.env.VERBOSE = verbose.toString();
  }

  return {
    ...config,
    ...options
  }; 
}

export {
  getConfig
};
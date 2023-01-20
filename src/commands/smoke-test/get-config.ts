import * as logger from '../../logger';
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
    logger.error(`Invalid config file! The contentes of ${fileName} could not be parsed as JSON.  Correct any syntax issues and try again.`);
  }
}

function getConfig (options: SmokeTestOptions): SmokeTestOptions {
  const {
    configFile = 'smoke-test.config.json' 
  } = options;
  const config = tryParseConfig(tryReadFile(configFile) || '{}', configFile);

  return {
    ...config,
    ...options
  }; 
}

export {
  getConfig
};
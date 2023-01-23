import {
  red,
  magenta,
  yellow,
  blue,
  gray,
  green
} from 'colors';
import { CliError } from '../errors';

const logger = {
  error (message: string) {
    console.error(red(`Error: ${message}`));
  },

  debug (message: string | any) {
    console.debug(yellow(`Debug: ${message}`));
  },

  warn (message: string) {
    console.warn(yellow(`Warning: ${message}`));
  },

  info (message: string) {
    console.info(blue(`Info: ${message}`));
  },

  log (message: string) {
    console.log(gray(message));
  },

  hint (message: string) {
    console.log(magenta(`Hint: ${message}`));
  },

  success (message: string) {
    console.log(green(`Success: ${message}`));
  },

  verbose (message: string | Error | any) {
    if (process.env.VERBOSE === 'true') {
      console.log(gray(message));
    }
  },

  cliError (e: Error | unknown) {
    const error = e as Error;
    if (error.name === CliError.name) {
      const customError = e as CliError;
      this.error(`${customError.message}${customError.reason ? `\n\t${customError.reason}` : ''}`);
      if (customError.hints) {
        customError.hints.forEach(hintString => this.hint(`\t${hintString}`));
      }
    } else {
      this.error('An unexpected error occurred!');
      console.error(error);
    }
  }
};


export default logger;
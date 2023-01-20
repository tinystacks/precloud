import logger from '../../logger';
import { exec, ExecOptions } from 'child_process';
import { OsOutput } from '../../types';

async function runCommand (command: string, opts?: ExecOptions): Promise<OsOutput> {
  return new Promise((resolve, reject) => {
    try {
      // we "return await" here so that errors can be handled within this function to execute retry logic
      if (opts) {
        opts.env = { ...process.env, ...(opts.env || {}) };
      }
      const standardOut: string[] = [];
      const standardError: string[] = [];
      let exitCode: number;
      
      logger.log(command);
      const childProcess = exec(command, opts);

      childProcess.stdout.on('data', (data) => {
        console.log(data);
        standardOut.push(data);
      });
      
      childProcess.stderr.on('data', (data) => {
        console.error(data);
        standardError.push(data);
      });

      process.stdin.pipe(childProcess.stdin);

      childProcess.on('error', (error: Error) => {
        logger.error(`Failed to execute command "${command}"`);
        reject(error);
      });
      
      childProcess.on('exit', (code: number, signal: string) => {
        if (signal) logger.info(`Exited due to signal: ${signal}`);
        exitCode = code;
        resolve({
          stdout: standardOut.join('\n'),
          stderr: standardError.join('\n'),
          exitCode
        });
      });
    } catch (error) {
      logger.error(`Failed to execute command "${command}"`);
      reject(error);
    }
  });
}

export {
  runCommand
};
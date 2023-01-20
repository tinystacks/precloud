import { rmSync } from 'fs';
import { TMP_DIRECTORY } from '../../constants';

function cleanupTmpDirectory () {
  rmSync(TMP_DIRECTORY, { recursive: true, force: true });
}

export {
  cleanupTmpDirectory
};
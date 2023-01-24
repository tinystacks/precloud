const path = require('path');
const depcheck = require('depcheck');
const isEmpty = require('lodash.isempty');

async function checkForMissingDependencies () {
  const projectRootDir = path.resolve('./');
  const { missing } = await depcheck(projectRootDir, {});
  if (!isEmpty(missing)) {
    throw new Error(`One or more dependencies are not installed! ${JSON.stringify(missing, null, 2)}`);
  }
}
checkForMissingDependencies()
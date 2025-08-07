const {execSync} = require('child_process');
const {writeFileSync, unlinkSync} = require('fs');
const path = require('path');

const getStagedFiles = () => {
  const stdout = execSync('git diff --name-only --cached').toString();
  return stdout.split('\n').filter((file) => file.endsWith('.js'));
};

const mapToTestFiles = (files) => {
  return files
      .filter((file) => file.startsWith('server/') || file.startsWith('helpers/'))
      .map((file) => {
        console.log(`Mapping file: ${file}`);
        const relativePath = file.replace('.js', '.test.js');
        const testFilePath = path.join('__tests__', relativePath);
        console.log(`Test file path: ${testFilePath}`);
        try {
          execSync(`test -f ${testFilePath}`);
          return testFilePath;
        } catch (err) {
          console.log(`No test file found for ${file}`);
          return null; // Return null if the test file doesn't exist
        }
      })
      .filter(Boolean); // Filter out null values
};

const createTemporaryJestConfig = (testFiles) => {
  const originalConfigPath = path.join(__dirname, '../config/jest.config.js');
  const tempConfigPath = path.join(__dirname, 'temp.jest.config.js');

  // Read the existing Jest config
  const originalConfig = require(originalConfigPath);

  // Modify the collectCoverageFrom field to only include the staged files
  originalConfig.collectCoverageFrom = testFiles.map((file) => `<rootDir>/${file}`);

  // Write the modified config to a temporary file
  writeFileSync(tempConfigPath, `module.exports = ${JSON.stringify(originalConfig, null, 2)};`);

  return tempConfigPath;
};

const runTests = (testFiles, tempConfigPath) => {
  if (testFiles.length > 0) {
    const jestCommand = `npx jest ${testFiles.join(' ')} --config=${tempConfigPath} --coverage`;
    console.log(`Running: ${jestCommand}`);
    execSync(jestCommand, {stdio: 'inherit'});
  } else {
    console.log('No related tests found for the staged files.');
  }
};

const cleanup = (tempConfigPath) => {
  if (unlinkSync(tempConfigPath)) {
    unlinkSync(tempConfigPath);
  }
};

const stagedFiles = getStagedFiles();
const testFiles = mapToTestFiles(stagedFiles);
const tempConfigPath = createTemporaryJestConfig(stagedFiles);

runTests(testFiles, tempConfigPath);
cleanup(tempConfigPath);

const fs = require("fs/promises");
const path = require("path");

const rimraf = require("rimraf");
const ora = require("ora");

const {
  randomDirName,
  getRandomArbitrary,
  clearRequireCache,
} = require("./helpers");

const { plotSpeeds, makeMarkdownTable } = require("./printers");

const TMP_DIR = path.join(__dirname, "tmp"); // tmp directory to create the node_modules
const MAX_NUMBER_OF_DIRS = 10_000; // max number of directories to create
const FILE_CONTENTS = `module.exports = 'hello world'`; // file contents to write to the index.js file

/** Prepare the directories and files for the test */
async function prepare() {
  const directoriesMade = [];

  for (let i = 0; i < MAX_NUMBER_OF_DIRS; i++) {
    const dir = await randomDirName(TMP_DIR);
    await fs.mkdir(dir, { recursive: true });

    let packagePath = path.join(dir, `node_modules/package-${i}`);

    await fs.mkdir(packagePath, {
      recursive: true,
    });

    await fs.writeFile(path.join(packagePath, `index.js`), FILE_CONTENTS);
    directoriesMade.push(path.join(dir, "node_modules"));
  }

  return directoriesMade.join(path.delimiter);
}

/** Prepare the directories and files for the test */
async function prepareSingleNodeModulesDir() {
  for (let i = 0; i < MAX_NUMBER_OF_DIRS; i++) {
    let packagePath = path.join(TMP_DIR, `node_modules/package-${i}`);

    await fs.mkdir(packagePath, {
      recursive: true,
    });

    fs.writeFile(path.join(packagePath, `index.js`), FILE_CONTENTS);
  }
}

/** Test the require function speed */
const definedPackagesCache = []; // Cache the defined packages. Every test uses the same package names to make comparison easier.
function speedTest(definedPackages = definedPackagesCache) {
  if (definedPackages.length === 0) {
    const speedTestCount = 100; // number of require calls to make

    // Make the packages list unique
    let definedPackagesSet = new Set(definedPackages);
    while (definedPackagesSet.size < speedTestCount) {
      const randomPackage =
        "package-" + getRandomArbitrary(0, MAX_NUMBER_OF_DIRS - 1);

      definedPackagesSet.add(randomPackage);
    }

    definedPackages = Array.from(definedPackagesSet);
  }

  let data = [];

  for (let i = 0; i < definedPackages.length; i++) {
    const start = Date.now();
    require(definedPackages[i]);
    const end = Date.now();

    data.push({
      package: definedPackages[i],
      requireDurationMs: end - start,
    });
  }

  return data;
}

async function runTest({ description, testFunction }) {
  const spinner = ora(description).start();
  clearRequireCache(spinner);
  rimraf.sync(TMP_DIR);

  await fs.mkdir(TMP_DIR, { recursive: true });
  await testFunction(spinner);

  spinner.text = "Running speed test";
  const data = speedTest();
  spinner.succeed(`Speed test: ${description} completed`);

  return data;
}

/** Run a speed test on resolving modules from multiple node_modules directories */
async function runMultiNodeModuleTest() {
  return runTest({
    description: "Multi node_module dir resolution time",
    testFunction: async (spinner) => {
      const node_path = await prepare();

      process.env.NODE_PATH = node_path;
      // Truncate the NODE_PATH to make the output more readable
      const truncatedNodePath = process.env.NODE_PATH.substring(0, 100) + "...";
      spinner.text = "Setting NODE_PATH to " + truncatedNodePath;
      require("module").Module._initPaths();
    },
  });
}

/** Run a speed test on resolving modules from a single node_modules directory */
async function runSingleNodeModuleTest() {
  return runTest({
    description: "Single node_module dir resolution time",
    testFunction: async (spinner) => {
      await prepareSingleNodeModulesDir();

      process.env.NODE_PATH = path.join(TMP_DIR, "node_modules");
      spinner.text = "Setting NODE_PATH to " + process.env.NODE_PATH;
      require("module").Module._initPaths();
    },
  });
}

async function main() {
  const test1Data = await runMultiNodeModuleTest();
  const test2Data = await runSingleNodeModuleTest();

  makeMarkdownTable(test1Data, test2Data);

  plotSpeeds(test1Data);
}

main();

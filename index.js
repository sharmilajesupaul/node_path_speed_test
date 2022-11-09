// make a thousand directories with node_modules in them
// and then run this script to see the difference in performance
// between the two methods

const fs = require('fs/promises');
const path = require('path');
const rimraf = require('rimraf');

const tmpDir = path.join(__dirname, 'tmp');
const maxNumberOfDirectories = 10000;
const speedTestCount = 100;
const fileContents = `module.exports = 'hello world'`;
let node_path = '';

function randomDirName() {
  return fs.mkdtemp(path.join(tmpDir, 'node_modules-'));
}

function getRandomArbitrary(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function clearRequireCache() {
  console.log(
    `Rlearing require cache, removing ${
      Object.keys(require.cache).length
    } items`
  );
  Object.keys(require.cache).forEach((key) => {
    delete require.cache[key];
  });
}

async function prepare() {
  const promises = [];
  const directoriesMade = [];

  for (let i = 0; i < maxNumberOfDirectories; i++) {
    const dir = await randomDirName();
    await fs.mkdir(dir, { recursive: true });

    let packagePath = path.join(dir, `node_modules/package-${i}`);

    await fs.mkdir(packagePath, {
      recursive: true,
    });

    await fs.writeFile(path.join(packagePath, `index.js`), fileContents);

    directoriesMade.push(path.join(dir, 'node_modules'));
  }

  await Promise.all(promises);
  node_path = directoriesMade.join(path.delimiter);
}

let speedTestPackages = [];

function speedTest(definedPackages = []) {
  if (definedPackages.length === 0) {
    definedPackage = new Array(speedTestCount).fill(0).map(() => {
      const randomPackage =
        'package-' + getRandomArbitrary(0, maxNumberOfDirectories - 1);

      speedTestPackages.push(randomPackage);
      definedPackages.push(randomPackage);
      return randomPackage;
    });
  }

  // make the packages list unique
  definedPackages = [...new Set(definedPackages)];

  let data = [];

  for (let i = 0; i < definedPackages.length; i++) {
    const start = Date.now();
    require(definedPackages[i]);
    const end = Date.now();
    console.log(definedPackages[i], end - start + 'ms');
    data.push({
      package: definedPackages[i],
      time: end - start,
    });
  }

  return data;
}

async function prepareSingleNodeModulesDir() {
  for (let i = 0; i < maxNumberOfDirectories; i++) {
    let packagePath = path.join(tmpDir, `node_modules/package-${i}`);

    await fs.mkdir(packagePath, {
      recursive: true,
    });

    fs.writeFile(path.join(packagePath, `index.js`), fileContents);
  }
}
let test1Data = [];
let test2Data = [];
async function test1() {
  clearRequireCache();
  console.log('-------------------------------------------');
  console.log('Starting individual package node_module dirs resolution time');
  console.log('-------------------------------------------');
  rimraf.sync(tmpDir);
  await fs
    .mkdir(tmpDir, { recursive: true })
    .then(prepare)
    .then(() => {
      process.env.NODE_PATH = node_path;
      console.log('setting NODE_PATH to:', process.env.NODE_PATH);
      require('module').Module._initPaths();
    })
    .then(() => {
      test1Data = speedTest(speedTestPackages);
    });
}

async function test2() {
  clearRequireCache();
  console.log('-------------------------------------------');
  console.log('Starting single node_module dir resolution time');
  console.log('-------------------------------------------');
  rimraf.sync(tmpDir);
  await fs
    .mkdir(tmpDir, { recursive: true })
    .then(prepareSingleNodeModulesDir)
    .then(() => {
      process.env.NODE_PATH = path.join(tmpDir, 'node_modules');
      console.log('setting NODE_PATH to:', process.env.NODE_PATH);
      require('module').Module._initPaths();
    })
    .then(() => {
      test2Data = speedTest(speedTestPackages);
    });
}

function makeMarkdownTable(dataTest1, dataTest2) {
  const titles = [
    'Package',
    'Time multi NODE_PATH (ms)',
    'Time single NODE_PATH (ms)',
  ];
  const table = [];

  dataTest1.forEach((item, index) => {
    table.push([item.package, item.time, dataTest2[index].time]);
  });

  console.log('| ' + titles.join('|') + ' |');
  console.log('| ' + titles.map(() => '---').join('|') + ' |');
  table.forEach((row) => {
    console.log('| ' + row.join(' | ') + ' |');
  });
}

(async () => {
  await test1();
  await test2();
  console.log('-------------------------------------------');
  console.log('Results');
  console.log('-------------------------------------------');
  makeMarkdownTable(test1Data, test2Data);
})();

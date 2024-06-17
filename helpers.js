const fs = require("fs/promises");
const path = require("path");

/** Returns a random tmp directory name */
function randomDirName(tmpDir) {
  return fs.mkdtemp(path.join(tmpDir, "node_modules-"));
}

/** Returns a random integer between min (inclusive) and max (inclusive) */
function getRandomArbitrary(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * NodeJS require cache is a global object that caches the result of the
 * require function. To measure the speed of the require function we need to
 * clear the cache. */
function clearRequireCache(spinner) {
  spinner.text = `Clearing require cache, removing ${Object.keys(require.cache).length} items`;

  Object.keys(require.cache).forEach((key) => {
    delete require.cache[key];
  });
}

module.exports = {
  randomDirName,
  getRandomArbitrary,
  clearRequireCache,
};

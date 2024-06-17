const { plot } = require("asciiplot");

function sortByPackageName(a, b) {
  // package-[id] -> id
  const aId = parseInt(a.package.split("-")[1]);
  const bId = parseInt(b.package.split("-")[1]);
  return aId - bId;
}

/** Format the two tests as a markdown table  */
function makeMarkdownTable(dataTest1, dataTest2) {
  const titles = [
    "Package",
    "Time multiple dirs in NODE_PATH (ms)",
    "Time single NODE_PATH (ms)",
  ];
  const table = [];

  dataTest1.sort(sortByPackageName).forEach((item, index) => {
    table.push([
      item.package,
      item.requireDurationMs,
      dataTest2[index].requireDurationMs,
    ]);
  });

  console.log("| " + titles.join("|") + " |");
  console.log("| " + titles.map(() => "---").join("|") + " |");
  table.forEach((row) => {
    console.log("| " + row.join(" | ") + " |");
  });
}

/** Plot the NODE_PATH speeds in an ascii barchart */
function plotSpeeds(dataTest1) {
  console.log(plot(dataTest1.map((item) => item.requireDurationMs), {
    height: 20,
  }));
}

module.exports = {
  makeMarkdownTable,
  plotSpeeds,
};

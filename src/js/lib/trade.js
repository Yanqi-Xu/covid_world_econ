const d3 = require("d3");
const table = d3.select(".trade-table");
let dataset = trade;
const shareAccessor = (d) => +d.share.slice(0, -1) / 100;
const numberOfRows = dataset.length;
const colorScale = d3.interpolateHcl("#fff", "rgba(255, 227, 103, 0.822)");
const grayColorScale = d3.interpolateHcl("#fff", "#bdc4ca");
const growthScale = d3
  .scaleQuantize()
  .domain(d3.extent(dataset.slice(0, numberOfRows), (d) => d.L / 100))
  .range([0, 1, 2, 3]);

const columns = [
  // Format our dates to make them more human readable
  {
    label: "Sector",
    format: (d) => d.goods,
  },
  {
    label: "Initial shares",
    format: (d) => d3.format(".1%")(shareAccessor(d)),
  },
  {
    label: "V-shaped",
    format: (d) => d3.format(".1%")(+d.V / 100),
    background: (d) => colorScale(growthScale(+d.V / 100)),
  },
  // Ensure all of our numbers have the same granularity
  {
    label: "U-shaped",
    format: (d) => d3.format(".1%")(+d.U / 100),
    background: (d) => colorScale(growthScale(+d.U / 100)),
  },
  // Let's use a marker to indicate where the max temp occurred (e.g. middle of the day, later in the day)
  {
    label: "L-shaped",
    format: (d) => d3.format(".1%")(+d.L / 100),
    background: (d) => colorScale(growthScale(+d.L / 100)),
  },
];

table
  .append("thead")
  .append("tr")
  .selectAll("thead")
  .data(columns)
  .enter()
  .append("th")
  .text((d) => d.label);

const body = table.append("tbody");

dataset.slice(0, numberOfRows).forEach((d) => {
  body
    .append("tr")
    .selectAll("td")
    .data(columns)
    .enter()
    .append("td")
    .text((column) => column.format(d))
    .attr("class", (column) => column.type)
    .style("background", (column) => column.background && column.background(d));

  //.style("transform", column => column.transform && column.transform(d)))
});

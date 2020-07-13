const d3 = require("d3");
sector.sort(function (a, b) {
  return a.employed - b.employed;
});

width = 0.7* d3.min([window.innerHeight, window.innerWidth])

const nest = d3
  .nest()
  .key((d) => d.industry)
  .rollup(function (c) {
    return c.map(function (d) {
      return {
        employed: d.employed,
        lost: d.lost,
      };
    })[0];
  })
  .entries(sector);

//add a total value for each sector
const scTotal = nest.map((d) => {
  const values = d3.entries(d.value),
    total = d3.sum(values, (c) => +c.value);
  return {
    sector: d.key,
    values,
    total,
  };
});

// create a Y scale
const yScale = d3
  .scaleLinear()
  .domain([0, d3.max(scTotal, (d) => d.total)])
  .range([0, width]);

const colorScale = d3
  .scaleOrdinal()
  .domain(["employed", "lost"])
  .range(["#ff7e66", "#cccccc"]);

const stack = d3.select("#stack");

const groupContainers = stack
  .selectAll(".group-container")
  .data(scTotal)
  .enter()
  .append("div")
  .attr("class", "group-container");

// Add a div for each sector
const group = groupContainers.append("div").attr("class", "group");
// Add a total count label
const count = group
  .append("text")
  .text((d) => d3.format(".0%")(+d.values[1].value / +d.total))
  .attr("class", "count");

const block = group
  .selectAll(".block")
  .data((d) => d.values)
  .enter()
  .append("div")
  .attr("class", "block")
  .style("width", (d) => `${yScale(d.value)}px`)
  .style("height", (d) => `10px`)
  .style("background-color", (d) => colorScale(d.key));
//add a sector label
groupContainers
  .append("div")
  .append("text")
  .attr("class", "stack-label")
  .text((d) => d.sector);

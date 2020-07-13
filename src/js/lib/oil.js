const d3 = require("d3");
// Access data
const margin = {
    top: 20,
    right: 20,
    bottom: 10,
    left: 15,
  },
  width = window.innerWidth * 0.85 - margin.left - margin.right, // Use the window's width
  height = window.innerHeight * 0.62 - margin.top - margin.bottom; // Use the window's height

const oilSVG = d3
  .select("#oil")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .attr("viewBox", [
    -10,
    0,
    width + margin.left + margin.right,
    height + margin.top + margin.bottom + 40,
  ])
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//Process data

const timeConv = d3.timeParse("%Y-%m-%d");
const yAccessor = (d) => +d.price;

const x = d3
  .scaleTime()
  .domain(d3.extent(oil, (d) => timeConv(d.date)))
  .range([0, width]);

y = d3
  .scaleLinear()
  .domain([0, d3.max(oil, (d) => yAccessor(d))])
  .range([height, 0]);
// Draw x and y axes
const xAxis = (g) =>
  g.call(
    d3
      .axisBottom(x)
      .ticks(width / 80)
      .tickSizeOuter(0)
  );
//.call((g) => g.select(".domain").remove());

const yAxisGen = (g) => g.call(d3.axisLeft(y));

oilSVG
  .append("g")
  .call(xAxis)
  .attr("class", "greyaxis")
  .attr("transform", `translate(0,${height})`);
const yAxis = oilSVG
  .append("g")
  .call(yAxisGen)
  .attr("class", "greyaxis")
  .call((g) => g.select(".domain").remove());

const lineGen = d3
  .area()
  .x((d) => x(timeConv(d.date)))
  .y((d) => y(yAccessor(d)))
  .curve(d3.curveBasis);
// Initialize line
const line = oilSVG
  .append("g")
  .append("path")
  .attr("fill", "none")
  .attr("stroke", "#77ace5")
  .attr("stroke-width", 3)
  .attr("shape-rendering", "geometricPrecision;")
  .datum(oil)
  .attr("d", lineGen);

function make_y_gridlines() {
  return d3.axisLeft(y).ticks(5);
}

oilSVG
  .append("g")
  .attr("class", "grid")
  .call(make_y_gridlines().tickSize(-width).tickFormat(""));

yAxis
  .append("text")
  .attr("class", "y-axis-label")
  .attr("dy", "1em")
  .text("$/Barrel")
  .attr("text-align", "right")
  .attr("transform", "translate(10,10)");

const meanline = oilSVG.append("g").attr("class", "mean-line");

meanline
  .append("line")
  .attr("x1", 0)
  .attr("x2", width)
  .attr("y1", y(53))
  .attr("y2", y(53))
  .attr("stroke", "grey")
  .attr("stroke-dasharray", "2px 4px");

const crisisStart = [
  "1985-12-31",
  "1997-12-31",
  "2008-07-31",
  "2014-10-31",
  "2020-01-31",
];
const crisisEnd = [
  "1986-07-31",
  "1998-12-31",
  "2008-12-31",
  "2016-01-31",
  "2020-04-31",
];
const crisisName = [
  "Oil Price Collapse",
  "East Asian Financial Crisis",
  "Financial Crisis",
  "Oil Price Crash",
  "+ OPEC",
];
let crises = [];
for (let i = 0; i < crisisName.length; i++) {
  crises.push({
    start: crisisStart[i],
    end: crisisEnd[i],
    name: crisisName[i],
  });
}

const timeStamps = oilSVG
  .append("g")
  .classed("time-stamps", true)
  .selectAll("time-stamps")
  .data(crises)
  .enter();

timeStamps
  .append("rect")
  .attr("x", (d) => x(timeConv(d.start)))
  .attr("y", 0)
  .attr("height", height)
  .attr("width", (d) => x(timeConv(d.end)) - x(timeConv(d.start)))
  // .attr("width", (d) => y(timeConv(d.end)) - y(timeConv(d.start)))
  .style("fill", "#F2F2F2")
  .style("fill-opacity", ".5");

timeStamps
  .append("text")
  .attr("x", (d) => x(timeConv(d.start)))
  .attr("y", (d, i) => (5 * height) / 12 - ((i + 1) * height) / 13)
  .attr("dx", "-2em")
  .attr("z-index",100)
  .classed("wrap-label", true)
  .classed("graphic-label", true)
  .text((d) => d.name);
oilSVG
  .append("text")
  .attr("x", x(timeConv(crisisStart[4])))
  .attr("y", (5 * height) / 12 - ((4 + 1) * height) / 13)
  .attr("dx", "-3.5em")
  .attr("dy", "-1em")
  .classed("wrap-label", true)
  .classed("graphic-label", true)
  .text("COVID-19");

meanline
  .append("text")
  .text("Average: $53/Barrel")
  .attr("x", width / 2 - 10)
  .attr("y", y(53))
  .classed("graphic-label", true)
  .attr("dx", "-.5em")
  .attr("dy", "-.5em")
  .attr("z-index",101);

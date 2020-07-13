const d3 = require("d3");
import { legendColor } from "d3-svg-legend";
// Access data
const margin = {
    top: 20,
    right: 10,
    bottom: 50,
    left: 60,
  },
  width =
    Math.max(window.innerWidth, window.innerHeight) / 2.2 -
    margin.left -
    margin.right, // Use the window's width
  height =
    Math.max(window.innerWidth, window.innerHeight) * 0.53 -
    margin.top -
    margin.bottom; // Use the window's height

const agSVG = d3
  .select("#agriculture")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .attr(
    "viewBox",
    `0 0 ${width + margin.left + margin.right} ${
      height + margin.top + margin.bottom
    }`
  )
  .attr("preserveAspectRatio", "xMinYMin")
  .attr("class", "wrapper-container");

const bounds = agSVG
  .append("g")
  .style("transform", `translate(${margin.left}px, ${margin.top}px)`);
//Process data
const agNest = d3
  .nest()
  .key((d) => d.agtype)
  .entries(agriculture);

const timeConv = d3.timeParse("%Y-%m-%d");
const yAccessor = (d) => +d.amount;
agNest
  .sort(function (a, b) {
    return yAccessor(a.values[0]) - yAccessor(b.values[0]);
  })
  .reverse();

const x = d3
  .scaleTime()
  .domain(d3.extent(agriculture, (d) => timeConv(d.date)))
  .range([0, width]);

y = d3
  .scaleLinear()
  .domain(d3.extent(agriculture, (d) => yAccessor(d)))
  .range([height, 0]);
// draw data
const lineGen = d3
  .line()
  .x((d) => x(timeConv(d.date)))
  .y((d) => y(yAccessor(d)))
  .curve(d3.curveBasis);

const agPal = ["#40bad5", "#12947f", "#f17808", "#fcbf1e"];
const colorScale = d3
  .scaleOrdinal()
  .domain(["Rice", "Soybean", "Wheat", "Corn"])
  .range(agPal);

const lines = bounds.append("g").selectAll(".agline").data(agNest);

lines
  .enter()
  .append("path")
  .attr("class", "agline")
  .attr("fill", "none")
  .attr("stroke", (d) => colorScale(d.key))
  .attr("stroke-width", 3)
  .attr("shape-rendering", "geometricPrecision;")
  .attr("d", (d) => lineGen(d.values))
  .attr("id", (d) => `${d.key}`);
// Draw x and y axes
const xAxisGen = (g) =>
  g
    .call(
      d3
        .axisBottom(x)
        .ticks(6)
        .tickSizeOuter(0)
        .tickFormat(d3.timeFormat("%-m/%d"))
    )
    .attr("transform", `translate(0,${height})`);

const yAxisGen = (g) =>
  g.call(d3.axisLeft(y)).call((g) => g.select(".domain").remove());

const xAxis = bounds.append("g").call(xAxisGen).attr("class", "greyaxis");
const yAxis = bounds.append("g").call(yAxisGen).attr("class", "greyaxis");

xAxis2 = d3
  .axisBottom()
  .scale(x)
  .ticks(1)
  .tickFormat(d3.timeFormat("%Y"))
  .tickSize(2, 0);

bounds
  .append("g")
  .call(xAxis2)
  .attr("transform", `translate(0,${height + 25})`)
  .attr("class", "greyaxis")
  .call((g) => g.select(".domain").remove());

yAxis
  .append("text")
  .attr("class", "y-axis-label")
  .attr("dy", "1em")
  .text("$/ton")
  .attr("text-align", "right");
//draw legends
bounds
  .append("g")
  .attr("class", "legendOrdinal")
  .attr("transform", `translate(${width / 12},${height / 20})`);

var legendOrdinal = legendColor()
  .shape(
    "path",
    d3
      .symbol()
      .type(d3.symbolCircle)
      .size(width / 5)()
  )
  .shapePadding(1.8)
  .shapePadding(width / 50)
  //use cellFilter to hide the "e" cell
  .cellFilter(function (d) {
    return d.label !== "e";
  })
  .scale(colorScale);

bounds
  .select(".legendOrdinal")
  .call(legendOrdinal)
  .classed("graphic-label", true);

// gridlines in y axis function
function make_y_gridlines() {
  return d3.axisLeft(y).ticks(5);
}

bounds
  .append("g")
  .attr("class", "grid")
  .call(make_y_gridlines().tickSize(-width).tickFormat(""));

const d3 = require("d3");
// Access data
const margin = {
    top: 10,
    right: 10,
    bottom: 30,
    left: 30,
  },
  width = 360 - margin.left - margin.right, // Use the window's width
  height = width * 1.2; // Use the window's height

const stocksPal = ["#ffa69e", "#c9d7f8", "#ffdbb0", "#84dcc6", "#a5ffd6"];

// group the data: I want to draw one line per group
const stocksNested = d3
  .nest() // nest function allows to group the calculation per level of a factor
  .key(function (d) {
    return d.index;
  })
  .entries(stocks);

const colorScale = d3
  .scaleOrdinal()
  .domain(stocksNested.map((d) => d.key))
  .range(stocksPal);
// bind data to svg elements so there will be a svg for # each year
const pre = d3.select("#stocks").selectAll(".chart").data(stocksNested);

// create the svg elements
const divs = pre
  .enter()
  .append("div")
  .attr("class", "chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

divs
  .append("rect")
  .attr("class", "background")
  .style("pointer-events", "all")
  .attr("width", width + margin.right)
  .attr("height", height);

const timeConv = d3.timeParse("%Y-%m-%d");
const yAccessor = (d) => +d.daily;

const xAccessor = (d) => timeConv(d.date);

const xScale = d3
  .scaleTime()
  .domain(d3.extent(stocks, (d) => xAccessor(d)))
  .range([margin.left, width - margin.right]);

const yScale = d3
  .scaleLinear()
  .domain(d3.extent(stocks, (d) => yAccessor(d)))
  .range([height - margin.bottom, margin.top]);

let area = d3
  .area()
  .x((d) => xScale(xAccessor(d)))
  .y0(yScale(0))
  .y1((d) => yScale(yAccessor(d)))
  .curve(d3.curveBasis);

let line = d3
  .line()
  .x((d) => xScale(xAccessor(d)))
  .y((d) => yScale(yAccessor(d)))
  .curve(d3.curveBasis);

lines = divs.append("g");

lines
  .append("path")
  .attr("class", "area")
  .style("pointer-events", "none")
  .attr("d", (c) => area(c.values))
  .style("fill", (c) => colorScale(c.key));

lines
  .append("path")
  .attr("class", "line")
  .style("pointer-events", "none")
  .attr("d", (c) => line(c.values));

lines
  .append("text")
  .attr("class", "title")
  .attr("text-anchor", "middle")
  .attr("y", 0)
  .attr("dy", "1.2em")
  .attr("x", width / 2)
  .text((c) => c.key)
  .style("font-size", "14px");

// gridlines in y axis function
function make_y_gridlines() {
  return d3.axisLeft(yScale).ticks(5);
}

function make_x_gridlines() {
  return d3.axisBottom(xScale).ticks(5).tickSizeOuter(0);
}

// add the X Axis
divs
  .append("g")
  .attr("transform", "translate(0," + height + ")")
  .attr("class", "greyaxis")
  .call(
    d3
      .axisBottom(xScale)
      .ticks(5)
      .tickFormat(d3.timeFormat("%-m/%-d"))
      .tickSizeOuter(0)
  )
  .attr("transform", `translate(0,${height - 60})`);

// add the Y Axis
const yAxis = divs
  .append("g")
  .attr("class", "greyaxis")
  .call(d3.axisLeft(yScale).ticks(6))
  .call((g) => g.select(".domain").remove());

const yAxisLabel = divs
  .append("text")
  .attr("x", -margin.left)
  .attr("y", height / 10)
  .attr("fill", "black")
  .style("font-size", "14px")
  .text("Daily Revenue (%)")
  .classed("y-axis-label");

// add the X gridlines
divs
  .append("g")
  .attr("class", "grid")
  .attr("transform", "translate(0," + (6.2 * height) / 7 + ")")
  .call(
    make_x_gridlines()
      .tickSize((-4 * height) / 5)
      .tickFormat("")
  );

// add the Y gridlines
divs
  .append("g")
  .attr("class", "grid")
  .call(make_y_gridlines().tickSize(-width).tickFormat(""));

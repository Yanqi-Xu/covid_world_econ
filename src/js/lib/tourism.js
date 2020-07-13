const d3 = require("d3"),
  xAccessor = (d) => d.region;
earlyAccessor = (d) => +d.early;
lateAccessor = (d) => +d.late;

const width = d3.min([window.innerWidth * 0.9, window.innerHeight * 0.9]);

let dimensions = {
  width: width,
  height: width * 0.8,
  margin: {
    top: 10,
    right: 10,
    bottom: 50,
    left: 110,
  },
};
dimensions.boundedWidth =
  dimensions.width - dimensions.margin.left - dimensions.margin.right;
dimensions.boundedHeight =
  dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

// Draw canvas
const wrapper = d3
  .select("#tourism")
  .append("svg")
  // Note that these width and height sizes are the size "outside" of our plot
  .attr("width", dimensions.width)
  .attr("height", dimensions.height);

const bounds = wrapper
  .append("g")
  // Create a group element to move the inner part of our chart to the right and down
  .style(
    "transform",
    `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
  );

tourism.sort(function (a, b) {
  //     // range is flipped, so it ascends from bottom of chart
  return +a.late - +b.late;
});

const xScale = d3
  .scaleLinear()
  .domain([-45, 15])
  .rangeRound([0, dimensions.boundedWidth]);

const yScale = d3
  .scalePoint()
  .domain(tourism.map(xAccessor))
  .rangeRound([dimensions.boundedHeight, 0])
  .padding(0.4);

const dumbbellChart = bounds.append("g").attr("class", "dumbbellGroup");

const dumbbell = dumbbellChart
  .selectAll(".dumbbell")
  .data(tourism)
  .enter()
  .append("g")
  .attr("class", "dumbbell")
  .attr("transform", (d) => `translate(0,${yScale(xAccessor(d))})`);

//data labels: early
dumbbell
  .append("text")
  .attr("class", "label current")
  .attr("class", "graphic-label")
  .attr("x", (d) => xScale(earlyAccessor(d)))
  .attr("y", 0)
  .attr("dy", ".35em")
  .attr("dx", 10)
  .text((d) => earlyAccessor(d));

d3.select(".dumbbell:last-child")
  .append("text")
  .attr("class", "label future")
  .attr("class", "graphic-label")
  .attr("x", (d) => xScale(earlyAccessor(d)))
  .attr("y", 0)
  .attr("dy", -10)
  .attr("text-anchor", "middle")
  .text("2019");
const ballRadius = 5;
// dots earlier
dumbbell
  .append("circle")
  .attr("class", "dumbbell-circle")
  .attr("cx", (d) => xScale(earlyAccessor(d)))
  .attr("cy", 0)
  .attr("r", ballRadius);
//dots current
const circleBell = dumbbell
  .append("circle")
  .attr("class", "dumbbell-circle")
  .attr("cx", (d) => xScale(lateAccessor(d)))
  .attr("cy", 0)
  .attr("r", 5)
  .style("opacity", 0);

// data labels: current
const labelBell = dumbbell
  .append("text")
  .attr("class", "label current")
  .attr("class", "graphic-label")
  .attr("x", (d) => xScale(lateAccessor(d)))
  .attr("y", 0)
  .attr("dy", ".35em")
  .attr("dx", "-2.5em")
  .text((d) => lateAccessor(d))
  .style("opacity", 0);

const timeStampBell = d3
  .select(".dumbbell:last-child")
  .append("text")
  .attr("class", "label current")
  .attr("class", "graphic-label")
  .attr("x", (d) => xScale(lateAccessor(d)))
  .attr("y", 0)
  .attr("dy", -10)
  .attr("text-anchor", "middle")
  .text("2020 Q1")
  .style("opacity", 0);

function drawBell() {
  dumbbell
    .append("line")
    .attr("class", "line-between")
    .attr("x1", (d) => xScale(earlyAccessor(d)) - ballRadius)
    .attr("x2", (d) => xScale(earlyAccessor(d)) - ballRadius)
    .attr("y1", 0)
    .attr("y2", 0)
    .transition()
    .duration(1800)
    .attr("x1", (d) => xScale(earlyAccessor(d)) - ballRadius)
    .attr("x2", (d) => xScale(lateAccessor(d)) + ballRadius)
    .attr("y1", 0)
    .attr("y2", 0)
    .style("stroke", "2f9780")
    .style("stroke-width", "6");
  timeStampBell.transition().duration(2000).style("opacity", 1);

  circleBell.transition().duration(2000).style("opacity", 1);

  labelBell.transition().duration(2000).style("opacity", 1);
}

const xAxisGenerator = d3.axisBottom().ticks(8).tickSize(0).scale(xScale);

const xAxis = bounds
  .append("g")
  .call(xAxisGenerator)
  .style("transform", `translateY(${dimensions.boundedHeight}px)`)
  .attr("class", "greyaxis");
//draw peripherals
const xAxisLabel = xAxis
  .append("text")
  .attr("x", dimensions.boundedWidth / 2)
  .attr("y", dimensions.margin.bottom - 10)
  .html("year-on-year increase (%)")
  .attr("fill", "#505050")
  .attr("class", "x-axis-label");

bounds
  .append("g")
  .attr("class", "0line")
  .append("line")
  .attr("x1", xScale(0))
  .attr("x2", xScale(0))
  .attr("y1", dimensions.boundedHeight)
  .attr("y2", 0)
  .attr("stroke", "grey")
  .attr("stroke-dasharray", "2px 4px");

bounds
  .append("g")
  .attr("class", "greyaxis")
  .call(d3.axisLeft(yScale).tickSize(0));

module.exports.drawBell = drawBell;

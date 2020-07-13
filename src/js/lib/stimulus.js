const d3 = require("d3");
import { wrap, showBubbles } from "./labor.js";
xAccessor = (d) => d.country;
gdpAccessor = (d) => +d.gdp;
stimulusAccessor = (d) => +d.stimulus;

const width = window.innerWidth * 0.95;

let dimensions = {
  width: width,
  height: window.innerHeight * 0.9,
  margin: {
    top: 70,
    right: 20,
    bottom: 20,
    left: 80,
  },
};
dimensions.boundedWidth =
  dimensions.width - dimensions.margin.left - dimensions.margin.right;
dimensions.boundedHeight =
  dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

// Draw canvas
const wrapper = d3
  .select("#stimulus")
  .append("svg")
  // Note that these width and height sizes are the size "outside" of our plot
  .attr("width", dimensions.width)
  .attr("height", dimensions.height)
  .attr(
    "viewBox",
    "0 0 " +
      `${dimensions.width + dimensions.margin.right / 2}` +
      " " +
      `${dimensions.height}`
  )
  .attr("preserveAspectRatio", "xMinYMin");
const bounds = wrapper
  .append("g")
  .style(
    "transform",
    `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
  );

const yScale = d3
  .scaleLinear()
  .domain(d3.extent(stimulus, gdpAccessor))
  .rangeRound([dimensions.boundedHeight - 35, 0]);

const xScale = d3
  .scalePoint()
  .domain(stimulus.map(xAccessor))
  .rangeRound([dimensions.boundedWidth - 50, 0])
  .padding(0.4);

const radiusScale = d3
  .scaleSqrt()
  .domain(d3.extent(stimulus, stimulusAccessor))
  .range([0, 75]);
const circleChart = bounds.append("g").attr("class", "circleGroup");

const circleGroup = circleChart
  .selectAll(".circle-group")
  .data(stimulus)
  .enter()
  .append("g")
  .attr("class", "circle-group");
//.attr("transform", (d) => `translate(0,60)`);

const yAxis = bounds
  .append("g")
  .attr("class", "greyaxis")
  //.attr("transform", `translate(0,60)`)
  .call(d3.axisLeft(yScale).tickSize(0).tickFormat(d3.format(",.2r")));

function showCircles() {
  const circles = circleGroup
    .append("circle")
    .attr("class", "circle")
    .attr("cy", (d) => yScale(0))
    .attr("cx", (d) => xScale(xAccessor(d)))
    .attr("r", (d) => radiusScale(stimulusAccessor(d)))
    .attr("stroke", "#000")
    .attr("stroke-opacity", 0.3)
    .attr("fill", "#FCC6B7")
    .attr("fill-opacity", 0.4)
    .attr("id", (d) => `${d.country}`)
    .transition()
    .duration(2000)
    .delay(function (d, i) {
      return i * 100;
    })
    .attr("cy", (d) => yScale(gdpAccessor(d)));

  const circleLabels = circleGroup
    //.filter((d) => gdpAccessor(d) > 15000)
    .filter((d) => stimulusAccessor(d) > 750)
    .append("text")
    .attr("class", "circle-label")
    //.classed("graphic-label", true)
    .text((d) => `${d.country}`)
    //.text("ph")
    .attr("y", (d) => yScale(gdpAccessor(d)))
    .attr("x", (d) => xScale(xAccessor(d)))
    .attr("text-anchor", "middle")
    .attr("class", "graphic-label")
    .style("opacity", 0)
    .transition()
    .duration(1200)
    .delay(4500)
    .style("fill","#000")
    .style("opacity", 1);

  const fromElementX = xScale("Ethiopia");
  const fromElementY = yScale(772) - radiusScale(15) - 1;


  const endElementY = +fromElementY - radiusScale(15) - 65;

  bounds
    .append("line")
    .attr("x1", fromElementX)
    .attr("y1", fromElementY)
    .attr("x2", fromElementX)
    .attr("y2", endElementY)
    .attr("stroke", "grey")
    .style("opacity", 0)
    .transition()
    .duration(800)
    .delay(5000)
    .style("opacity", 1);

  bounds
    .append("text")
    .attr("x", fromElementX)
    .attr("y", endElementY)
    .attr("text-anchor", "middle")
    .classed("graphic-label", true)
    .attr("dy", "-1.7em")
    .text("Ethiopia")
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .delay(5000)
    .style("fill","#000")
    .style("opacity", 1);

  bounds
    .append("text")
    .attr("x", fromElementX)
    .attr("y", endElementY)
    .attr("dy", "-.65em")
    .attr("dx", ".15em")
    .attr("text-anchor", "middle")
    .classed("graphic-label", true)
    //.attr("dy","-2em")
    .text("Stimulus per capita:$15")
    .style("fill","#000")
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .delay(5000)
    .style("opacity", 1);
}
// .attr("dx", "-.35em")
// .attr("dy", "-.35em");

// const yAxisLabel = wrapper
//   .append("text")
//   .attr("y", 40)
//   .attr("x", 15)
//   .text(`人均GDP（當前美元等價）`)
//   .call(wrap, 40);

wrapper
  .append("text")
  .attr("id", "y-percap")
  .attr("x", 10)
  .attr("y", 10)
  .attr("class", "greyaxis")
  .style("color", "#f2f2f2")
  .text("GDP per capita ($)")
  .attr("text-anchor", "left")
  .call(wrap, 40);

function make_y_gridlines() {
  return d3.axisLeft(yScale).ticks(7);
}
circleChart
  .append("g")
  .attr("class", "grid")
  .call(make_y_gridlines().tickSize(-width).tickFormat(""));
// add legend

var valuesToShow = [50, 500, 5000];
var xCircle = 50;
var xLabel = 250;
var yCircle = 75;
const legend = bounds
  .append("g")
  .attr(
    "transform",
    `translate(${dimensions.boundedWidth / 30},${
      dimensions.boundedHeight / 10
    })`
  );

legend
  .append("text")
  .attr("x", xCircle)
  .attr("dx", "-4em")
  .attr("dy", "-2em")
  .text("Stimulus per capita ($)")
  .classed("graphic-label", true);
const legendBody = legend.selectAll("legendCircle").data(valuesToShow).enter();

legendBody
  .append("circle")
  .attr("cx", xCircle)
  .attr("cy", function (d) {
    return yCircle - radiusScale(d);
  })
  .attr("r", function (d) {
    return radiusScale(d);
  })
  .style("fill", "none")
  .attr("stroke", "grey");

legendBody
  .selectAll("legend")
  .data(valuesToShow)
  .enter()
  .append("text")
  .attr("x", xCircle)
  .attr("y", function (d) {
    return yCircle - 2 * radiusScale(d) - 5;
  })
  .text(function (d) {
    return d3.format(",.2r")(d);
  })
  .style("font-size", 10)
  //.attr("alignment-baseline", "middle")
  .attr("text-anchor", "middle")
  .classed("graphic-label", true);

//showCircles();
export { showCircles };

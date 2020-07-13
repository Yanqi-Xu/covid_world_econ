const d3 = require("d3");
// Access data
const yearAccessor = (d) => d.year;
const changeAccessor = (d) => +d.change;

// Create chart dimensions
const width = window.innerWidth * 0.95;

let dimensions = {
  width: width,
  height: window.innerHeight * 0.8,
  margin: {
    top: 30,
    right: 5,
    bottom: 20,
    left: 30,
  },
};
// Our wrapper encompasses the whole chart; we need to subtract our margins to determine our bounds
dimensions.boundedWidth =
  dimensions.width - dimensions.margin.left - dimensions.margin.right;
dimensions.boundedHeight =
  dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

// Draw canvas
const wrapper = d3
  .select("#emissions")
  .append("svg")
  .attr("width", dimensions.width)
  .attr("height", dimensions.height)
  .attr(
    "viewBox",
    `0 0 ${dimensions.width} ${dimensions.height + dimensions.margin.top + 10}`
  );
const bounds = wrapper
  .append("g")
  .style(
    "transform",
    `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
  );

// Create scales
const xScale = d3
  .scaleBand()
  .domain(d3.range(emissions.length))
  .range([0, dimensions.boundedWidth])
  .padding(0.2);

const yScale = d3
  .scaleLinear()
  .domain(d3.extent(emissions, changeAccessor))
  .rangeRound([dimensions.boundedHeight, 0])
  .nice();

const pal = ["#5ab68a", "#f87f2e"];

const barGroups = bounds.append("g").selectAll(".bars").data(emissions);

barGroups
  .enter()
  .append("rect")
  .attr("class", "bars")
  .attr("x", (d, i) => xScale(i))
  .attr("y", (d) => yScale(Math.max(changeAccessor(d), 0)))
  .attr("width", xScale.bandwidth())
  .attr("height", (d) => Math.abs(yScale(changeAccessor(d)) - yScale(0)))
  .attr("fill", (d) => pal[changeAccessor(d) > 0 ? 1 : 0]);
const xAxisGenerator = (g) =>
  g
    .attr("transform", `translate(0,${dimensions.margin.top})`)
    .call(
      d3.axisTop(xScale).ticks(width / 80)
      //.tickFormat(tickFormat)
    )
    .call((g) => g.select(".domain").remove());

const yAxis = bounds
  .call(d3.axisLeft(yScale).tickSize(0).tickPadding(6))
  .classed("greyaxis", true);
//.call((g) => g.select(".domain").remove());

yAxis
  .append("text")
  .attr("class", "y-axis-label")
  .attr("dy", "-2.5em")
  .attr("dx", "1.5em")
  .text("Gigatons (Gt)")
  .attr("text-anchor", "middle")
  .attr("transform", "translate(10,20)");

const crisisStart = [1929, 1939, 1979, 2007];
const crisisEnd = [1939, 1945, 1980, 2008];
const crisisName = ["Great Depression", "World War II", "Second Oil Crisis", "Global Financial Crisis"];
let crises = [];
for (let i = 0; i < crisisName.length; i++) {
  crises.push({
    start: crisisStart[i],
    end: crisisEnd[i],
    name: crisisName[i],
  });
}

const timeStamps = bounds
  .append("g")
  .classed("time-stamps", true)
  .selectAll("time-stamps")
  .data(crises)
  .enter();

timeStamps
  .append("line")
  .attr("x1", (d) => xScale(d.start - 1900))
  .attr("x2", (d) => xScale(d.start - 1900))
  //.attr("height", (d) => xScale.bandwidth() * (d.end - d.start))
  .attr("y1", yScale(0))
  .attr(
    "y2",
    (d, i) =>
      (5 * dimensions.boundedHeight) / 12 -
      ((i + 1) * dimensions.boundedHeight) / 11
  )
  //.attr("width", yScale(d3.max(emissions, changeAccessor)) - 100)
  .style("stroke", "#B377E6");

timeStamps
  .append("text")
  .attr("x", (d) => xScale(d.start - 1900))
  .attr(
    "y",
    (d, i) =>
      (5 * dimensions.boundedHeight) / 12 -
      ((i + 1) * dimensions.boundedHeight) / 11
  )
  .attr("dy", "-.35em")
  .attr("text-anchor", "middle")
  .classed("graphic-label", true)
  .text((d) => d.name);

wrapper
  .append("text")
  .attr("x", xScale(2020 - 1900))
  .attr("y", yScale(changeAccessor(emissions.slice(-1)[0])))
  .attr("dy", "1em")
  .attr("dx", "-2em")
  .classed("graphic-label", true)
  .text("2020")
  .style(
    "transform",
    `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
  );

//.style("opacity", 0.4)
function make_y_gridlines() {
  return d3.axisLeft(yScale).ticks(5);
}

bounds
  .append("g")
  .attr("class", "grid")
  .call(make_y_gridlines().tickSize(-dimensions.boundedWidth).tickFormat(""));

var d3 = require("d3");
const _ = require("lodash");
import * as topojson from "topojson-client";
const nameMap = world.objects.countries.geometries;

const countries = topojson.feature(world, world.objects.countries).features;

let inputValue = 0;
const date = [
  "2020-03-12",
  "2020-03-26",
  "2020-04-09",
  "2020-04-23",
  "2020-05-07",
  "2020-05-21",
];

const totalRestrict = [4053, 38447, 45124, 51024, 59535, 62601];
document.getElementById("total").innerHTML = totalRestrict[0];
// Access stimulus
function dateSelector(i) {
  const mobilityDate = mobility.filter((d) => d.date.indexOf(date[i]) > -1);
  return mobilityDate;
}
const width = window.innerWidth;
const mapRatio = 0.5;
let dimensions = {
  width: width,
  height: width * mapRatio,
  margin: {
    top: 20,
    right: 10,
    bottom: 30,
    left: 10,
  },
};
dimensions.boundedWidth =
  dimensions.width - dimensions.margin.left - dimensions.margin.right;
dimensions.boundedHeight =
  dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

// Draw canvas
const wrapper = d3
  .select("#mobility")
  .append("svg")
  .attr("id", "map-container")
  // Note that these width and height sizes are the size "outside" of our plot
  .attr("width", dimensions.width)
  .attr("height", dimensions.height + dimensions.margin.bottom)
  .attr(
    "viewBox",
    "0 0 " +
      dimensions.width +
      " " +
      `${dimensions.height + dimensions.margin.bottom}`
  )
  .attr("preserveAspectRatio", "xMinYMin");

const bounds = wrapper.append("g");

const mercatorProjection = d3
  .geoMercator()
  .clipExtent([
    [20, 20],
    [width * 0.85, dimensions.height * 0.85],
  ])
  .fitSize(
    [dimensions.width, dimensions.height + 50],
    topojson.feature(world, world.objects.countries)
  )
  // .scale(150)
  .translate([dimensions.width / 2, dimensions.height / 2]);
// console.log(mercatorProjection)
var geoPath = d3.geoPath().projection(mercatorProjection);

const color = d3.scaleQuantize().domain([0, 250]).range(d3.schemeReds[9]);
bounds
  .selectAll(".country")
  .data(countries)
  .enter()
  .append("path")
  .attr("class", "country")
  .attr("fill", (data) => {
    const idIndex = _.findIndex(dateSelector(0), { id: data.id });

    const mobData = dateSelector(0)[idIndex];
    const mobDummy = mobData || {
      region: null,
      restrict: null,
      date: date[0],
      id: data.id,
      國家或地區: null,
    };
    //console.log("id is" + data.id + data.properties.name + "idIndex" + idIndex)
    const restrcitValue = mobDummy.restrict;
    const fillColor = restrcitValue === null ? "#F2F2F2" : color(restrcitValue);
    // console.log(fillColor)
    return fillColor;
  })
  .attr("stroke", "#333")
  .attr("stroke-width", "0.3px")
  .attr("d", geoPath)
  .on("mouseover", function (d) {
    d3.select(this).classed("selected", true);
  })
  .on("mouseout", function (d) {
    d3.select(this).classed("selected", false);
  });

//timeslide function
d3.select("#timeslide").on("input", function () {
  update(+this.value);
  //tooltipUpdate(+this.value)
});
function update(value) {
  document.getElementById("range").innerHTML = date[value];
  document.getElementById("total").innerHTML = totalRestrict[value];
  inputValue = date[value];
  d3.selectAll(".country").attr("fill", (data) => {
    const idIndex = _.findIndex(dateSelector(value), { id: data.id });

    const mobData = dateSelector(value)[idIndex];
    const mobDummy = mobData || {
      region: null,
      restrict: null,
      date: date[value],
      id: data.id,
      國家或地區: null,
    };
    //console.log("id is" + data.id + data.properties.name + "idIndex" + idIndex)
    const restrcitValue = mobDummy.restrict;
    const fillColor = restrcitValue === null ? "#F2F2F2" : color(restrcitValue);
    // console.log(fillColor)
    return fillColor;
  });
}
inputValue = document.getElementById("range").value;

function legend({
  color,
  title,
  tickSize = 5,
  width = 360,
  height = 44 + tickSize,
  marginTop = 18,
  marginRight = 0,
  marginBottom = 16 + tickSize,
  marginLeft = 0,
  ticks = width / 64,
  tickFormat,
  tickValues,
} = {}) {
  width = width * 1.4;
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("overflow", "visible")
    .style("display", "block");

  let x;

  // Continuous
  if (color.interpolator) {
    x = Object.assign(
      color
        .copy()
        .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
      {
        range() {
          return [marginLeft, width - marginRight];
        },
      }
    );

    svg
      .append("image")
      .attr("x", marginLeft)
      .attr("y", marginTop)
      .attr("width", width - marginLeft - marginRight)
      .attr("height", height - marginTop - marginBottom)
      .attr("preserveAspectRatio", "none")
      .attr("xlink:href", ramp(color.interpolator()).toDataURL());

    // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
    if (!x.ticks) {
      if (tickValues === undefined) {
        const n = Math.round(ticks + 1);
        tickValues = d3
          .range(n)
          .map((i) => d3.quantile(color.domain(), i / (n - 1)));
      }
      if (typeof tickFormat !== "function") {
        tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
      }
    }
  }

  // Discrete
  else if (color.invertExtent) {
    const thresholds = color.thresholds
      ? color.thresholds() // scaleQuantize
      : color.quantiles
      ? color.quantiles() // scaleQuantile
      : color.domain(); // scaleThreshold

    const thresholdFormat =
      tickFormat === undefined
        ? (d) => d
        : typeof tickFormat === "string"
        ? d3.format(tickFormat)
        : tickFormat;

    x = d3
      .scaleLinear()
      .domain([-1, color.range().length - 1])
      .rangeRound([marginLeft, width - marginRight]);

    svg
      .append("g")
      .selectAll("rect")
      .data(color.range())
      .join("rect")
      .attr("x", (d, i) => x(i - 1))
      .attr("y", marginTop)
      .attr("width", (d, i) => x(i) - x(i - 1))
      .attr("height", height - marginTop - marginBottom)
      .attr("fill", (d) => d);

    tickValues = d3.range(thresholds.length);
    tickFormat = (i) => thresholdFormat(thresholds[i], i);
  }

  svg
    .append("g")
    .attr("transform", `translate(0, ${height - marginBottom})`)
    .call(
      d3
        .axisBottom(x)
        .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
        .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
        .tickSize(tickSize)
        .tickValues(tickValues)
    )
    .call((g) =>
      g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height)
    )
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .append("text")
        .classed("y-axis-label", true)
        .attr("y", marginTop + marginBottom - height - 6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "400")
        .attr("font-size", "1.3em")
        .text(title)
    );

  return svg.node();
}

wrapper
  .append("g")
  .attr("class", "legend")
  .attr(
    "transform",
    `translate(${width * 0.22}, ${
      (dimensions.boundedHeight +
        dimensions.margin.left +
        dimensions.margin.bottom) *
      0.9
    })`
  )
  .append(() =>
    legend({
      color,
      title: "Travel restrictions issued to other countries",
      width: dimensions.width / 3,
      tickFormat: ".0f",
    })
  )
  .classed("y-axis-label", true);

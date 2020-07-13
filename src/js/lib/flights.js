const d3 = require("d3");
// Access data
const rAccessor = (d) => 100 + +d.rpk;
const newAccessor = (d) => 100 + +d.new;
const shareAccessor = (d) => +d.share;

// Set up chart dimensions
const width = d3.min([window.innerWidth, window.innerHeight]) * 0.9;

let dimensions = {
  width: width,
  height: width * 0.7 + 5,
  margin: {
    top: 20,
    right: 10,
    bottom: 55,
    left: 50,
  },
};
// Our wrapper encompasses the whole chart; we need to subtract our margins to determine our bounds
dimensions.boundedWidth =
  dimensions.width - dimensions.margin.left - dimensions.margin.right;
dimensions.boundedHeight =
  dimensions.height - dimensions.margin.top - dimensions.margin.bottom;
const themeColors = [
  "#319780",
  "#C69C6D",
  "#FFE267",
  "#FE7F67",
  "#A1D1D2",
  "#75ACE5",
  "#B377E6",
  "#FFE267",
  "#E2AF78",
];
// Draw canvas
const wrapper = d3
  .select("#flights")
  .append("svg")
  .attr("width", dimensions.width)
  .attr("height", dimensions.height)
  .attr("viewBox", `0 -20 ${dimensions.width} ${dimensions.height + 20}`);

const bounds = wrapper
  .append("g")
  .attr(
    "transform",
    `translate(${dimensions.width / 2}, ${dimensions.height / 2 + 15})`
  );

const radius = d3.min([dimensions.boundedWidth, dimensions.boundedHeight]) / 2;

// Create Scales
const angleScale = d3
  .scaleLinear()
  .domain([0, 100])
  .range([0, 2 * Math.PI]);

const radiusScale = d3.scaleSqrt().domain([0, 100]).range([0, radius]);

const pie = d3
  .pie()
  .value(shareAccessor)
  .sort(function (a, b) {
    return shareAccessor(a) - shareAccessor(b);
  });
const pie2 = d3.pie().value;
//color scales
const color = d3.scaleOrdinal().domain(flights).range(themeColors);

//Draw Data
//Arc initializer
const arc = d3.arc().innerRadius(0);

const segmentGroup = bounds.append("g").attr("class", "segment-group");

arc.outerRadius(radius);
const segments = segmentGroup.selectAll(".segment").data(pie(flights));

const newSegments = segments.enter().append("g").attr("class", "segment");
//update();
function updatePie() {
  const init = newSegments
    .append("path")
    .attr("fill", (d, i) => color(i))
    .attr("d", arc)
    .attr("stroke", "white")
    .attr("stroke-width", "2px")
    .transition()
    .duration(1000);

  const yLabelPosit = function (d) {
    var a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2;
    d.cy = Math.sin(a) * (radius - 45);
    return (d.y = Math.sin(a) * (radius + 30));
  };

  const xLabelPosit = function (d) {
    var a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2;
    d.cx = Math.cos(a) * (radius - 45);
    return (d.x = Math.cos(a) * (radius + 30));
  };

  const flightsLabels = segments
    .enter()
    .append("g")
    .classed("pie-labels", true);

  flightsLabels
    .append("text")
    .attr("text-anchor", "right")
    .attr("x", (d) => xLabelPosit(d))
    .attr("y", (d) => yLabelPosit(d))
    .text((d) => `${d.data.region}`)
    // .text((d) => `${d.data.region} 市場份額：${shareAccessor(d.data)}`)
    .attr("dx", "-1em")
    .attr("dy", "-1.2em")
    .each(function (d) {
      var bbox = this.getBBox();
      d.sx = d.x - bbox.width / 2 - 2;
      d.ox = d.x + bbox.width / 2 + 2;
      d.sy = d.oy = d.y + 5;
    })
    .classed("graphic-label", true);

  segments
    .enter()
    .append("path")
    .attr("class", "pointer")
    .style("fill", "none")
    .style("stroke", "rgba(155, 155, 155,.7)")
    .attr("d", function (d) {
      if (d.cx > d.ox) {
        return (
          "M" +
          d.sx +
          "," +
          d.sy +
          "L" +
          d.ox +
          "," +
          d.oy +
          " " +
          d.cx +
          "," +
          d.cy
        );
      } else {
        return (
          "M" +
          d.ox +
          "," +
          d.oy +
          "L" +
          d.sx +
          "," +
          d.sy +
          " " +
          d.cx +
          "," +
          d.cy
        );
      }
    });

  arc.outerRadius((d) => radiusScale(rAccessor(d.data)));
  const marchPie = init.transition().duration(3500).delay(2000).attr("d", arc);

  const outline = segmentGroup
    .append("circle")
    .attr("r", radius)
    .style("stroke", "black")
    .style("stroke-dasharray", "2,2")
    .style("stroke-width", ".5px")
    .style("fill", "none")
    .style("opacity", 0)
    .transition()
    .duration(1500)
    .delay(4500)
    .style("opacity", 1);

  const marchLabel = d3
    .select("#month")
    .transition()
    .duration(2000)
    .delay(3000)
    .text("March year-on-year change");

  const rpks = flightsLabels
    .append("text")
    .attr("text-anchor", "left")
    .attr("x", (d) => xLabelPosit(d))
    .attr("dx", "-1em")
    .attr("y", (d) => yLabelPosit(d))
    .text((d) => `${d.data.rpk}%`)
    .each(function (d) {
      var bbox = this.getBBox();
      d.sx = d.x - bbox.width / 2 - 2;
      d.ox = d.x + bbox.width / 2 + 2;
      d.sy = d.oy = d.y + 5;
    })
    .classed("graphic-label", true)
    .style("opacity", 0)
    .transition()
    .duration(2000)
    .delay(3000)
    .style("opacity", 1);

  setTimeout(() => {
    rpks
      .transition()
      .delay(2000)
      .duration(3000)
      .text((d) => d.data.new + "%");

    marchLabel.transition().duration(3000).delay(2000).text("April year-on-year change");

    arc.outerRadius((d) => radiusScale(newAccessor(d.data)));
    const aprilPie = marchPie.transition().duration(3000).attr("d", arc);
  }, 4000);

  d3.select(".pie-labels").attr("transform", `translate(-${width / 15},0)`);
}

module.exports.updatePie = updatePie;

const d3 = require("d3");
import { pick } from "lodash";
const width = 100;
const height = 30;
const margin = 3;

const timeConv = d3.timeParse("%Y-%m-%d");
const x = d3
  .scaleLinear()
  .range([0, width - margin * 2])
  .domain(d3.extent(metal, (d) => timeConv(d.date)));

const y = d3.scaleLinear().range([height, 0]);

const metalPal = ["#FFE267", "#AAA9AD", "#C0C0C0"];
const colorScale = d3.scaleOrdinal().domain("gold", "platinum", "silver").range(metalPal);

function sparkline(elemId, type) {
  let data = metal.map((d) => pick(d, ["date", type]));
  const yAccessor = (d) => +d[type];
  y.domain(d3.extent(data, (d) => yAccessor(d)));
  const lineGen = d3
    .line()
    .x((d) => x(timeConv(d.date)))
    .y((d) => y(yAccessor(d)))
    .curve(d3.curveBasis);
  var wrapper = d3
    .select(elemId)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("transform", "translate(0,8)");

  bounds = wrapper.append("g").attr("transform", `translate(${margin},0)`);

  bounds
    .append("path")
    .attr("class", "sparkline")
    .attr("d", lineGen(data))
    .attr("stroke", colorScale(type));
  bounds
    .append("circle")
    .attr("class", "sparkcircle")
    .attr("cx", x(timeConv(data[134].date)))
    .attr("cy", y(data[134][type]))
    .attr("r", 1.5);
  const dataEndPoint = data[134][type];

bounds.append("line")
.attr("x1",0)
.attr("x2",width)
.attr("y1",height)
.attr("y2",height)
//.attr("line-width",0.2)
.attr("stroke","#75ace5")

bounds.append("line")
.attr("x1",0)
.attr("x2",0)
.attr("y1",0)
.attr("y2",height)
//.attr("line-width",0.2)
.attr("stroke","#75ace5")

  d3.select(elemId)
    .append("span")
    //.attr("width", `${dataEndPoint.length + 2}em`)
    .attr("class", "sparkline-label")
    .html("$"+ Math.round(dataEndPoint))
    .style("display", "inline-block");
}
sparkline("#spark-gold", "gold");
sparkline("#spark-platinum", "platinum");
sparkline("#spark-silver", "silver");

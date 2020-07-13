const d3 = require("d3");
const margin = {
    top: 20,
    right: 10,
    bottom: 8,
    left: 50,
  },
  width = window.innerHeight / 3.5, // Use the window's width
  height = width; // Use the window's height
const numPerRow = 10;
const size = 15;
const scale = d3
  .scaleLinear() // <-A
  .domain([0, numPerRow - 1])
  .range([0, size * numPerRow]);

const graph = d3.select("#jobs");

const nest = d3
  .nest()
  .key((d) => d.dem)
  .rollup(function (c) {
    return c.map(function (d) {
      return {
        eng: d.eng,
        jan: +d.jan,
        feb: +d.feb,
        mar: +d.mar,
        apr: +d.apr,
      };
    })[0];
  })
  .entries(jobs);

const demArr = (month) => [
  month.value.jan,
  month.value.feb,
  month.value.mar,
  month.value.apr,
];

nest.map((d) => {
  d.value.arr = demArr(d);
  d.value.rounded = demArr(d).map((d) => Math.round(d));
});

const group = graph
  .selectAll(".container")
  .data(nest)
  .join("div")
  .attr("class", "container")
  .attr("id", (d) => d.value.eng);

const label = group
  .append("div")
  .attr("class", "waffle-label")
  .append("text")
  .attr("class", "graphic-label");

function drawTogether(sel) {
  sel.each(function (d) {
    loop(d3.select(this));
  });
}
const monthConv = d3
  .scaleOrdinal()
  .domain([0, 1, 2, 3])
  .range(["JAN", "FEB", "MAR", "APR"]);
function loop(self) {
  let i = 0;
  let drawThis = d3.interval(function () {
    let n = self.datum().value.arr[i];
    let nRounded = self.datum().value.rounded[i];
    chart(self, nRounded);
    label.html((d) => `${d.key}:<br>${monthConv(i)} ${d.value.arr[i]}%`);
    i++;
    if (i == 4) {
      clearInterval(drawThis);
      i = 0;
    }
  }, 1500);
}
drawTogether(group);

const chart = function (selection, value) {
  //const selection = d3.selectAll(bind)
  if (selection.select("svg").empty()) {
    selection
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  }

  function gridGen(waffle) {
    const join = waffle.selectAll("rect").data(d3.range(100));

    join
      .enter()
      .append("rect")
      .attr("x", (d, i) => {
        const n = i % numPerRow;
        return scale(n);
      })
      .attr("y", (d, i) => {
        const n = Math.floor(i / 10);
        return scale(n);
      })
      .attr("width", size)
      .attr("height", size)
      .attr("stroke-width", 2)
      .attr("stroke", "white")
      .merge(join)
      .transition()
      .duration(1000)
      .attr("fill", (d, i) => (i < value ? "#de3d83" : "#e0e5db"));
  }
  return selection.select("svg g").call(gridGen);
};

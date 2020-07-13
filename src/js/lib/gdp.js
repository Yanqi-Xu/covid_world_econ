const d3 = require("d3");
// Set up margin conventions
const margin = {
    top: 25,
    right: 10,
    bottom: 10,
    left: 10,
  },
  width = window.innerWidth * 0.95 - margin.left - margin.right, // Use the window's width
  height = window.innerHeight * 0.85 - margin.top - margin.bottom; // Use the window's height

const wrapper = d3
  .select("#gdp")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

const gdpSVG = wrapper
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

gdpSVG
  .append("text")
  .attr("x", 0)
  .attr("y", "-.7em")
  .text("Purchasing Power Parities (Int'l $")
  .classed("graphic-label", true)
  .attr("id", "treemap-headline");
const growth = [2.898, -3.029];
//This handles data filtering and generate a filtered array
function yearSelector(year) {
  //filter the right column of year "x2018" and such
  const yearFiltered = gdp.map(function (d) {
    return {
      country: d.country,
      value: d[year],
    };
  });
  //console.log(yearFiltered)
  return yearFiltered;
}
const themeColors = [
  "#319780",
  "#FE7F67",
  "#C69C6D",
  "#FCC6B7",
  "#A1D1D2",
  "#75ACE5",
  "#B377E6",
  "#FFE267",
  "#E2AF78",
];

const thisYear = "x2019";
const thisData = yearSelector(thisYear);
// let lastDig = thisYear.charAt(thisYear.length - 1);
// let nextDig = +lastDig + 1;
// let newLastDig = nextDig.toString();
// let nextYear = thisYear.replace(lastDig, newLastDig);
let nextYear = "x2020";
const nextData = yearSelector(nextYear);
const color = d3.scaleOrdinal(themeColors);
// set up treemap layout
const treemap = d3
  .treemap()
  .tile(d3.treemapResquarify)
  .size([width, height])
  .padding(1);

d3.select("#total-gdp").attr();

// start wrapping in function
const nest = d3.nest().key((d) => d.country);
const format2 = d3.format(",.3r");
function withData(json) {
  //nest the filtered json, generate the hierarchy object
  const root = d3
    .hierarchy(
      {
        values: nest.entries(json),
      },
      function (d) {
        return d.values;
      }
    )
    .sum((d) => d.value)
    .sort(function (a, b) {
      return b.value - a.value;
    });
  //add a bunch of properties to the root object
  treemap(root);
  return root;
}

const root = withData(thisData);
const leaf = gdpSVG.selectAll(".newSquares").data(root.leaves());

const leafEnter = leaf
  .enter()
  .append("g")
  .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
  .attr("class", "newSquares");

leafEnter
  .append("rect")
  .attr("id", function (d) {
    return d.parent.data.key;
  })
  .attr("fill", (d) => color(d.data.country))
  .attr("fill-opacity", 0.9)
  .attr("width", (d) => d.x1 - d.x0)
  .attr("height", (d) => d.y1 - d.y0);

// const square = leaf.select("square");

// and a text for that g
leafEnter
  .append("text")
  .classed("gdp-label", true)
  .text((d) => d.data.country)
  .attr("x", 0)
  .attr("y", 0)
  .attr("dx", ".2em")
  .attr("dy", "1.2em")
  .attr("x", 0)
  .attr("y", 0)
  .attr("fill", "white");

leafEnter
  .append("text")
  .classed("gdp-value", true)
  .attr("x", 0)
  .attr("y", 0)
  .attr("dx", ".2em")
  .text(function (d) {
    return Math.round(d.data.value / 1000) + " tr";
  })
  .attr("dy", "2.35em")
  .attr("fill", "white");
//}
const duration_transition = 2000;

d3.select("#year-display").text(thisYear.slice(1));

d3.select("#percent").text(growth[0]);

d3.select("#tot_value").text(format2(root.value / 1000));

root2 = withData(nextData);
ratio = Math.sqrt(root.value / root2.value);
treemap(root2);
function updateData() {
  leafEnter
    .data(root2.leaves(), function (d) {
      return d.parent.data.key;
    })
    .transition()
    .duration(duration_transition)
    .attr("transform", (d) => `translate(${d.x0 / ratio},${d.y0 / ratio})`);
  leafEnter
    .data(root2.leaves(), function (d) {
      return d.parent.data.key;
    })
    .select("rect")
    .transition()
    .delay(duration_transition)
    .attr("fill", (d) => color(d.data.country))
    .attr("fill-opacity", 0.9)
    .attr("width", (d) => (d.x1 - d.x0) / ratio)
    .attr("height", (d) => (d.y1 - d.y0) / ratio);

  d3.select("#year-display").text(nextYear.slice(1));

  d3.select("#tot_value")
    .transition()
    .duration(duration_transition)
    .tween("text", function (d) {
      var i = d3.interpolate(root.value / 1000, root2.value / 1000);

      return function (t) {
        d3.select("#tot_value").text(format2(i(t)));
      };
    });

  d3.select("#percent")
    .transition()
    .duration(duration_transition)
    .tween("text", function (d) {
      var i = d3.interpolate(growth[0], growth[1]);
      return function (t) {
        d3.select("#percent").text(format2(i(t)));
      };
    });

  leafEnter
    .data(root2.leaves(), function (d) {
      return d.parent.data.key;
    })
    .select(".gdp-label")
    .transition()
    .text(function (d) {
      return d.data.country;
    })
    .delay(duration_transition / 2);

  leafEnter
    .data(root2.leaves(), function (d) {
      return d.parent.data.key;
    })
    .select(".gdp-value")
    .transition()
    .text(function (d) {
      return Math.round(d.data.value / 1000) + " tr";
    })
    .delay(duration_transition / 2)
    .style("fill-opacity", 1);
}

function playGDP() {
  setTimeout(() => {
    updateData();
  }, 3000);
}

export { playGDP };

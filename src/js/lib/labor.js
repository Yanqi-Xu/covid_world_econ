const d3 = require("d3");
import { legendColor } from "d3-svg-legend";
const dots = new Array(368).fill().map((_, i) => ({ id: i }));

dots.forEach((v) => {
  v.period = +v.id > 164 ? "Q2" : "Q1";
});
dots.forEach((v) => {
  if (+v.id < 4) {
    v.bin = "低收入國家";
  } else if (+v.id < 4 + 24) {
    v.bin = "中低收入國家";
  } else if (+v.id < 4 + 24 + 125) {
    v.bin = "中高收入國家";
  } else if (+v.id < 4 + 24 + 125 + 13) {
    v.bin = "高收入國家";
  } else if (+v.id < 4 + 24 + 125 + 13 + 19) {
    v.bin = "低收入國家";
  } else if (+v.id < 4 + 24 + 125 + 13 + 19 + 116) {
    v.bin = "中低收入國家";
  } else if (+v.id < 4 + 24 + 125 + 13 + 19 + 116 + 15) {
    v.bin = "中高收入國家";
  } else {
    v.bin = "高收入國家";
  }
});
function wrap(text, width) {
  text.each(function () {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.2, // ems
      x = text.attr("x"),
      y = text.attr("y"),
      dy = text.attr("dy") ? text.attr("dy") : 0;
    tspan = text
      .text(null)
      .append("tspan")
      .attr("x", x)
      .attr("y", y)
      .attr("dy", dy + "em");
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
}

function bubbleChart() {
  // Constants for sizing
  var width = window.innerWidth * 0.95;
  var height = window.innerHeight * 0.78;

  // Locations to move bubbles towards, depending
  // on which view mode is selected.
  var center = { x: width / 2, y: height / 2 };

  var yearCenters = {
    高收入國家: { x: width / 3, y: height / 3 },
    中高收入國家: { x: (2 * width) / 3, y: height / 3 },
    低收入國家: { x: (2 * width) / 3, y: (2 * height) / 3 },
    中低收入國家: { x: width / 3, y: (2 * height) / 3 },
  };

  const yearsData = [
    {
      bin: "高收入國家",
      cat: "High-income-countries",
      Q1: 2.3,
      Q2: 12.2,
    },
    {
      bin: "中高收入國家",
      cat: "Upper-middle-income countries",
      Q1: 8.8,
      Q2: 9.9,
    },
    {
      bin: "中低收入國家",
      cat: "Lower-middle-income-countries",
      Q1: 1.9,
      Q2: 11.4,
    },
    { bin: "低收入國家",cat: "Low-income-countries", Q1: 1.7, Q2: 8.8 },
  ];

  var TitlesPos = {
    高收入國家: { x: width / 4, y: height / 12 },
    中高收入國家: { x: (3 * width) / 4, y: height / 12 },
    低收入國家: { x: (3 * width) / 4, y: height / 2 },
    中低收入國家: { x: width / 4, y: height / 2 },
  };

  // @v4 strength to apply to the position forces
  var forceStrength = 0.03;

  // These will be set in create_nodes and create_vis
  var svg = null;
  var bubbles = null;
  var nodes = [];

  // Charge function that is called for each node.
  // As part of the ManyBody force.
  // This is what creates the repulsion between nodes.
  //
  // Charge is proportional to the diameter of the
  // circle (which is stored in the radius attribute
  // of the circle's associated data.
  //
  // This is done to allow for accurate collision
  // detection with nodes of different sizes.
  //
  // Charge is negative because we want nodes to repel.
  // @v4 Before the charge was a stand-alone attribute
  // of the force layout. Now we can use it as a separate force!
  function charge(d) {
    return -Math.pow(d.radius, 3.21) * forceStrength;
  }

  // Here we create a force layout and
  // @v4 We create a force simulation now and
  // add forces to it.
  var simulation = d3
    .forceSimulation()
    .velocityDecay(0.2)
    .force("x", d3.forceX().strength(forceStrength).x(center.x))
    .force("y", d3.forceY().strength(forceStrength).y(center.y))
    .force("charge", d3.forceManyBody().strength(charge))
    .on("tick", ticked);

  // @v4 Force starts up automatically,
  // which we don't want as there aren't any nodes yet.
  simulation.stop();

  // Nice looking colors - no reason to buck the trend
  // @v4 scales now have a flattened naming scheme
  var fillColor = d3
    .scaleOrdinal()
    .domain(["Q1", "Q2"])
    .range(["#C69C6D", "rgb(204, 204, 204)"]);

  /*
   * This data manipulation function takes the raw data from
   * the CSV file and converts it into an array of node objects.
   * Each node will store data and visualization values to visualize
   * a bubble.
   *
   * rawData is expected to be an array of data objects, read in from
   * one of d3's loading functions like d3.csv.
   *
   * This function returns the new node array, with a node in that
   * array for each element in the rawData input.
   */
  function createNodes(rawData) {
    // Use the max total_amount in the data as the max in the scale's domain
    // note we have to ensure the total_amount is a number.
    var maxAmount = d3.max(rawData, function (d) {
      return +d.total_amount;
    });

    // Use map() to convert raw data into node data.
    // Checkout http://learnjsdata.com/ for more on
    // working with data.
    var myNodes = rawData.map(function (d) {
      return {
        id: d.id,
        radius: window.innerHeight / 200,
        bin: d.bin,
        group: d.group,
        period: d.period,
        x: Math.random() * 900,
        y: Math.random() * 800,
      };
    });

    // sort them to prevent occlusion of smaller nodes.
    myNodes.sort(function (a, b) {
      return b.value - a.value;
    });

    return myNodes;
  }

  /*
   * Main entry point to the bubble chart. This function is returned
   * by the parent closure. It prepares the rawData for visualization
   * and adds an svg element to the provided selector and starts the
   * visualization creation process.
   *
   * selector is expected to be a DOM element or CSS selector that
   * points to the parent element of the bubble chart. Inside this
   * element, the code will add the SVG continer for the visualization.
   *
   * rawData is expected to be an array of data objects as provided by
   * a d3 loading function like d3.csv.
   */

  svg = d3
    .select("#labor")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  var chart = function chart(rawData) {
    // convert raw data into nodes data

    nodes = createNodes(rawData);

    // Create a SVG element inside the provided selector
    // with desired size.
    // svg = d3
    //   .select(selector)
    //   .append("svg")
    //   .attr("width", width)
    //   .attr("height", height);

    // Bind nodes data to what will become DOM elements to represent them.
    bubbles = svg.selectAll(".bubble").data(nodes);

    // Create new circle elements each with class `bubble`.
    // There will be one circle.bubble for each object in the nodes array.
    // Initially, their radius (r attribute) will be 0.
    // @v4 Selections are immutable, so lets capture the
    // enter selection to apply our transtition to below.
    var bubblesE = bubbles
      .enter()
      .append("circle")
      .classed("bubble", true)
      .attr("class", (d) => `${d.bin} ${d.period}`)
      .attr("id", (d) => `${d.id}`)
      .attr("r", 0)
      .attr("fill", function (d) {
        return d.period == "Q1" ? "#C69C6D" : "#FFFFFF";
      })
      .attr("stroke", "none")
      .attr("stroke-width", 2);

    // @v4 Merge the original empty selection and the enter selection
    bubbles = bubbles.merge(bubblesE);

    // Fancy transition to make bubbles appear, ending with the
    // correct radius
    bubbles
      .transition()
      .duration(2000)
      .attr("r", function (d) {
        return d.radius;
      });

    // Set the simulation's nodes to our newly created nodes array.
    // @v4 Once we set the nodes, the simulation will start running automatically!

    bubbles
      .transition()
      .duration(2000)
      .delay(4000)
      .attr("fill", (d) => fillColor(d.period));
    simulation.nodes(nodes);

    // Set initial layout to single group.
    setTimeout(function () {
      groupBubbles();

      const legend = svg
        .append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", `translate(${(1 * width) / 5}, ${height / 14})`);

      // const legendTitle = svg
      //   .append("g")
      //   .attr("class", "legendTitle")
      //   .attr("transform", `translate(${(1 * width) / 8}, 15)`);
      const legendQ1 = legend.append("g").classed("q1", true);

      // legendTitle
      //   .append("circle")
      //   .attr("cx", 0)
      //   .attr("cy", 0)
      //   .attr("r", 4)
      //   .attr("fill", "none")
      //   .attr("stroke", "grey");

      // legendTitle
      //   .append("text")
      //   .attr("x", 0)
      //   .attr("y", 0)
      //   .attr("dx", "-1.35em")
      //   .attr("dy", ".35em")
      //   .text(`每  代表100萬個本季度相比上季度減少的全職工作崗位`)
      //   .classed("graphic-label", true)
      //   .classed("text", true);

      const yearTop =  svg
      .append("g")
      
      .attr("transform", `translate(${(1 * width) / 2}, 20)`)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("class", "bin-chatter")
      .attr("x", 0)
      .attr("y", 0)
      .attr("dx", "-1.35em")
      .attr("dy", ".35em")
      .text(`Change from 2019 Q4`)
      .classed("graphic-label", true)
      .classed("text", true)
      .attr("opacity",0);

      legendQ1
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 4)
        .attr("fill", fillColor("Q1"))
        .attr("stroke", "none");
      legendQ1
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", ".35em")
        .attr("dx", "1em")
        .text("Loss in 2020 Q1 (compared to 2019 Q4): 165 million")
        .classed("graphic-label", true);
      const legendQ2 = legend.append("g").classed("q2", true);

      const legendQ2Dot = legendQ2
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 20)
        .attr("r", 4)
        .attr("opacity", 0)
        .attr("fill", fillColor("Q2"))
        .attr("stroke", "none");

      const legendQ2Label = legendQ2
        .append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("dy", ".35em")
        .attr("dx", "1em")
        .attr("opacity", 0)
        .text("Loss in 2020 Q2 (compared to 2020 Q1): 200 million")
        .classed("graphic-label", true);

      legendQ2Label
        .transition()
        .delay(3800)
        .duration(1000)
        .attr("opacity", "1");

      legendQ2Dot.transition().delay(3800).duration(1000).attr("opacity", "1");
    }, 500);
  };

  /*
   * Callback function that is called after every tick of the
   * force simulation.
   * Here we do the acutal repositioning of the SVG circles
   * based on the current x and y values of their bound node data.
   * These x and y values are modified by the force simulation.
   */
  function ticked() {
    bubbles
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      });
  }

  /*
   * Provides a x value for each node to be used with the split by year
   * x force.
   */
  function nodeYearPosX(d) {
    return yearCenters[d.bin].x;
  }

  function nodeYearPosY(d) {
    return yearCenters[d.bin].y;
  }

  /*
   * Sets visualization in "single group mode".
   * The year labels are hidden and the force layout
   * tick function is set to move all nodes to the
   * center of the visualization.
   */
  function groupBubbles() {
    hideYearTitles();
    d3.selectAll(".legendOrdinal").transition().style("opacity", 1);
    d3.select(".legendTitle").transition().style("opacity", 1);
    
    // @v4 Reset the 'x' force to draw the bubbles to the center.
    simulation
      .force("x", d3.forceX().strength(forceStrength).x(center.x))
      .force("y", d3.forceY().strength(forceStrength).y(center.y));

    // @v4 We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
  }

  /*
   * Sets visualization in "split by year mode".
   * The year labels are shown and the force layout
   * tick function is set to move nodes to the
   * yearCenter of their data's year.
   */
  function splitBubbles() {
    showYearTitles();
    hideChatter();

    // @v4 Reset the 'x' force to draw the bubbles to their year centers
    simulation
      .force(
        "x",
        d3
          .forceX()
          .strength(forceStrength * 1.7)
          .x(nodeYearPosX)
      )
      .force(
        "y",
        d3
          .forceY()
          .strength(forceStrength * 1.7)
          .y(nodeYearPosY)
      );
    //simulation.force("center", d3.forceCenter(nodeYearPos))
    // @v4 We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
  }

  /*
   * Hides Year title displays.
   */
  function hideYearTitles() {
    svg.selectAll(".year").remove();
    //svg.selectAll(".bin-chatter").remove();
    svg.select(".bin-chatter").style("opacity",0)
  }

  function hideChatter() {
    d3.selectAll(".legendOrdinal").style("opacity", 0);
    d3.select(".legendTitle").style("opacity", 0);
  }
  /*
   * Shows Year title displays.
   */
  function showYearTitles() {
    // Another way to do this would be to create
    // the year texts once and then just hide them.

    // var yearsData = d3.keys(yearCenters);
    svg.select(".bin-chatter").style("opacity",1)
    var years = svg.selectAll(".year").data(yearsData);

    years
      .enter()
      .append("text")
      .attr("class", "year")
      .attr("x", function (d) {
        return TitlesPos[d.bin].x;
      })
      .attr("y", function (d) {
        return TitlesPos[d.bin].y;
      })
      .attr("text-anchor", "middle")
      .text(function (d) {
        return d.cat + " Q1：" + -d.Q1 + "% Q2：" + -d.Q2 + "%";
      })
      .classed("graphic-label", true)
      .call(wrap, 80);
  }

  /*
   * Externally accessible function (this is attached to the
   * returned chart function). Allows the visualization to toggle
   * between "single group" and "split by year" modes.
   *
   * displayName is expected to be a string and either 'year' or 'all'.
   */
  chart.toggleDisplay = function (displayName) {
    if (displayName === "bin") {
      splitBubbles();
    } else {
      groupBubbles();
    }
  };

  // return the chart function from closure.
  return chart;
}

/*
 * Below is the initialization code as well as some helper functions
 * to create a new bubble chart instance, load the data, and display it.
 */

var myBubbleChart = bubbleChart();
/*
 * Sets up the layout buttons to allow for toggling between view modes.
 */
function setupButtons() {
  d3.select("#toolbar")
    .selectAll(".button")
    .on("click", function () {
      // Remove active class from all buttons
      d3.selectAll(".button").classed("active", false);
      // Find the button just clicked
      var button = d3.select(this);

      // Set it as the active button
      button.classed("active", true);

      // Get the id of the button
      var buttonId = button.attr("id");

      // Toggle the bubble chart based on
      // the currently clicked button.
      myBubbleChart.toggleDisplay(buttonId);
    });
}
function showBubbles() {
  myBubbleChart(dots);
  setupButtons();
}

export { wrap };
export { showBubbles };

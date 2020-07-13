require("./lib/mobility.js");
const flightsJS = require("./lib/flights.js");
const tourismJS = require("./lib/tourism.js");
require("./lib/oil.js");
require("./lib/agriculture.js");
require("./lib/metal.js");
require("./lib/emissions.js");
require("./lib/labor.js");
require("./lib/sector.js");
require("./lib/jobs.js");
require("./lib/stocks.js");
require("./lib/trade.js");
require("./lib/stimulus.js");
const gdp = require("./lib/gdp.js");
import { updatePie } from "./lib/flights.js";
import { playGDP } from "./lib/gdp.js";
import { showCircles } from "./lib/stimulus.js";
import { showBubbles } from "./lib/labor.js";
const d3 = require("d3");
const scrollama = require("scrollama");

// flights.updatePie();
// tlPlane
const tlPlane = new TimelineMax({ reversed: false, paused: true });
tlPlane.from("#pinkie-plane", {
  duration: 4,
  x: -300,
  y: -300,
  ease: "power2",
});
//then tween element's y to 50
//.to("#pinkie-plane", { duration: 1, y: -200 });
// let tween = gsap.from("#stimulus-svg", {
//   viewBox: "1310 200 80 80",
//   duration: 1,
//   ease: "power2",
// });
// tween.play();
function dropMoney() {
  var tl = new TimelineMax({ delay: 0.5 }),
    svgRoot = document.getElementById("stimulus-svg");
  //TweenMax.set(svgRoot, { attr: { viewBox: "1300 200 80 80" } });
  tl.to(
    svgRoot,
    1.5,
    { attr: { viewBox: "1320 120 80 80" }, ease: Bounce.easeOut },
    "+=.5"
  );
}

// Initialize scroller
const scroller = scrollama();
const scroller1 = scrollama();
const scroller2 = scrollama();
const scroller3 = scrollama();
const scroller4 = scrollama();
const scroller5 = scrollama();
const scroller6 = scrollama();
const scroller7 = scrollama();
const scroller8 = scrollama();

const pages = d3.selectAll(".page").nodes();
var getNextSibling = function (elem, selector) {
  // Get the next sibling element
  var sibling = elem.nextElementSibling;

  // If there's no selector, return the first sibling
  if (!selector) return sibling;

  // If the sibling matches our selector, use it
  // If not, jump to the next sibling and continue the loop
  while (sibling) {
    if (sibling.matches(selector)) return sibling;
    sibling = sibling.nextElementSibling;
  }
};

// function handleStepExit(response) {
//   // response = { element, direction, index }
//   const page = document.querySelector(".page");
//   console.log(page);
//   page.scrollIntoView({
//     behavior: "smooth",
//     block: "nearest",
//     inline: "start",
//   });

//   // scrollIntoView({
//   //   behavior: "smooth", // smooth scroll
//   //   block: "start", // the upper border of the element will be aligned at the top of the visible part of the window of the scrollable area.
//   // });
//   //response.element.classList.add("is-active");
// }

// pages.forEach(function (step) {
//   scroller
//     .setup({
//       step: ".page",
//       debug: true,
//       offset: 0.8,
//     })
//     .onStepExit(handleStepExit);

//   //3. setup resize event
//   window.addEventListener("resize", scroller.resize);
// });

scroller1
  .setup({
    step: "#flights-page .title",
  })
  .onStepEnter((response) => tlPlane.play());

scroller2
  .setup({
    step: "#pinkie-plane",
    once: true,
    offset: 0.28,
  })
  .onStepEnter((response) => updatePie());

scroller3
  .setup({
    step: "#mountain",
    offset: 0.32,
  })
  .onStepEnter((response) => tourismJS.drawBell());

// scroller4
//   .setup({
//     step: "#fume-animation",
//     offset: 0.6,
//     once: true,
//     debug: true,
//   })
//   .onStepEnter((response) => console.log(response));
scroller5
  .setup({
    step: "#labor-page .hed",
    offset: 0.9,
    once: true,
  })
  .onStepEnter((response) => showBubbles());

scroller6
  .setup({
    step: "#total-gdp",
    offset: 0.25,
    once: true,
  })
  .onStepEnter((response) => playGDP());

scroller7
  .setup({
    step: "#stimulus-page .title",
    offset: 0.58,
  })
  .onStepEnter((response) => dropMoney());

scroller8
  .setup({
    step: "#stimulus-svg",
    once: true,
    offset: 0.38,
  })
  .onStepEnter((response) => {
    showCircles();
  });

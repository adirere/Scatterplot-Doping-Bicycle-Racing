import "./styles.scss";
import * as d3 from "d3";
import axios from "axios";
import { hsl } from "d3";

const app = document.getElementById("app");
const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

//get dataset
axios
  .get(url)
  .then((res) => {
    app.innerText = "";
    const dataset = res.data.map((r) => [
      convertMinAndSec(r.Time),
      r.Year,
      r.Doping,
      r.Name
    ]);
    console.log(dataset);
    function convertMinAndSec(str) {
      return new Date(`2010 01 01 00:${str}`);
    }

    buildScatterplot(dataset);
  })
  .catch((err) => {
    console.log(err);
  });

//build Scatterplot
const buildScatterplot = (dataset) => {
  const w = 920;
  const h = 630;

  //set the title
  d3.select("#app")
    .append("div")
    .attr("id", "title")
    .text("Doping in Professional Bicycle Racing")
    .style("color", "white")
    .style("font-size", "1.8rem")
    .style("padding", "10px");

  //declare empty tooltip
  d3.select("#app").append("div").attr("id", "tooltip");
  const tooltip = document.getElementById("tooltip");

  //build legend
  const legend = d3.select("#app").append("div").attr("id", "legend");

  legend
    .append("div")
    .attr("class", "legend-text")
    .text("No doping allegations")
    .append("div")
    .attr("class", "nodoping box");

  legend
    .append("div")
    .attr("class", "legend-text")
    .text("Riders with doping allegations")
    .append("div")
    .attr("class", "doping box");

  //build svg
  const svg = d3
    .select("#app")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  //draw x axis
  const minYear = d3.min(dataset, (d) => d[1]);
  const maxYear = d3.max(dataset, (d) => d[1]);

  const scaleX = d3.scaleLinear().domain([minYear, maxYear]).range([0, w]);

  const xAxis = d3.axisBottom().scale(scaleX).tickFormat(d3.format("d"));

  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0," + h + ")")
    .style("color", "white")
    .call(xAxis);

  //draw y axis
  const timeParse = d3.timeParse("%M:%S");
  const timeFormat = d3.timeFormat("%M:%S");

  const scaleY = d3
    .scaleTime()
    .domain([d3.min(dataset, (d) => d[0]), d3.max(dataset, (d) => d[0])])
    .range([0, h]);

  const yAxis = d3.axisLeft(scaleY).tickFormat(timeFormat);

  svg.append("g").attr("id", "y-axis").style("color", "white").call(yAxis);

  //drow data-points
  svg
    .selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("data-xvalue", (d) => d[1])
    .attr("data-yvalue", (d) => d[0])
    .attr("cx", 0)
    .attr("cy", (d) => scaleY(d[0]))
    .attr("r", 0)
    .style("fill", (d) => (d[2] ? "#FF004C" : "#CBFF00"))
    .on("mouseover", (d, i) => {
      tooltip.classList.add("show");
      tooltip.style.left = d.clientX + 10 + "px";
      tooltip.style.top = scaleY(i[0]) - 10 + "px";
      tooltip.setAttribute("data-year", i[1]);

      tooltip.innerHTML = `${i[3]}<br>
year: ${i[1]} time: ${i[0].getMinutes()}:${
        i[0].getSeconds() < 10 ? "0" + i[0].getSeconds() : i[0].getSeconds()
      } <br> 
      ${i[2]}`;
    })
    .on("mouseout", () => {
      tooltip.classList.remove("show");
    })
    .transition()
    .duration(200)
    .attr("cx", (d) => scaleX(d[1]))
    .attr("r", 6);
};

import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-brush',
  templateUrl: './brush.component.html',
  styleUrls: ['./brush.component.css']
})
export class BrushComponent implements OnInit {

  constructor() { }
  ngOnInit(): void {
    const margin = ({top: 10, right: 20, bottom: 20, left: 20});
  
    const height = 120;
    const width = 1200;

    const x = d3.scaleLinear([0, 10], [margin.left, width - margin.right])
    const rx = d3.randomUniform(...x.domain())
    const ry = d3.randomNormal(height / 2, height / 12)

    const xAxis = g => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    const svg = d3.select("#brush-chart").append("svg")
        .attr("viewBox", `0, 0, ${width}, ${height}`);

    const brush = d3.brushX()
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
        .on("start brush end", brushed);

    const circle = svg.append("g")
        .attr("fill-opacity", 0.2)
      .selectAll("circle")
      .data(Float64Array.from({length: 800}, rx))
      .join("circle")
        .attr("transform", d => `translate(${x(d)},${ry()})`)
        .attr("r", 3.5);

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(brush)
        .call(brush.move, [3, 5].map(x))
        .call(g => g.select(".overlay")
            .datum({type: "selection"})
            .on("mousedown touchstart", beforebrushstarted));

    function beforebrushstarted(event) {
      const dx = x(1) - x(0); // Use a fixed width when recentering.
      const [[cx]] = d3.pointers(event);
      const [x0, x1] = [cx - dx / 2, cx + dx / 2];
      const [X0, X1] = x.range();
      d3.select(this.parentNode)
          .call(brush.move, x1 > X1 ? [X1 - dx, X1] 
              : x0 < X0 ? [X0, X0 + dx] 
              : [x0, x1]);
    }

    function brushed(event) {
      const selection = event.selection;
      if (selection === null) {
        circle.attr("stroke", null);
      } else {
        const [x0, x1] = selection.map(x.invert);
        circle.attr("stroke", d => x0 <= d && d <= x1 ? "red" : null);
      }
    }
  }
}

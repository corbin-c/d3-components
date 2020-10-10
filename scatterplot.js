import { D3Component } from "./d3component.js";
class Scatterplot extends D3Component {
  static get classRules() {
    return [{
      attribute:"labels-style",
      property: "labelStyle",
      defaultValue: "visible",
      allowedValues: ["hover","visible","none"]
    },
    {
      attribute: "width",
      defaultValue: 720,
      func: (value) => parseInt(value)
    },
    {
      attribute: "height",
      defaultValue: false,
      func: function(value) {
        if (isNaN(value) || value === false || value == "") {
          return this.width/8*3;
        } else {
          return parseInt(value);
        }
      }
    },
    {
      attribute: "color",
      defaultValue: "none"
    },
    {
      attribute: "labels-value",
      property: "labelsValue",
      allowedValues: ["x","y","xy","label"],
      defaultValue: "label"
    },
    {
      attribute: "label-x",
      property: "labelX",
      defaultValue: ""
    },
    {
      attribute: "label-y",
      property: "labelY",
      defaultValue: ""
    },
    {
      attribute:"ticks-x",
      property: "ticksX",
      defaultValue: "null,null",
      func: (value) => value.split(",").map(e => ((e == "null") ? null : e))
    },
    {
      attribute:"ticks-y",
      property: "ticksY",
      defaultValue: "null,null",
      func: (value) => value.split(",").map(e => ((e == "null") ? null : e))
    },
    {
      attribute:"line-type",
      property:"lineType",
      defaultValue: "CatmullRom",
    },
    {
      attribute:"label-position",
      property:"labelPosition",
      defaultValue: "top",
      allowedValues: ["top","top-left","top-right","middle","middle-left","middle-right","bottom","bottom-left","bottom-right"],
      func: (value) => {
        let attributes = {
          top: {
            dy: "-0.7em"
          },
          bottom: {
            dy: "1.3em"
          },
          middle: {
            dy: "0.4em"
          },
          left: {
            "text-anchor": "end",
            dx: "-0.7em"
          },
          right: {
            "text-anchor": "start",
            dx: "0.7em"      
          }
        }
        let out = { "text-anchor": "middle" };
        Object.keys(attributes).map(position => {
          if (value.includes(position)) {
            Object.keys(attributes[position]).map(attribute => {
              out[attribute] = attributes[position][attribute];
            });
          }
        });
        return out;
      }
    },
    {
      attribute:"connected",
      property: "trace",
      defaultValue: "none",
      fallBack: "static",
      allowedValues: ["animated","static","none"],
      func: (value) => (value == "none") ? false:value
    }];
  }
  constructor() {
    super();
    this.duration = 300;
    this.margin = ({top: 20, right: 30, bottom: 30, left: 40});
    this.makeGraph();
    this.line = d3.line()
      .curve(d3.curveCatmullRom)
      .x(d => this.x(d.x))
      .y(d => this.y(d.y))
  }
  updateLabelPosition() {
    let dots = this.svg.selectAll(".dot");
    console.log(dots);
    dots.select("text")
      .attr("text-anchor", this.labelPosition["text-anchor"])
      .attr("dy", this.labelPosition["dy"] || 0)
      .attr("dx", this.labelPosition["dx"] || 0)
  }
  updateColor() {
    if (this.color != "none") {
      this.addStyleRule("svg path { stroke: "+this.color+"; }");
      this.addStyleRule(".dot circle { fill: "+this.color+"; }");
      this.addStyleRule(".dot text { fill: "+this.color+"; }");
    }
  }
  updateLineType() {
    try {
      this.line = d3.line()
        .curve(d3["curve"+this.lineType])
        .x(d => this.x(d.x))
        .y(d => this.y(d.y));
      this.updatePlot();
    } catch {
      this.line = d3.line()
        .curve(d3.curveCatmullRom)
        .x(d => this.x(d.x))
        .y(d => this.y(d.y));
      this.updatePlot();
    }
  }
  updateLabelsValue() {
    this.data.columns.map((group,i) => {
      let dots = this.svg.selectAll(".g"+i);
      dots.select("text").text(d => {
          if ((typeof d.name !== "undefined") && (this.labelsValue == "label")){
            return d.name
          } else {
            if ((this.labelsValue == "x") || (this.labelsValue == "y")) {
              return d3.format(".2f")(d[this.labelsValue])
            } else if (this.labelsValue == "xy") {
              return "x:"+d3.format(".2f")(d.x)+" | y:"+d3.format(".2f")(d.y)
            } else {
              return undefined;
            }
          }
        });
    });
  }
  updateLabelStyle() {
    console.log(this.labelStyle);
    if (this.labelStyle == "none") {
      this.addStyleRule(".dot text { visibility: hidden; }");
      this.removeStyleRule(".dot:hover text { visibility: visible; }");      
    } else if (this.labelStyle == "hover") {
      this.addStyleRule(".dot text { visibility: hidden; }");
      this.addStyleRule(".dot:hover text { visibility: visible; }");
    } else {
      this.removeStyleRule(".dot text { visibility: hidden; }");
      this.removeStyleRule(".dot:hover text { visibility: visible; }");      
    }
  }
  updateLabelX(value) {
    this.shadow.querySelector(".labelx").textContent = value;
  }
  updateLabelY(value) {
    this.shadow.querySelector(".labely").textContent = value;
  }
  updateHeight(value) {
    this.updateAxis();
    this.updatePlot();
  }
  updateWidth(value) {
    this.updateAxis();
    this.updatePlot();
  }
  updateTrace() {
    let opacity = [1,0];
    if (this.trace === false) {
      opacity = [0,1];
    } 
    this.data.columns.map((group,i) => {
      let trace = this.svg.select(".trace"+i);
      trace
        .attr("opacity",opacity[1])
        .transition("opacity")
          .duration(this.duration)
          .ease(d3.easeLinear)
          .attr("opacity",opacity[0]);
      if (this.trace == "animated") {
        const l = ((path) => {
          return d3.create("svg:path").attr("d", path).node().getTotalLength();
        })(this.line(this.data.data));
        trace
          .attr("stroke-dasharray", `0,${l}`)
          .transition()
            .duration(2500)
            .ease(d3.easeLinear)
            .attr("stroke-dasharray", `${l},${l}`); 
      }
    })
  }
  updatePlot() {
    this.data.columns.map((group,i) => {
      if (this.trace) {
        let trace = this.svg.select(".trace"+i);
        trace
          .transition("axis")
            .duration(this.duration)
            .ease(d3.easeLinear)
            .attr("d",this.line);
        if (this.trace !== "static") {
          const l = ((path) => {
            return d3.create("svg:path").attr("d", path).node().getTotalLength();
          })(this.line(this.data.data[i]));
          trace
            .transition("draw")
              .duration(2500)
              .ease(d3.easeLinear)
              .attr("stroke-dasharray", `${l},${l}`); 
        }
      }
      let dots = this.svg.selectAll(".g"+i);
      dots.select("circle")
        .transition()
          .duration(this.duration)
          .ease(d3.easeLinear)
          .attr("cx", d => this.x(d.x))
          .attr("cy", d => this.y(d.y))
      dots.select("g")
        .transition()
          .duration(this.duration)
          .ease(d3.easeLinear)
          .attr("transform", d => `translate(${this.x(d.x)},${this.y(d.y)})`)
    });
  }
  updateAxis() {
    this.svg
      .transition()
        .duration(this.duration)
        .ease(d3.easeLinear)
        .attr("viewBox", [0, 0, this.width, this.height]);
    this.scaleX();
    this.scaleY();
    this.updateTicksX();
    this.updateTicksY();
  }
  updateTicksX() {
    if (typeof this.svg !== "undefined") {
      let axisX = this.svg.select(".axis-x")
      axisX.transition("axis")
          .duration(this.duration)
          .ease(d3.easeLinear)
          .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
          .call(d3.axisBottom(this.x).ticks(...this.ticksX))
      axisX.call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line")
              .attr("stroke-opacity", 0.1)
              .transition("axis")
                .duration(this.duration)
                .ease(d3.easeLinear)
                .attr("y2", -this.height))
            .call(g => g.select(".labelx")
              .transition("axis")
                .duration(this.duration)
                .ease(d3.easeLinear)
                .attr("x", this.width - 4));
      [...this.shadow.querySelectorAll(".axis-x line+line")].map(e => e.remove());
    }
  }
  updateTicksY() {
    if (typeof this.svg !== "undefined") {
      let axisY = this.svg.select(".axis-y")
      axisY.transition("axis")
        .duration(this.duration)
        .ease(d3.easeLinear)
          .attr("transform", `translate(${this.margin.left},0)`)
          .call(d3.axisLeft(this.y).ticks(...this.ticksY))
      axisY.call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
          .attr("stroke-opacity", 0.1)
          .transition("axis")
            .duration(this.duration)
            .ease(d3.easeLinear)
            .attr("x2", this.width));
      [...this.shadow.querySelectorAll(".axis-y line+line")].map(e => e.remove());    
    }
  }
  scaleX() {
    this.x = d3.scaleLinear()
      .domain(d3.extent(this.data.extent, d => d.x)).nice()
      .range([this.margin.left, this.width - this.margin.right]);
  }
  scaleY() {
    this.y = d3.scaleLinear()
      .domain(d3.extent(this.data.extent, d => d.y)).nice()
      .range([this.height - this.margin.bottom, this.margin.top]);
  }
  axisX() {
    let xAxis = g => g
      .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
      .attr("class", "axis-x")
      .call(d3.axisBottom(this.x).ticks(...this.ticksX))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
        .attr("y2", -this.height)
        .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
        .attr("x", this.width - 4)
        .attr("y", -4)
        .attr("font-weight", "bold")
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .attr("class","labelx")
        .text(this.labelX))
    this.svg.append("g")
      .call(xAxis);
  }
  axisY() {
    let yAxis = g => g
      .attr("transform", `translate(${this.margin.left},0)`)
      .attr("class", "axis-y")
      .call(d3.axisLeft(this.y).ticks(...this.ticksY))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
        .attr("x2", this.width)
        .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
        .attr("x", -4)
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .attr("fill", "black")
        .attr("class","labely")
        .text(this.labelY).attr("dx", "1em").attr("dy", "1em"))
    this.svg.append("g")
      .call(yAxis);
  }
  updateColorScheme(value) {
    super.updateColorScheme(value);
    this.data.columns.map((g,i) => {
      let trace = this.svg.select(".trace"+i);
      trace
        .transition("colorScheme")
          .duration(this.duration)
          .ease(d3.easeLinear)
          .attr("stroke", this.colors(i))
      let dots = this.svg.selectAll(".g"+i);
      dots
        .transition("colorScheme")
          .duration(this.duration)
          .ease(d3.easeLinear)
          .attr("fill", this.colors(i))
      dots.select("text")
        .transition("colorScheme")
          .duration(this.duration)
          .ease(d3.easeLinear)
          .attr("fill", this.colors(i))
    });
  }
  updateData(oldColumns=0) {
    if (oldColumns > this.data.columns.length) {
      for (let i=0; i<oldColumns-this.data.columns.length; i++) {
        this.svg.selectAll(".dotgroup"+(this.data.columns.length+i)).remove();
        this.svg.selectAll(".trace"+(this.data.columns.length+i)).remove();
      }
    } else if (oldColumns < this.data.columns.length) {
      for (let j=0; j<(this.data.columns.length-oldColumns); j++) {
        let i = oldColumns+j;
        if (this.trace) {
          if (this.trace == "static") {
            try {
            this.svg.append("path")
              .datum(this.data.data[i])
              .attr("fill", "none")
              .attr("class", "trace"+i)
              .attr("stroke", this.colors(i))
              .attr("stroke-width", 1)
              .attr("stroke-linejoin", "round")
              .attr("stroke-linecap", "round")
              .attr("d", this.line)
            } catch {
              //svg no ready yet, do nothing
            }
          } else {
            const l = ((path) => {
              return d3.create("svg:path").attr("d", path).node().getTotalLength();
            })(this.line(this.data.data[i]));
            this.svg.append("path")
              .datum(this.data.data[i])
              .attr("fill", "none")
              .attr("class", "trace"+i)
              .attr("stroke", this.colors(i))
              .attr("stroke-width", 1)
              .attr("stroke-linejoin", "round")
              .attr("stroke-linecap", "round")
              .attr("stroke-dasharray", `0,${l}`)
              .attr("d", this.line)
            .transition("draw")
              .duration(2500)
              .ease(d3.easeLinear)
              .attr("stroke-dasharray", `${l},${l}`); 
          }
        }
        let dots = this.svg.append("g")
            .attr("fill", this.colors(i))
            .attr("stroke-width", 8)
            .attr("stroke", "red")
            .attr("class", "dotgroup"+i)
            .attr("stroke-opacity", 0)
          .selectAll("g")
          .data(this.data.data[i])
      }
    }
    this.data.columns.map((e,i) => {
      let container = this.svg.select(".dotgroup"+i);
      let dots = container.selectAll(".dot").data(this.data.data[i]);
      let path = this.svg.selectAll(".trace"+i).datum(this.data.data[i]);
      path.exit().remove();
      dots.exit().remove();
      let g = dots.enter().append("g")
        .attr("fill", this.colors(i))
        .attr("stroke-width", 8)
        .attr("stroke", "red")
        .attr("stroke-opacity", 0)
        .attr("class","dot g"+i)
      g.append("circle")
        .attr("cx", d => this.x(d.x))
        .attr("cy", d => this.y(d.y))
        .attr("r", 2);
      g.append("g")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .attr("transform", d => `translate(${this.x(d.x)},${this.y(d.y)})`)
        .append("text")
          .text(d => {
            if ((typeof d.name !== "undefined") && (this.labelsValue == "label")){
              return d.name
            } else {
              if ((this.labelsValue == "x") || (this.labelsValue == "y")) {
                return d3.format(".2f")(d[this.labelsValue])
              } else if (this.labelsValue == "xy") {
                return "x:"+d3.format(".2f")(d.x)+" | y:"+d3.format(".2f")(d.y)
              } else {
                return undefined;
              }
            }
          })
          .attr("text-anchor", this.labelPosition["text-anchor"])
          .attr("dy", this.labelPosition["dy"] || 0)
          .attr("dx", this.labelPosition["dx"] || 0)
          .attr("fill",this.colors(i))
    });
  }
  async updateJson() {
    let data = {};
    let oldColumns = this.data.columns.length;
    try {
      data = JSON.parse(this.json);
    } catch {
      data = await d3.json(this.json);
    }
    if (this.labelX == "") {
      this.labelX = data.labelX || "";
    }
    if (this.labelY == "") {
      this.labelY = data.labelY || "";
    }
    let columns = [];
    let extent = [];
    data = data.sets.map((element,j) => {
      columns.push("");
      return element.map(value => {
        extent.push({x: value.x,y: value.y });
        return { name: value.label, x: value.x, y: value.y }
      });
    });
    this.data = { data, extent , columns };
    this.isReady();
    this.updateData(oldColumns);
    this.updateAxis();
    this.updatePlot();
    this.updateLabelsValue();
  }
  async updateCsv() {
    let data = await d3.csv(this.csv);
    let oldColumns = this.data.columns.length;
    let columns = Object.values(data.columns);
    if (columns[0] == "label") {
      columns.shift();
    }
    //data is meant to be organized as follow: a facultative "label" column, then X, then Y values
    if (this.labelX == "") {
      this.labelX = columns[0];
    }
    if (this.labelY == "") {
      this.labelY = columns[1];
    }
    let output = []
    columns = columns.map((col,i,a) => {
      if (i%2 == 0) {
        output.push([]);
        return [col,a[i+1]];
      }
    }).filter(e => typeof e !== "undefined");
    let extent = [];
    data.map(element => {
      columns.map((group,i) => {
        let out = { name: element.label };
        out.x = parseFloat(element[group[0]].replace(",",".")) || undefined;
        out.y = parseFloat(element[group[1]].replace(",",".")) || undefined;
        extent.push({x: out.x,y: out.y });
        output[i].push(out);
      });
    });
    this.data = { data:output
        .map(e => e
          .filter(f => ((typeof f.x != "undefined")
            && (typeof f.y != "undefined"))))
        ,extent , columns };
    this.isReady();
    this.updateData(oldColumns);
    this.updateAxis();
    this.updatePlot();
    this.updateLabelsValue();
  }
  async graph() {
    await this.ready;
    this.scaleX(this.width);
    this.scaleY(this.height);
    this.svg = d3.create("svg")
        .attr("viewBox", [0, 0, this.width, this.height]);
    this.axisX();
    this.axisY();
    this.updateData();
    return this.svg.node();
  }
}
export { Scatterplot };
customElements.define("d3-scatterplot", Scatterplot);

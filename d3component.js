import "https://d3js.org/d3.v6.min.js";
class D3Component extends HTMLElement {
  static get commonRules() {
    return [
    {
      attribute: "caption",
      property: "captionText"
    },
    {
      attribute: "csv"
    },
    {
      attribute: "json"
    },
    {
      attribute: "color-scheme",
      property: "colorScheme",
      defaultValue: "schemeTableau10"
    }
    ]
  }
  static get observedAttributes() {
    return [...this.commonRules.map(e => e.attribute),
      ...this.classRules.map(e => e.attribute)];
  }
  constructor() {
    super();
    this.ready = new Promise((resolve,reject) => {
      this.isReady = resolve;
    });
    this.shadow = this.attachShadow({mode: "open"});
    this.d3 = d3;
    this.data = { columns: [], data: [], extent: []};
    let template = `
<template>
  <style></style>
  <figure style="width: 100%; margin: 0;">
    <figcaption style="text-align: center; font-size: 1.0rem; font-family: Sans;"></figcaption>
  </figure>
</template>
`
    template = (new DOMParser())
      .parseFromString(template,"text/html")
      .querySelector("template");
    template = template.content.cloneNode(true);
    this.shadow.appendChild(template);
    /*let style = document.createElement("style");
    style.innerHTML = ""
    console.log(style);
    this.shadow.append(style);*/
    this.colors = d3.scaleOrdinal(d3.schemeTableau10)
    /*this.container = document.createElement("figure");
    this.caption = document.createElement("figcaption");
    this.caption.setAttribute("style","text-align: center; font-weight: bold; font-size: 1.5em;");
    this.shadow.append(this.container);*/
    this.container = this.shadow.querySelector("figure");
    this.caption = this.shadow.querySelector("figcaption");
    this.rules = [...this.constructor.commonRules,...this.constructor.classRules];
    this.rules.map(e => this.observeAttribute(e));
  }
  updateCaptionText(value) {
    this.caption.innerText = value || this.csv.split(".")[0] || this.json.split(".")[0];
  }
  updateColorScheme() {
    try {
      this.colors = d3.scaleOrdinal(d3[this.colorScheme]);
    } catch {
      this.colors = d3.scaleOrdinal(d3.schemeTableau10);      
    }
  }
  observeAttribute(attr) {
    if (typeof attr == "string") {
      attr = this.rules.find(e => e.attribute == attr);
    }
    let prop = attr.property || attr.attribute;
    if (this.getAttribute(attr.attribute) === null) {
      this[prop] = attr.defaultValue;
    } else {
      if (attr.allowedValues) {
        if (attr.allowedValues.includes(this.getAttribute(attr.attribute))) {
          this[prop] = this.getAttribute(attr.attribute);
        } else if ((this.getAttribute(attr.attribute) == "") && (typeof attr.fallBack !== "undefined")) {
          this[prop] = attr.fallBack;
        } else {
          this[prop] = attr.defaultValue;
        }
      } else {
        this[prop] = this.getAttribute(attr.attribute);
      }
    }
    if (attr.func) {
      this[prop] = attr.func.call(this,this[prop]);
    }
  }
  attributeChangedCallback(name, oldValue, newValue) {
    this.observeAttribute(name);
    let prop = this.rules.find(e => e.attribute == name);
    prop = prop.property || prop.attribute;
    prop = prop[0].toUpperCase() + prop.slice(1);
    try {
      this["update"+prop](newValue);
    } catch(e) {
      this.makeGraph();
    }
  }
  async makeGraph() {
    let graph = await this.graph.call(this)
    try {
      [...this.shadow.querySelectorAll("figcaption")].map(e=>e.remove());
      [...this.shadow.querySelectorAll("svg")].map(e=>e.remove());
    } catch(e) {
      console.log("nothing to remove...",e);
    }
    this.container.prepend(graph);
    this.container.append(this.caption);
  }
  addStyleRule(rule) {
    let rules = this.shadow.querySelector("style").innerText.split("\n");
    let ruleExists = rules.find(e => (e == rule));
    if (typeof ruleExists === "undefined") {
      rules.push(rule);
      this.shadow.querySelector("style").innerText = rules.join("\n");
    }
  }
  removeStyleRule(rule) {
    this.shadow.querySelector("style").innerText = this.shadow
      .querySelector("style")
      .innerText.split("\n")
      .filter(e => e != rule)
      .join("\n");
  }
}
export { D3Component }

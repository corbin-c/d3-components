import { Scatterplot } from "./scatterplot.js";
class Curves extends Scatterplot {
  static get classRules() {
    return [...super.classRules,...[{
      attribute:"line",
      property: "trace",
      defaultValue: "static",
      allowedValues: ["animated","static"]
    }
    ]]
  }
  constructor() {
    super();
    this.addStyleRule(".dot circle { opacity: 0; }");
  }
}
export { Curves };
customElements.define("d3-curves", Curves);

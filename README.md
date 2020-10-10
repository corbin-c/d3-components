# D3-Components

D3.js is a very powerful library, yet sometimes a bit complex when you just want
to add a simple scatterplot to a web page.

This projects provides a set of Web Components in order to display data
visualizations on a web page. It encapsulates a few D3.js graphic components
into custom HTML elements. This way, one only has to provide a dataset in CSV or
JSON to obtain the desired graphics.

Additionnally, some parameters can be set using the elements attributes, just
like any HTML element. On attribute update, the component will update with
smooth transitions.

Obviously this has some limitations. You won't be able to create custom
visualization just like you could do with the whole D3.js library, or to control
all the aspects of the graphics. Moreover, you will have to follow the expected
structure for the data you provide.

## Scatterplot

Example use:

```html
<d3-scatterplot
  connected="animated"
  caption="Graph title"
  labels-value="y"
  json="data.json">
</d3-scatterplot>
```

### Attributes :

 * csv: path to csv file (mandatory), structured as a facultative "label"
 column, followed by X, then Y values. X & Y may be repeated for displaying
 various datasets.

 * height/width: specify the SVG viewport size

 * ticks-x/ticks-y: format of X/Y axis ticks, as `count,specifier`, where
 specifier follows d3-format: https://github.com/d3/d3-format
 
 * caption: caption of the graph. If not provided, caption will be the name of
 the CSV/JSON file
 
 * label-x/label-y: label of the axis. If not provided, labels will be the CSV
 column headers or the JSON `labelX`/`labelY` fields
 
 * labels-style: value "none" hides all labels, value "hover" shows then when
 hovering a dot. Otherwise, labels are always show.
 
 * labels-value: Specify whether you want to add a label showing the X or Y
 value of each dot (or both). Allowed values: `label`,`y`,`y`,`xy`. Use the
 `label` to show the JSON `label` field or CSV `label` column. 
 
 * label-position: may take one of the values: ["top","top-left","top-right","middle","middle-left","middle-right","bottom","bottom-left","bottom-right"],
 * connected: if present, all dots will be connected. If its value is "animated", the line drawing will be animated.  Value "none" won't connect dots.
 * color-scheme: chose a set of colors from https://github.com/d3/d3-scale-chromatic#schemeAccent (default is schemeTableau10)
 * line-type: https://github.com/d3/d3-shape#Curves
 * json: stringified json or path to JSON file structured as:

```
{
  "sets": [
    [
      {"x":1,"y":7},
      {"x":2,"y":15},
      {"x":3,"y":12},
      {"x":4,"y":31},
      {"x":5,"y":27}
    ],
    [
      {"x":3,"y":12,"label":1873},
      {"x":5,"y":21,"label":1917},
      {"x":7,"y":38,"label":1948},
      {"x":9,"y":43,"label":1985},
      {"x":11,"y":30,"label":2007}
    ]
  ],
  "labelX": "x",
  "labelY": "y"
}
```

## Curves

The `d3-curves` component is just like the `d3-scatterplot` one, except dots aren't shown.
So, the `connected` attribute has no effect. Instead, there's a `line` attribute,
which can take `animated` or `static` as value.

Example:

```html
<d3-curves
  line="static"
  caption="Graph title"
  labels-value="y"
  csv="source.csv">
</d3-curves>
```

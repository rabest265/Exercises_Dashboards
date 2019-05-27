var url = "/data";

function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel
  // Use `d3.json` to fetch the metadata for a sample
  d3.json("/metadata/" + sample).then(function(response) {
    console.log(response);
    // Use d3 to select the panel with id of `#sample-metadata`
    var samples = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
    // samples.html("");
    samples.selectAll("tr").remove();
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(response).forEach(([key, value]) => {
      var cell = samples.append("tr");
      cell.text(key + ": " + value);
    });
  });
}
    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
function buildGauge (sample){
  d3.json("/metadata/" + sample).then(function(response) {
    var level = response.WFREQ * 20;
    console.log(level);

    // Trig to calc meter point
    var degrees = 180 - level,
        radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var data = [{ type: 'scatter',
      x: [0], y:[0],
        marker: {size: 28, color:'850000'},
        showlegend: false,
        name: 'speed',
        text: level,
        hoverinfo: 'text+name'},
      { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:['rgba(14, 127, 0, .5)', 'rgba(50, 154, 10, .5)', 'rgba(110, 154, 22, .5)',
                            'rgba(170, 202, 42, .5)', 'rgba(185, 207, 55, .5)', 'rgba(202, 209, 95, .5)',
                            'rgba(210, 206, 145, .5)','rgba(222, 211, 175, .5)','rgba(232, 226, 202, .5)',
                            'rgba(255, 255, 255, 0)']},
      labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
  }];

  var layout = {
    shapes:[{
        type: 'path',
        path: path,
        fillcolor: '850000',
        line: {
          color: '850000'
        }
      }],
    title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
    // height: 1000,
    // width: 1000,
    xaxis: {zeroline:false, showticklabels:false,
              showgrid: false, range: [-1, 1]},
    yaxis: {zeroline:false, showticklabels:false,
              showgrid: false, range: [-1, 1]}
    };


  Plotly.newPlot('gauge', data, layout);
  });
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json("/samples/" + sample).then(function(response) {
    console.log(response);
    // @TODO: Build a Bubble Chart using the sample data

    var trace = {
      type: "scatter",
      mode: "markers",
      x: response.otu_ids,
      y: response.sample_values,
      text: response.otu_labels,
      marker: {
        color: response.otu_ids,
        size: response.sample_values
      }
    };
    var data = [trace];

    var layout = {
      title: "Bubble Chart",
      xaxis: {
        type: "OTU IDs"
      },
      yaxis: {
        autorange: true,
        type: "Sample Values"
      }
    };

    Plotly.newPlot("bubble", data, layout);
    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    console.log(response)

    // converting to a list so that sorting can be preformed
    var list = [];
    for (var j = 0; j < response.sample_values.length; j++) 
      list.push({'values': response.sample_values[j], 'ids': response.otu_ids[j], 'labels': response.otu_labels[j]});
    console.log(list);

    list.sort(function(a, b) {
      return ((a.values > b.values) ? -1 : ((a.values == b.values) ? 0 : 1));
    });
  
    for (var k = 0; k < list.length; k++) {
      response.sample_values[k] = list[k].values;
      response.otu_ids[k] = list[k].ids;
      response.otu_labels[k]=list[k].labels;
    }
    console.log (response.sample_values);
    console.log (response.otu_ids);

    var slicedValues = response.sample_values.slice(0,10);
    var slicedIds = response.otu_ids.slice(0,10);
    var slicedLables = response.otu_labels.slice(0,10);
 
    console.log(slicedValues);

    var trace2 = {
      type: "pie",
      labels: slicedIds,
      values: slicedValues,
      hovertext: slicedLables,
    };
    var data2 = [trace2];

    var layout2 = {
      title: "Top 10 Values - Pie Chart",
    };

    Plotly.newPlot("pie", data2, layout2);
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
    buildGauge(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
  buildGauge(newSample);
}

// Initialize the dashboard
init();

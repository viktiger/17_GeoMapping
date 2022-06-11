// Earthquakes & Tectonic Plates GeoJSON URL Variablesearthquakes
// All Month
// var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
// All Day
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
var tectonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
// ---------------------------------------------------------------------------------------------------- //

// ---------------------------------------------------------------------------------------------------- //
// // Perform a GET request to the query URL
// d3.json(earthquakeURL).then(function (data) {
//   console.log(data);
//   createFeatures(data.features);
// });

// // Perform a GET request to the query URL
// d3.json(tectonicURL).then(function (tectonicData) {
//   console.log(tectonicData);
//   createFaultlines(tectonicData.features);
// });

// Combining GET requests to both the query URLs
d3.json(earthquakeURL).then(function (data) {
  d3.json(tectonicURL).then(function (tectonicData) {
    console.log("NESTED")
    console.log(data)
    console.log(tectonicData)
    createFeatures(data.features, tectonicData.features);
  })
})
// ---------------------------------------------------------------------------------------------------- //

// ---------------------------------------------------------------------------------------------------- //
// // Create two LayerGroups: earthquakes & tectonicPlates
var earthquakes = new L.LayerGroup();
var tectonicPlates = new L.LayerGroup();

// The circles were too small so I had to multiply by a large number so that they could be more visible on the map
function circleRadius(magnitude) {
  return magnitude * 2;
}

// Function to Determine Style of Marker Based on the Magnitude of the Earthquake
function styleInfo(feature) {
  return {
    opacity: 1,
    fillOpacity: 1,
    fillColor: chooseColor(feature.properties.mag),
    color: "#000000",
    radius: markerSize(feature.properties.mag),
    stroke: true,
    weight: 0.5
  };
}

function circleColor(magnitude) {
  if (magnitude <= 1) {
    return "#FFFF00";
  }
  else if (magnitude <= 2) {
    return "#FFA500";
  }
  else if (magnitude <= 3) {
    return "#FF8C00";
  }
  else if (magnitude <= 4) {
    return "#FF4500";
  }
  else if (magnitude <= 5) {
    return "#FF0000";
  }
  else {
    return "#8B0000";
  };
}
// ---------------------------------------------------------------------------------------------------- //

// ---------------------------------------------------------------------------------------------------- //
function createFeatures(earthquakeData, tectonicData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      "<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "<p> Magnitude: " + feature.properties.mag + "</p>");
  }

  function pointToLayer(feature, latitudeLongitude) {
    // console.log(feature.properties.mag)
    // console.log(latitudeLongitude)
    return new L.circleMarker(latitudeLongitude, {
      radius: circleRadius(feature.properties.mag),
      fillColor: circleColor(feature.properties.mag),
      fillOpacity: 1,
      stroke: false
    })
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature & pointToLayer function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer
    });

  var tectonicPlates = L.geoJSON(tectonicData, {
    color: "yellow",
    weight: 1.5});

  // Using the earthquakes & tectonicPlates layer to the createMap function
  createMap(earthquakes, tectonicPlates);
}
// ---------------------------------------------------------------------------------------------------- //

// ---------------------------------------------------------------------------------------------------- //
function createMap(earthquakes, tectonicPlates) {

  // Define satellite, streetmap and darkmap layers
  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    maxZoom: 18,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satellite,
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "TectonicPlates": tectonicPlates,
    "Earthquakes": earthquakes
  };

  // Create our map, giving it the satellite, streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      36, 0
    ],
    zoom: 2,
    layers: [satellite, earthquakes, tectonicPlates]
  });

  // Create a layer control + Pass in our baseMaps and overlayMaps + Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, tectonicPlates).addTo(myMap);



  // Create legend
  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (myMap) {
    var div = L.DomUtil.create('div', 'info legend'),
      magnitudes = [0, 1, 2, 3, 4, 5],
      labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < magnitudes.length; i++) {
      div.innerHTML += '<i style="background:' +
        circleColor(magnitudes[i] + 1) + '"></i> ' + magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(myMap);
}
// ---------------------------------------------------------------------------------------------------- //
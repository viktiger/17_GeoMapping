// Earthquakes & Tectonic Plates GeoJSON URL Variables
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

// Combining GET requests to both the query URLs
d3.json(earthquakeURL).then(function(data){
    d3.json(tectonicURL).then(function(tectonicData){
    console.log("NESTED")
    console.log(data)
    createFeatures(data.features);
    console.log(tectonicData)
  })
})
// ---------------------------------------------------------------------------------------------------- //

// ---------------------------------------------------------------------------------------------------- //
// // Create two LayerGroups: earthquakes & tectonicPlates
var Earthquakes = new L.LayerGroup();
var TectonicPlates = new L.LayerGroup();

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
function createFeatures(earthquakeData) {

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

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}
// ---------------------------------------------------------------------------------------------------- //

// function createFeatures2(tectonicData) {
// var TectonicPlates = L.geoJSON(tectonicData)};
// createMap(TectonicPlates);

d3.json(tectonicURL, function(tectonicData) {
  // Create a GeoJSON Layer the plateData
  L.geoJson(tectonicData, {
      color: "#DC143C",
      weight: 2
  // Add plateData to tectonicPlates LayerGroups 
  }).addTo(TectonicPlates);
  // Add tectonicPlates Layer to the Map
  TectonicPlates.addTo(myMap);
});

// ---------------------------------------------------------------------------------------------------- //
function createMap(earthquakes) {

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
    "TectonicPlates": TectonicPlates,
    "Earthquakes": earthquakes
  };

  // Create our map, giving it the satellite, streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      36, 0
    ],
    zoom: 2,
    // layers: [satellite, earthquakes, tectonicplates]
    layers: [satellite, earthquakes, TectonicPlates]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


  // L.circle([50.5, 30.5], {
  //   fillColor: "#FF4500",
  //   radius:300
  // }).addTo(myMap);

  // // Set Up Legend
  // var legend = L.control({ position: "bottomright" });
  // legend.onAdd = function() {
  //     var div = L.DomUtil.create("div", "info legend"), 
  //     magnitudeLevels = [0, 1, 2, 3, 4, 5];

  //     div.innerHTML += "<h3>Magnitude</h3>"

  //     for (var i = 0; i < magnitudeLevels.length; i++) {
  //         div.innerHTML +=
  //             '<i style="background: ' + chooseColor(magnitudeLevels[i] + 1) + '"></i> ' +
  //             magnitudeLevels[i] + (magnitudeLevels[i + 1] ? '&ndash;' + magnitudeLevels[i + 1] + '<br>' : '+');
  //     }
  //     return div;
  // };
  // // Add Legend to the Map
  // legend.addTo(myMap);

}
// ---------------------------------------------------------------------------------------------------- //
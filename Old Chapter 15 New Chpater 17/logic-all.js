// Create our initial map object.
// Set the longitude, latitude, and starting zoom level/
var myMap = L.map("map").setView([39.8283, -98.5795], 5);

// Add a tile layer (the background map image) to our map.
// Use the addTo() method to add objects to our map.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);


// Create a red circle over Melbourne.
L.circle([-37.8136, 144.9631], {
    color: "red",
    fillColor: "red",
    fillOpacity: 0.75,
    radius: 10000
  }).addTo(myMap);

// Connect a black line from NYC to Melboure.
var line = [
    [-37.8136, 144.9631],
    [19.8968, 155.5828],
    [40.7128, -74.0060]

  ];
  L.polyline(line, {
    color: "black"
  }).addTo(myMap);

// Create a purple polygon that covers the area in Atlanta, Savannah, Jacksonville, and Montgomery.
L.polygon([
    [33.7490, -84.3880],
    [32.0809, -81.0912],
    // [30.3322, -81.6557],
    [32.3792, -86.3077]
  ], {
    color: "purple",
    fillColor: "purple",
    fillOpacity: 0.75
  }).addTo(myMap);
  
  // City markers
var cities = [{
    location: [40.7128, -74.0059],
    name: "New York",
    population: 8550405
  },
  {
    location: [-37.8136, 144.9631],
    name: "Melbourne",
    population: 5078000
  }]

  // Looping through the cities array, create one marker for each city, bind a popup containing its name and population, and add it to the map.
for (var i = 0; i < cities.length; i++) {
    var city = cities[i];
    L.marker(city.location)
      .bindPopup(`<h1>${city.name}</h1> <hr> <h3>Population ${city.population.toLocaleString()}</h3>`)
      .addTo(myMap);
  }
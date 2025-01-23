// Omnisharp LLC 2025 Web Mapping Tool
// Mapbox API key for routing
// Aviationstack API key for airport data 62b03a79042579fe5f64a5e45684a9cc
// Weather API: openweather.com 08f999cb201437c57f5a0116102eebee
// Created by Carston Buehler

const map = L.map('map').setView([37.8, -96], 4.5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Define custom icons
const plantIcon = L.icon({
  iconUrl: 'Images/cow.png', // Image for beef plants
  iconSize: [25, 32], // Adjust these values to change the size
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const turkeyIcon = L.icon({
  iconUrl: 'Images/turkey.png', // Image for turkey plants
  iconSize: [25, 29], // Adjust these values to change the size
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hqIcon = L.icon({
  iconUrl: 'Images/HQ.png', // Image for HQ
  iconSize: [25, 25],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const pigIcon = L.icon({
  iconUrl: 'Images/pig.png', // Ensure this path is correct
  iconSize: [25, 34], // Adjust these values to change the size
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const airportIcon = L.icon({
  iconUrl: 'Images/airplane.png', // Ensure this path is correct
  iconSize: [25, 25], // Adjust these values to change the size
  iconAnchor: [12, 12],
  popupAnchor: [1, -12],
  shadowSize: [25, 25]
});

// https://www.latlong.net/convert-address-to-lat-long.html
const sites = [
  // Plants - USA - Alphabetical
  { name: 'Amarillo', coords: [35.4127458, -101.654053], type: 'plant', region: 'USA', icon: 'cow' },
  { name: 'Dakota City', coords: [42.478832, -96.413133], type: 'plant', region: 'USA', icon: 'cow' },
  { name: 'Finney County', coords: [37.9983271, -101.0285989], type: 'plant', region: 'USA', icon: 'cow' },
  { name: 'Green Bay', coords: [44.5282995, -88.0901618], type: 'plant', region: 'USA', icon: 'cow' },
  { name: 'Joslin', coords: [41.555850, -90.225245], type: 'plant', region: 'USA', icon: 'cow' },
  { name: 'Lexington', coords: [40.761108, -99.735229], type: 'plant', region: 'USA', icon: 'cow' },
  { name: 'Omaha', coords: [41.2093464, -95.9701349], type: 'plant', region: 'USA', icon: 'cow' },
  { name: 'Pasco', coords: [46.1375306, -118.9156132], type: 'plant', region: 'USA', icon: 'cow' },
  { name: 'Plainwell', coords: [42.4211736, -85.6497604], type: 'plant', region: 'USA', icon: 'cow' },
  { name: 'Smithfield', coords: [34.7545191, -78.8070153], type: 'plant', region: 'USA', icon: 'pig' }, // AKA Tar Heel
  { name: 'Souderton', coords: [40.2712296, -75.3361326], type: 'plant', region: 'USA', icon: 'cow' },
  { name: 'Storm Lake', coords: [42.6392091, -95.1846581], type: 'plant', region: 'USA', icon: 'turkey' },
  { name: 'Tolleson', coords: [33.4411955, -112.2553217], type: 'plant', region: 'USA', icon: 'cow' },

  // HQ and Remote Locations
  { name: 'Omnisharp', coords: [30.4604802, -97.6551371], type: 'hq', icon: 'hq' },

  // Sharpening Centers
  { name: 'CES', coords: [53.4722462, -2.3793467], type: 'SaaS', icon: 'hq' }, 
  { name: 'Springdale', coords: [36.1907351, -94.4742007], type: 'SaaS', icon: 'hq' },

  // International - Mexico
  { name: 'Keken ', coords: [20.9861173, -89.7936814], type: 'plant', region: 'Mexico', icon: 'pig' },
  { name: 'Proan', coords: [20.6740117, -103.4179727], type: 'plant', region: 'Mexico', icon: 'pig' },
  { name: 'SuKarne', coords: [25.3220694, -104.908717], type: 'plant', region: 'Mexico', icon: 'cow' },
];

// Function to calculate distance between two coordinates in miles
function calculateDistance(coords1, coords2) {
  const R = 3958.8; // Radius of the Earth in miles
  const lat1 = coords1[0] * (Math.PI / 180);
  const lon1 = coords1[1] * (Math.PI / 180);
  const lat2 = coords2[0] * (Math.PI / 180);
  const lon2 = coords2[1] * (Math.PI / 180);
  const dlat = lat2 - lat1;
  const dlon = lon2 - lon1;
  const a = Math.sin(dlat / 2) * Math.sin(dlat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dlon / 2) * Math.sin(dlon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Function to fetch weather data
//openweather.com
async function fetchWeather(coords) {
  const apiKey = '08f999cb201437c57f5a0116102eebee'; // Replace with your weather API key
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords[0]}&lon=${coords[1]}&units=imperial&appid=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Weather data:', data); // Debug log
    return {
      low: Math.round(data.main.temp_min),
      high: Math.round(data.main.temp_max)
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return {
      low: 'N/A',
      high: 'N/A'
    };
  }
}

async function fetchClosestAirports(coords) {
  const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node(around:15000,${coords[0]},${coords[1]})[aeroway=airport];out;`;

  try {
    const response = await fetch(overpassUrl);
    const data = await response.json();
    const airports = data.elements.map(airport => ({
      name: airport.tags.name,
      code: airport.tags.iata || 'N/A',
      distance: calculateDistance(coords, [airport.lat, airport.lon]),
      latitude: airport.lat,
      longitude: airport.lon
    }));
    return airports.sort((a, b) => a.distance - b.distance).slice(0, 3);
  } catch (error) {
    console.error('Error fetching airport data:', error);
    return [];
  }
}

function getWeatherBoxColor(temp) {
  if (temp <= 32) {
    return '#ADD8E6'; // Light Blue
  } else if (temp <= 49) {
    return '#87CEEB'; // Sky Blue
  } else if (temp <= 68) {
    return '#FFFFE0'; // Light Yellow
  } else if (temp <= 86) {
    return '#FFD700'; // Gold
  } else {
    return '#FFA500'; // Orange
  }
}

function createWeatherBox(weather) {
  const lowColor = getWeatherBoxColor(weather.low);
  const highColor = getWeatherBoxColor(weather.high);
  return L.divIcon({
    className: 'weather-box',
    html: `<div style="background-color: ${lowColor}; color: black;">Low: ${weather.low}°F</div><div style="background-color: ${highColor}; color: black;">High: ${weather.high}°F</div>`,
    iconSize: [80, 40],
    iconAnchor: [40, 0]
  });
}

function createAirportBox(airports, site) {
  return L.divIcon({
    className: 'airport-box',
    html: `<div style="background: white; border: 1px solid black; padding: 5px; height: 200px; overflow-y: auto;">
             <button onclick="closeAirportBox('${site.name}')">Close</button>
             Closest Airports:<br>
             ${airports.length > 0 ? airports.map(airport => `<input type="checkbox" class="airport-checkbox" data-site="${site.name}" data-code="${airport.code}">${formatAirportName(airport.name)} (${airport.code}) - ${Math.round(airport.distance)} miles`).join('<br>') : 'No airports found'}
           </div>`,
    iconSize: [200, 200],
    iconAnchor: [100, 0]
  });
}

function closeAirportBox(siteName) {
  const markersToRemove = travelMarkers.filter(marker => marker.options.icon.options.html.includes(`data-site="${siteName}"`));
  markersToRemove.forEach(marker => map.removeLayer(marker));
  travelMarkers = travelMarkers.filter(marker => !markersToRemove.includes(marker));

  const airportMarkersToRemove = airportMarkers.filter(marker => marker.options.siteName === siteName);
  airportMarkersToRemove.forEach(marker => map.removeLayer(marker));
  airportMarkers = airportMarkers.filter(marker => !airportMarkersToRemove.includes(marker));
}

function executeTicketSearch() {
  const selectedAirports = Array.from(document.querySelectorAll('.airport-checkbox:checked')).map(checkbox => checkbox.dataset.code);
  if (selectedAirports.length < 2) {
    alert('Please select at least one airport from each site.');
    return;
  }

  const fromAirports = selectedAirports.filter(code => document.querySelector(`.airport-checkbox[data-code="${code}"]`).dataset.site === fromSite.name);
  const toAirports = selectedAirports.filter(code => document.querySelector(`.airport-checkbox[data-code="${code}"]`).dataset.site === toSite.name);

  if (fromAirports.length === 0 || toAirports.length === 0) {
    alert('Please select at least one airport from each site.');
    return;
  }

  // Fetch and display ticket prices (mock implementation)
  alert(`Searching for tickets from ${fromAirports.join(', ')} to ${toAirports.join(', ')}`);
}

// Add markers and calculate distances
let beefCount = 0;
let porkCount = 0;
let poultryCount = 0;

const airports = [
  { name: 'Hartsfield-Jackson Atlanta Intl', code: 'ATL', coords: [33.6407, -84.4277] },
  { name: 'Los Angeles Intl', code: 'LAX', coords: [33.9416, -118.4085] },
  { name: 'O\'Hare Intl', code: 'ORD', coords: [41.9742, -87.9073] },
  { name: 'Garden City Regional', code: 'GCK', coords: [37.9275, -100.7239] },
  { name: 'Austin-Bergstrom Intl', code: 'AUS', coords: [30.1944, -97.67] },
  { name: 'Georgetown Municipal', code: 'GTU', coords: [30.6788, -97.6794] },
  { name: 'Phoenix Sky Harbor Intl', code: 'PHX', coords: [33.4342, -112.0116] },
  { name: 'Phoenix-Mesa Gateway', code: 'AZA', coords: [33.3078, -111.6555] },
  { name: 'Tucson Intl', code: 'TUS', coords: [32.1161, -110.9410] },
  { name: 'Denver Intl', code: 'DEN', coords: [39.8561, -104.6737] },
  { name: 'Dallas/Fort Worth Intl', code: 'DFW', coords: [32.8998, -97.0403] },
  { name: 'San Francisco Intl', code: 'SFO', coords: [37.6213, -122.3790] },
  { name: 'Seattle-Tacoma Intl', code: 'SEA', coords: [47.4502, -122.3088] },
  { name: 'Miami Intl', code: 'MIA', coords: [25.7959, -80.2870] },
  { name: 'Orlando Intl', code: 'MCO', coords: [28.4312, -81.3081] },
  { name: 'Las Vegas McCarran Intl', code: 'LAS', coords: [36.0840, -115.1537] },
  { name: 'Charlotte Douglas Intl', code: 'CLT', coords: [35.2140, -80.9431] },
  { name: 'Salt Lake City Intl', code: 'SLC', coords: [40.7899, -111.9791] },
  { name: 'Portland Intl', code: 'PDX', coords: [45.5898, -122.5951] },
  { name: 'San Diego Intl', code: 'SAN', coords: [32.7338, -117.1933] },
  // Add more airports as needed
];

let showTravel = false;
let travelMarkers = [];
let fromSite = null;
let toSite = null;
let airportMarkers = [];

function findClosestAirports(coords) {
  return airports.map(airport => ({
    ...airport,
    distance: calculateDistance(coords, airport.coords)
  }))
  .filter(airport => airport.distance <= 150) // Filter airports within 150 miles
  .sort((a, b) => a.distance - b.distance)
  .slice(0, 3);
}

function formatAirportName(name) {
  return name.replace('International', 'Intl').replace('Regional', 'Reg').replace('Municipal', 'Munic');
}

function toggleTravel() {
  showTravel = !showTravel;

  const button = document.querySelector('.toggle-travel-button button');
  button.style.backgroundColor = showTravel ? 'green' : '';
  button.innerHTML = showTravel ? 'Hide Travel Information' : 'Show Travel Information';

  if (showTravel) {
    sites.forEach(async site => {
      const closestAirports = await fetchClosestAirports(site.coords);
      const airportBox = createAirportBox(closestAirports, site);
      const airportMarker = L.marker([site.coords[0] - 0.02, site.coords[1]], { icon: airportBox }).addTo(map);
      travelMarkers.push(airportMarker);

      closestAirports.forEach(airport => {
        const marker = L.marker([airport.latitude, airport.longitude], { icon: airportIcon, siteName: site.name }).addTo(map);
        airportMarkers.push(marker);
      });
    });

    // Add execute button
    const executeButton = L.control({ position: 'topright' });
    executeButton.onAdd = function () {
      const div = L.DomUtil.create('div', 'execute-button');
      div.innerHTML = '<button onclick="executeTicketSearch()">Execute Ticket Search</button>';
      return div;
    };
    executeButton.addTo(map);
  } else {
    travelMarkers.forEach(marker => map.removeLayer(marker));
    travelMarkers = [];
    airportMarkers.forEach(marker => map.removeLayer(marker));
    airportMarkers = [];
    fromSite = null;
    toSite = null;

    // Remove execute button
    const executeButton = document.querySelector('.execute-button');
    if (executeButton) {
      executeButton.remove();
    }
  }
}

async function fetchFlightInfo(fromAirport, toAirport) {
  // Replace with actual API call to fetch flight and price information
  return {
    flights: [
      { airline: 'Airline A', price: '$200', duration: '3h 30m' },
      { airline: 'Airline B', price: '$250', duration: '3h 45m' }
    ]
  };
}

sites.forEach(site => {
  let icon;
  switch (site.icon) {
    case 'turkey':
      icon = turkeyIcon;
      poultryCount++;
      break;
    case 'cow':
      icon = plantIcon;
      beefCount++;
      break;
    case 'pig':
      icon = pigIcon;
      porkCount++;
      break;
    case 'hq':
      icon = hqIcon;
      break;
    default:
      icon = plantIcon; // Default to plant icon if none specified
  }

  const marker = L.marker(site.coords, { icon: icon }).addTo(map)
    .bindPopup(`${site.name}`);

  const closestAirports = findClosestAirports(site.coords);

  marker.on('click', async function() {
    if (showTravel) {
      const closestAirports = await fetchClosestAirports(site.coords);
      const airportBox = createAirportBox(closestAirports, site);
      const airportMarker = L.marker([site.coords[0] - 0.02, site.coords[1]], { icon: airportBox }).addTo(map);
      travelMarkers.push(airportMarker);

      closestAirports.forEach(airport => {
        const marker = L.marker([airport.latitude, airport.longitude], { icon: airportIcon, siteName: site.name }).addTo(map);
        airportMarkers.push(marker);
      });

      if (!fromSite) {
        fromSite = site;
        marker.bindPopup(`${site.name}<br>From Site Selected`).openPopup();
      } else if (!toSite) {
        toSite = site;
        marker.bindPopup(`${site.name}<br>To Site Selected`).openPopup();

        const fromAirports = await fetchClosestAirports(fromSite.coords);
        const toAirports = await fetchClosestAirports(toSite.coords);

        const flightInfo = await fetchFlightInfo(fromAirports[0], toAirports[0]);

        const travelInfo = L.divIcon({
          className: 'travel-info',
          html: `<div>Flights from ${fromAirports[0].name} to ${toAirports[0].name}:<br>${flightInfo.flights.map(flight => `${flight.airline}: ${flight.price}, ${flight.duration}`).join('<br>')}</div>`,
          iconSize: [200, 100],
          iconAnchor: [100, 0]
        });

        L.marker([(fromSite.coords[0] + toSite.coords[0]) / 2, (fromSite.coords[1] + toSite.coords[1]) / 2], { icon: travelInfo }).addTo(map);
      }
    } else {
      marker.bindPopup(`${site.name}`).openPopup();
    }
  });
});

// Update legend counts
document.getElementById('beef-count').textContent = beefCount;
document.getElementById('pork-count').textContent = porkCount;
document.getElementById('poultry-count').textContent = poultryCount;

// Function to connect plants with lines ensuring each plant has at least one connection
function connectPlants(region, lineColor) {
  const plants = sites.filter(site => site.type === 'plant' && site.region === region);
  const connectedPlants = new Set();
  const lines = [];

  plants.forEach((site) => {
    let closestSites = [];
    let closestDistances = [];

    plants.forEach((otherSite) => {
      if (site !== otherSite) {
        const distance = calculateDistance(site.coords, otherSite.coords);
        closestSites.push(otherSite);
        closestDistances.push(distance);
      }
    });

    // Sort by distance and select the closest sites
    const sortedIndices = closestDistances.map((distance, index) => [distance, index])
                                          .sort(([a], [b]) => a - b)
                                          .map(([, index]) => index);

    // Ensure at least one connection
    if (sortedIndices.length > 0) {
      const closestSite = closestSites[sortedIndices[0]];
      connectedPlants.add(site);
      connectedPlants.add(closestSite);

      const line = L.polyline([site.coords, closestSite.coords], { color: lineColor, weight: 2, opacity: 0 }).addTo(map);
      const midPoint = [
        (site.coords[0] + closestSite.coords[0]) / 2,
        (site.coords[1] + closestSite.coords[1]) / 2
      ];
      const distanceLabel = L.marker(midPoint, {
        icon: L.divIcon({
          className: 'distance-label',
          html: `${Math.round(closestDistances[sortedIndices[0]])}`
        })
      }).addTo(map);
      distanceLabel.setOpacity(0); // Initially invisible
      lines.push({ line, distanceLabel, site1: site, site2: closestSite });
    }

    // Add additional connections if necessary
    for (let i = 1; i < Math.min(3, sortedIndices.length); i++) {
      const additionalSite = closestSites[sortedIndices[i]];
      connectedPlants.add(additionalSite);

      const line = L.polyline([site.coords, additionalSite.coords], { color: lineColor, weight: 2, opacity: 0 }).addTo(map);
      const midPoint = [
        (site.coords[0] + additionalSite.coords[0]) / 2,
        (site.coords[1] + additionalSite.coords[1]) / 2
      ];
      const distanceLabel = L.marker(midPoint, {
        icon: L.divIcon({
          className: 'distance-label',
          html: `${Math.round(closestDistances[sortedIndices[i]])}`
        })
      }).addTo(map);
      distanceLabel.setOpacity(0); // Initially invisible
      lines.push({ line, distanceLabel, site1: site, site2: additionalSite });
    }
  });

  return lines;
}

// Connect USA plants
const usaLines = connectPlants('USA', 'blue');

// Connect Mexico plants with red lines and distance labels
const mexicoLines = connectPlants('Mexico', 'red');

// Add specific distances
const specificConnections = [
  { from: 'Storm Lake', to: 'Joslin' },
  { from: 'Plainwell', to: 'Souderton' },
  { from: 'Finney County', to: 'Lexington' }
];

specificConnections.forEach(connection => {
  const fromSite = sites.find(site => site.name === connection.from);
  const toSite = sites.find(site => site.name === connection.to);

  if (fromSite && toSite) {
    const distance = calculateDistance(fromSite.coords, toSite.coords);
    const line = L.polyline([fromSite.coords, toSite.coords], { color: 'lightblue', weight: 2, opacity: 0 }).addTo(map);
    const midPoint = [
      (fromSite.coords[0] + toSite.coords[0]) / 2,
      (fromSite.coords[1] + toSite.coords[1]) / 2
    ];
    const distanceLabel = L.marker(midPoint, {
      icon: L.divIcon({
        className: 'distance-label',
        html: `${Math.round(distance)}`
      })
    }).addTo(map);
    distanceLabel.setOpacity(0); // Initially invisible
    usaLines.push({ line, distanceLabel, site1: fromSite, site2: toSite });
  }
});

// Function to show/hide lines and distance labels connected to a site
function toggleLinesAndLabels(site, lines, show) {
  lines.forEach(({ line, distanceLabel, site1, site2 }) => {
    if (site === site1 || site === site2) {
      line.setStyle({ opacity: show ? 0.5 : 0 });
      distanceLabel.setOpacity(show ? 1 : 0);
    }
  });
}

let connectMexicoToUSAToggle = false;
let mexicoToUSALines = [];
let mexicoToUSADistanceLabels = [];

function toggleConnectMexicoToUSA() {
  connectMexicoToUSAToggle = !connectMexicoToUSAToggle;

  const button = document.querySelector('.toggle-button button');
  if (connectMexicoToUSAToggle) {
    button.style.backgroundColor = 'green';
    button.innerHTML = 'Disconnect Mexico to USA Connections';

    // Connect Mexico to the closest USA plant
    sites.filter(site => site.region === 'Mexico').forEach((mexicoPlant) => {
      let closestUSASite = null;
      let closestDistance = Infinity;

      sites.filter(site => site.region === 'USA').forEach((usaPlant) => {
        const distance = calculateDistance(mexicoPlant.coords, usaPlant.coords);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestUSASite = usaPlant;
        }
      });

      if (closestUSASite) {
        const line = L.polyline([mexicoPlant.coords, closestUSASite.coords], { color: 'green', weight: 2, opacity: 0.5 }).addTo(map); // Different color line
        mexicoToUSALines.push({ line, site1: mexicoPlant, site2: closestUSASite });
        const midPoint = [
          (mexicoPlant.coords[0] + closestUSASite.coords[0]) / 2,
          (mexicoPlant.coords[1] + closestUSASite.coords[1]) / 2
        ];
        const distanceLabel = L.marker(midPoint, {
          icon: L.divIcon({
            className: 'distance-label',
            html: `${Math.round(closestDistance)}`
          })
        }).addTo(map);
        distanceLabel.setOpacity(1); // Make the label visible
        mexicoToUSADistanceLabels.push(distanceLabel);
      }
    });
  } else {
    button.style.backgroundColor = '';
    button.innerHTML = 'Connect Mexico to USA Connections';

    // Remove Mexico to USA connections
    mexicoToUSALines.forEach(({ line }) => map.removeLayer(line));
    mexicoToUSADistanceLabels.forEach(label => map.removeLayer(label));
    mexicoToUSALines = [];
    mexicoToUSADistanceLabels = [];
  }
}

let includeHQ = false;

function toggleIncludeHQ() {
  includeHQ = !includeHQ;

  const button = document.querySelector('.toggle-hq-button button');
  button.style.backgroundColor = includeHQ ? 'green' : '';
  button.innerHTML = includeHQ ? 'Exclude HQ from Distances' : 'Include HQ in Distances';

  // Update the lines and labels based on the current state
  if (showRoadDistances) {
    roadDistanceLines.forEach(({ line }) => map.removeLayer(line));
    roadDistanceLabels.forEach(label => map.removeLayer(label));
    roadDistanceLines = [];
    roadDistanceLabels = [];
  } else {
    usaLines.forEach(({ line, distanceLabel }) => {
      line.setStyle({ opacity: 0 });
      distanceLabel.setOpacity(0);
    });
    mexicoLines.forEach(({ line, distanceLabel }) => {
      line.setStyle({ opacity: 0 });
      distanceLabel.setOpacity(0);
    });
  }
}

// Initialize the routing control
let routingControl;
let shareButton; // Define shareButton variable

function getGoogleMapsLink(startCoords, endCoords) {
  return `https://www.google.com/maps/dir/?api=1&origin=${startCoords[0]},${startCoords[1]}&destination=${endCoords[0]},${endCoords[1]}&travelmode=driving`;
}

function getDirections(startCoords, endCoords) {
  if (routingControl) {
    map.removeControl(routingControl);
  }

  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(startCoords[0], startCoords[1]),
      L.latLng(endCoords[0], endCoords[1])
    ],
    routeWhileDragging: true,
    formatter: new L.Routing.Formatter({
      units: 'imperial' // Use 'imperial' for miles
    })
  }).addTo(map);

  const googleMapsLink = getGoogleMapsLink(startCoords, endCoords);
  shareButton = L.control({ position: 'bottomright' });
  shareButton.onAdd = function () {
    const div = L.DomUtil.create('div', 'share-button');
    div.innerHTML = `<button onclick="window.open('${googleMapsLink}', '_blank')">Open in Google Maps</button>`;
    return div;
  };
  shareButton.addTo(map);
}

let userLocationMarker; // Ensure this variable is defined
let userCoords; // Store user coordinates

// Locate functionality
document.getElementById('locate').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      userCoords = [position.coords.latitude, position.coords.longitude];
      map.setView(userCoords, 10);

      if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
      }

      userLocationMarker = L.marker(userCoords).addTo(map)
        .bindPopup('You are here')
        .openPopup();
    }, () => {
      alert('Unable to retrieve your location');
    });
  } else {
    alert('Geolocation is not supported by your browser');
  }
});

// Reset Map functionality
document.getElementById('reset-map').addEventListener('click', () => {
  map.setView([37.8, -96], 4.5);

  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }

  if (userLocationMarker) {
    map.removeLayer(userLocationMarker);
    userLocationMarker = null;
  }

  if (shareButton) {
    map.removeControl(shareButton);
    shareButton = null;
  }
});

// Add hover event listeners to markers
sites.forEach(site => {
  let icon;
  switch (site.icon) {
    case 'turkey':
      icon = turkeyIcon;
      break;
    case 'cow':
      icon = plantIcon;
      break;
    case 'pig':
      icon = pigIcon;
      break;
    case 'hq':
      icon = hqIcon;
      break;
    default:
      icon = plantIcon; // Default to plant icon if none specified
  }
  const marker = L.marker(site.coords, { icon: icon }).addTo(map)
    .bindPopup(site.name);

  marker.on('mouseover', function() {
    if (showRoadDistances) {
      showRoadDistancesForSite(site);
    } else {
      toggleLinesAndLabels(site, usaLines, true);
      toggleLinesAndLabels(site, mexicoLines, true);
      toggleLinesAndLabels(site, mexicoToUSALines, true); // Ensure Mexico to USA lines are shown
      toggleLinesAndLabels(site, mexicoToUSADistanceLabels, true); // Ensure Mexico to USA distance labels are shown

      if (includeHQ) {
        const hqSite = sites.find(site => site.type === 'hq');
        const distance = calculateDistance(site.coords, hqSite.coords);
        const line = L.polyline([site.coords, hqSite.coords], { color: 'blue', weight: 2, opacity: 0.5 }).addTo(map);
        const midPoint = [
          (site.coords[0] + hqSite.coords[0]) / 2,
          (site.coords[1] + hqSite.coords[1]) / 2
        ];
        const distanceLabel = L.marker(midPoint, {
          icon: L.divIcon({
            className: 'distance-label',
            html: `${Math.round(distance)}`
          })
        }).addTo(map);
        usaLines.push({ line, distanceLabel, site1: site, site2: hqSite });
      }
    }
  });

  marker.on('mouseout', function() {
    if (showRoadDistances) {
      roadDistanceLines.forEach(({ line }) => map.removeLayer(line));
      roadDistanceLabels.forEach(label => map.removeLayer(label));
      roadDistanceLines = [];
      roadDistanceLabels = [];
    } else {
      toggleLinesAndLabels(site, usaLines, false);
      toggleLinesAndLabels(site, mexicoLines, false);
      toggleLinesAndLabels(site, mexicoToUSALines, false); // Ensure Mexico to USA lines are hidden
      toggleLinesAndLabels(site, mexicoToUSADistanceLabels, false); // Ensure Mexico to USA distance labels are hidden
    }
  });

  marker.on('click', async function() {
    if (showTravel) {
      const closestAirports = await fetchClosestAirports(site.coords);
      const airportBox = createAirportBox(closestAirports, site);
      const airportMarker = L.marker([site.coords[0] - 0.02, site.coords[1]], { icon: airportBox }).addTo(map);
      travelMarkers.push(airportMarker);

      closestAirports.forEach(airport => {
        const marker = L.marker([airport.latitude, airport.longitude], { icon: airportIcon, siteName: site.name }).addTo(map);
        airportMarkers.push(marker);
      });

      if (!fromSite) {
        fromSite = site;
        marker.bindPopup(`${site.name}<br>From Site Selected`).openPopup();
      } else if (!toSite) {
        toSite = site;
        marker.bindPopup(`${site.name}<br>To Site Selected`).openPopup();

        const fromAirports = await fetchClosestAirports(fromSite.coords);
        const toAirports = await fetchClosestAirports(toSite.coords);

        const flightInfo = await fetchFlightInfo(fromAirports[0], toAirports[0]);

        const travelInfo = L.divIcon({
          className: 'travel-info',
          html: `<div>Flights from ${fromAirports[0].name} to ${toAirports[0].name}:<br>${flightInfo.flights.map(flight => `${flight.airline}: ${flight.price}, ${flight.duration}`).join('<br>')}</div>`,
          iconSize: [200, 100],
          iconAnchor: [100, 0]
        });

        L.marker([(fromSite.coords[0] + toSite.coords[0]) / 2, (fromSite.coords[1] + toSite.coords[1]) / 2], { icon: travelInfo }).addTo(map);
      }
    } else {
      marker.bindPopup(`${site.name}`).openPopup();
    }

    if (userCoords) {
      getDirections(userCoords, site.coords);
    }
  });
});

// Add click event listener to the map for getting directions to any location
map.on('click', function(e) {
  if (userCoords) {
    getDirections(userCoords, [e.latlng.lat, e.latlng.lng]);
  }
});

// Add a button to toggle Mexico to USA connections
const toggleButton = L.control({ position: 'topright' });
toggleButton.onAdd = function () {
  const div = L.DomUtil.create('div', 'toggle-button');
  div.innerHTML = '<button onclick="toggleConnectMexicoToUSA()">Connect Mexico to USA Connections</button>';
  return div;
};
toggleButton.addTo(map);

// Add a button to toggle road distances
const toggleRoadButton = L.control({ position: 'topright' });
toggleRoadButton.onAdd = function () {
  const div = L.DomUtil.create('div', 'toggle-road-button');
  div.innerHTML = '<button onclick="toggleRoadDistances()">Show Road Distances</button>';
  return div;
};
toggleRoadButton.addTo(map);

// Add a button to toggle HQ inclusion
const toggleHQButton = L.control({ position: 'topright' });
toggleHQButton.onAdd = function () {
  const div = L.DomUtil.create('div', 'toggle-hq-button');
  div.innerHTML = '<button onclick="toggleIncludeHQ()">Include HQ in Distances</button>';
  return div;
};
toggleHQButton.addTo(map);

// Add a button to toggle travel information
const toggleTravelButton = L.control({ position: 'topright' });
toggleTravelButton.onAdd = function () {
  const div = L.DomUtil.create('div', 'toggle-travel-button');
  div.innerHTML = '<button onclick="toggleTravel()">Show Travel Information</button>';
  return div;
};
toggleTravelButton.addTo(map);

// Add a button to toggle weather information
const toggleWeatherButton = L.control({ position: 'topright' });
toggleWeatherButton.onAdd = function () {
  const div = L.DomUtil.create('div', 'toggle-weather-button');
  div.innerHTML = '<button onclick="toggleWeather()">Show Weather Information</button>';
  return div;
};
toggleWeatherButton.addTo(map);

let showRoadDistances = false;
let roadDistanceLines = [];
let roadDistanceLabels = [];

function toggleRoadDistances() {
  showRoadDistances = !showRoadDistances;

  const button = document.querySelector('.toggle-road-button button');
  if (showRoadDistances) {
    button.style.backgroundColor = 'green';
    button.innerHTML = 'Show Straight Line Distances';

    // Hide straight line distances
    usaLines.forEach(({ line, distanceLabel }) => {
      line.setStyle({ opacity: 0 });
      distanceLabel.setOpacity(0);
    });
    mexicoLines.forEach(({ line, distanceLabel }) => {
      line.setStyle({ opacity: 0 });
      distanceLabel.setOpacity(0);
    });
  } else {
    button.style.backgroundColor = '';
    button.innerHTML = 'Show Road Distances';

    // Hide road distances
    roadDistanceLines.forEach(({ line }) => map.removeLayer(line));
    roadDistanceLabels.forEach(label => map.removeLayer(label));
    roadDistanceLines = [];
    roadDistanceLabels = [];
  }
}

function showRoadDistancesForSite(site) {
  // Use Mapbox Directions API to calculate road distances
  const routingServiceUrl = 'https://api.mapbox.com/directions/v5/mapbox/driving/';
  const accessToken = 'pk.eyJ1IjoiY2J1ZWhsZXIwMSIsImEiOiJjbTY2bzQ1MW8wMjdlMmxwdzc3dDZlYnA4In0.a09bYff34MsNaLoJsJYb6A'; // Replace with your Mapbox access token

  const connections = usaLines.filter(({ site1, site2 }) => site === site1 || site === site2);
  connections.push(...mexicoLines.filter(({ site1, site2 }) => site === site1 || site === site2));
  connections.push(...usaLines.filter(({ site1, site2 }) => (site === site1 || site === site2) && (site1.type === 'hq' || site2.type === 'hq')));

  if (includeHQ) {
    const hqSite = sites.find(site => site.type === 'hq');
    connections.push({ site1: site, site2: hqSite });
  }

  connections.forEach(({ site1, site2 }) => {
    const otherSite = site === site1 ? site2 : site1;
    const url = `${routingServiceUrl}${site.coords[1]},${site.coords[0]};${otherSite.coords[1]},${otherSite.coords[0]}?geometries=geojson&access_token=${accessToken}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distance = route.distance / 1609.34; // Convert meters to miles
          const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

          const line = L.polyline(coordinates, { color: 'purple', weight: 2, opacity: 0.5 }).addTo(map);
          roadDistanceLines.push({ line, site1: site, site2: otherSite });

          const midPoint = [
            (site.coords[0] + otherSite.coords[0]) / 2,
            (site.coords[1] + otherSite.coords[1]) / 2
          ];
          const distanceLabel = L.marker(midPoint, {
            icon: L.divIcon({
              className: 'distance-label',
              html: `${Math.round(distance)} miles`
            })
          }).addTo(map);
          distanceLabel.setOpacity(1); // Make the label visible
          roadDistanceLabels.push(distanceLabel);
        }
      });
  });
}

// Locate functionality
document.getElementById('locate').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const userCoords = [position.coords.latitude, position.coords.longitude];
      map.setView(userCoords, 10);

      if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
      }

      userLocationMarker = L.marker(userCoords).addTo(map)
        .bindPopup('You are here')
        .openPopup();
    }, () => {
      alert('Unable to retrieve your location');
    });
  } else {
    alert('Geolocation is not supported by your browser');
  }
});

// Reset Map functionality
document.getElementById('reset-map').addEventListener('click', () => {
  map.setView([37.8, -96], 4.5);

  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }

  if (userLocationMarker) {
    map.removeLayer(userLocationMarker);
    userLocationMarker = null;
  }

  if (shareButton) {
    map.removeControl(shareButton);
    shareButton = null;
  }
});

let showWeather = false;
let weatherMarkers = [];

function toggleWeather() {
  showWeather = !showWeather;

  const button = document.querySelector('.toggle-weather-button button');
  button.style.backgroundColor = showWeather ? 'green' : '';
  button.innerHTML = showWeather ? 'Hide Weather Information' : 'Show Weather Information';

  if (showWeather) {
    sites.forEach(async site => {
      const weather = await fetchWeather(site.coords);
      const weatherBox = createWeatherBox(weather);
      const weatherMarker = L.marker([site.coords[0] - 0.02, site.coords[1]], { icon: weatherBox }).addTo(map);
      weatherMarkers.push(weatherMarker);
    });
  } else {
    weatherMarkers.forEach(marker => map.removeLayer(marker));
    weatherMarkers = [];
  }
}
console.log('Script loaded'); // Debug log

// Omnisharp LLC 2025 Web Mapping Tool
// Mapbox API key for routing
// Aviationstack API key for airport data 62b03a79042579fe5f64a5e45684a9cc
// Weather API: openweather.com 08f999cb201437c57f5a0116102eebee
// https://github.com/hokiespurs/airportmap/blob/master/airports.geojson
// Created by Carston Buehler

const map = L.map('map').setView([37.8, -96], 4.5);
console.log('Map initialized'); // Debug log

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);
console.log('Tile layer added'); // Debug log

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

// Plant coordinates and details
const sites = [
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
  { name: 'Omnisharp', coords: [30.4604802, -97.6551371], type: 'hq', icon: 'hq' },
  { name: 'CES', coords: [53.4722462, -2.3793467], type: 'SaaS', icon: 'hq' }, 
  { name: 'Springdale', coords: [36.1907351, -94.4742007], type: 'SaaS', icon: 'hq' },
  { name: 'Keken', coords: [20.9861173, -89.7936814], type: 'plant', region: 'Mexico', icon: 'pig' },
  { name: 'Proan', coords: [20.6740117, -103.4179727], type: 'plant', region: 'Mexico', icon: 'pig' },
  { name: 'SuKarne', coords: [25.3220694, -104.908717], type: 'plant', region: 'Mexico', icon: 'cow' },
];

// Add markers and calculate distances
let beefCount = 0;
let porkCount = 0;
let poultryCount = 0;

// Function to fetch plant information from the database
async function fetchPlantInfo(plantName) {
  // Replace with actual API call to fetch plant information
  return {
    contact: 'John Doe',
    lastPM: '2023-09-15',
    nextPM: '2024-03-15',
    phone: '555-555-1234',
    tech: 'Jane Smith' // Add technician information
  };
}

// Function to create a popup with plant information
function createPlantInfoPopup(plantName, plantInfo) {
  return `
    <div>
      <strong>${plantName}</strong><br>
      <strong>Contact:</strong> ${plantInfo.contact}<br>
      <strong>Last PM:</strong> ${plantInfo.lastPM}<br>
      <strong>Tech:</strong> ${plantInfo.tech}<br>
      <strong>Next PM:</strong> ${plantInfo.nextPM}<br>
      <strong>Phone:</strong> ${plantInfo.phone}
    </div>
  `;
}

// Add markers and calculate distances
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

  marker.on('mouseover', async function() {
    const plantInfo = await fetchPlantInfo(site.name);
    marker.bindPopup(createPlantInfoPopup(site.name, plantInfo)).openPopup();
  });

  marker.on('mouseout', function() {
    marker.closePopup();
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
  });
});

// Update legend counts
document.getElementById('beef-count').textContent = beefCount;
document.getElementById('pork-count').textContent = porkCount;
document.getElementById('poultry-count').textContent = poultryCount;

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
let cachedWeatherData = {};
let weatherCacheExpiry = new Date();
weatherCacheExpiry.setHours(23, 59, 59, 999); // Set expiry to 11:59 PM today

async function fetchWeather(coords) {
  const cacheKey = `${coords[0]},${coords[1]}`;
  const now = new Date();

  if (cachedWeatherData[cacheKey] && now < weatherCacheExpiry) {
    console.log('Using cached weather data:', cachedWeatherData[cacheKey]);
    return cachedWeatherData[cacheKey];
  }

  const apiKey = '08f999cb201437c57f5a0116102eebee'; // Replace with your weather API key
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${coords[0]}&lon=${coords[1]}&units=imperial&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Weather data:', data); // Debug log

    if (data.cod !== "200") {
      console.error('Error fetching weather data:', data.message);
      return {
        low: 'N/A',
        high: 'N/A'
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const todayForecasts = data.list.filter(forecast => forecast.dt_txt.startsWith(today));

    const low = Math.min(...todayForecasts.map(forecast => forecast.main.temp_min));
    const high = Math.max(...todayForecasts.map(forecast => forecast.main.temp_max));

    const weather = {
      low: isFinite(low) ? sanitizeTemperature(low) : 'N/A',
      high: isFinite(high) ? sanitizeTemperature(high) : 'N/A'
    };

    console.log('Sanitized weather data:', weather); // Debug log

    cachedWeatherData[cacheKey] = weather;
    return weather;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return {
      low: 'N/A',
      high: 'N/A'
    };
  }
}

function sanitizeTemperature(temp) {
  if (isNaN(temp)) {
    console.error('Invalid temperature value:', temp);
    return 'N/A';
  }
  return Math.round(temp).toString(); // Round to the nearest integer and convert to string
}

function getWeatherBoxColor(temp) {
  if (temp < 32) {
    return '#0000FF'; // Dark Blue
  } else if (temp <= 40) {
    return '#4169E1'; // Medium Blue
  } else if (temp <= 49) {
    return '#87CEEB'; // Light Blue
  } else if (temp <= 69) {
    return '#FFFFE0'; // Light Yellow
  } else if (temp <= 89) {
    return '#FFD700'; // Medium Yellow
  } else {
    return '#FFA500'; // Dark Yellow
  }
}

function createWeatherBox(weather) {
  console.log('Creating weather box with data:', weather); // Debug log
  const lowColor = getWeatherBoxColor(weather.low !== 'N/A' ? parseInt(weather.low) : 0);
  const highColor = getWeatherBoxColor(weather.high !== 'N/A' ? parseInt(weather.high) : 0);
  return L.divIcon({
    className: 'weather-box',
    html: `<div style="background-color: ${lowColor}; color: black;">Low: ${weather.low !== 'N/A' ? weather.low + '°F' : 'N/A'}</div><div style="background-color: ${highColor}; color: black;">High: ${weather.high !== 'N/A' ? weather.high + '°F' : 'N/A'}</div>`,
    iconSize: [80, 40],
    iconAnchor: [40, 0]
  });
}

const aviationstackApiKey = '62b03a79042579fe5f64a5e45684a9cc';

async function fetchClosestAirports(coords) {
  // Ensure local airports data is loaded
  if (!window.localAirports) {
    await loadLocalAirports();
  }

  // Calculate distances and filter airports within 50 miles
  const airports = window.localAirports.map(airport => {
    const distance = calculateDistance(coords, [airport.geometry.coordinates[1], airport.geometry.coordinates[0]]);
    return {
      name: airport.properties.name,
      code: airport.properties.iata || 'N/A',
      distance: distance,
      latitude: airport.geometry.coordinates[1],
      longitude: airport.geometry.coordinates[0]
    };
  }).filter(airport => airport.distance <= 50);

  console.log('Filtered airports:', airports); // Debug log
  return airports.sort((a, b) => a.distance - b.distance).slice(0, 3);
}

// Load local airports from a GeoJSON file
async function loadLocalAirports() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/hokiespurs/airportmap/master/airports.geojson'); // Fetch GeoJSON from GitHub
    const data = await response.json();
    console.log('Local airports GeoJSON data:', data); // Debug log

    const airportLayer = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        // This function will be used to create markers for airports
        return L.marker(latlng, { icon: airportIcon }).bindPopup(`${feature.properties.name} (${feature.properties.iata})`);
      }
    });

    // Add the airport layer to the map
    map.addLayer(airportLayer);

    // Store the airport data for later use
    window.localAirports = data.features;
  } catch (error) {
    console.error('Error loading local airports:', error);
  }
}

// Call the function to load local airports
loadLocalAirports();

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

// Toggle buttons functionality
document.querySelector('.toggle-distance-button').addEventListener('click', toggleLinesAndLabels);
document.querySelector('.toggle-road-button').addEventListener('click', toggleRoadDistances);
document.querySelector('.toggle-travel-button').addEventListener('click', toggleTravel);
document.querySelector('.toggle-weather-button').addEventListener('click', toggleWeather);

// Function to show/hide lines and distance labels connected to a site
function toggleLinesAndLabels() {
  showLines = !showLines;

  const button = document.querySelector('.toggle-distance-button');
  button.style.backgroundColor = showLines ? 'green' : '';
  button.innerHTML = showLines ? 'Hide Straight Line Distances' : 'Show Straight Line Distances';

  usaLines.forEach(({ line, distanceLabel }) => {
    line.setStyle({ opacity: showLines ? 0.5 : 0 });
    distanceLabel.setOpacity(showLines ? 1 : 0);
  });
  mexicoLines.forEach(({ line, distanceLabel }) => {
    line.setStyle({ opacity: showLines ? 0.5 : 0 });
    distanceLabel.setOpacity(showLines ? 1 : 0);
  });

  // Disable or enable plant popups
  sites.forEach(site => {
    const marker = L.marker(site.coords);
    if (showLines) {
      marker.off('mouseover');
      marker.off('mouseout');
      marker.off('click');
    } else {
      marker.on('mouseover', async function() {
        const plantInfo = await fetchPlantInfo(site.name);
        marker.bindPopup(createPlantInfoPopup(site.name, plantInfo)).openPopup();
      });

      marker.on('mouseout', function() {
        marker.closePopup();
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
      });
    }
  });
}

// Function to show road distances for a site
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

// Function to toggle road distances
function toggleRoadDistances() {
  showRoadDistances = !showRoadDistances;

  const button = document.querySelector('.toggle-road-button');
  button.style.backgroundColor = showRoadDistances ? 'green' : '';
  button.innerHTML = showRoadDistances ? 'Hide Road Distances' : 'Show Road Distances';

  if (showRoadDistances) {
    sites.forEach(site => showRoadDistancesForSite(site));
  } else {
    roadDistanceLines.forEach(({ line }) => map.removeLayer(line));
    roadDistanceLabels.forEach(label => map.removeLayer(label));
    roadDistanceLines = [];
    roadDistanceLabels = [];
  }
}

// Function to toggle travel information
function toggleTravel() {
  showTravel = !showTravel;

  const button = document.querySelector('.toggle-travel-button');
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

// Function to toggle weather information
function toggleWeather() {
  showWeather = !showWeather;

  const button = document.querySelector('.toggle-weather-button');
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

// Function to generate a shareable link for the current map view
function generateShareableLink() {
  const center = map.getCenter();
  const zoom = map.getZoom();
  const shareableLink = `${window.location.origin}${window.location.pathname}?lat=${center.lat}&lng=${center.lng}&zoom=${zoom}`;
  return shareableLink;
}

// Event listener for the Share button
document.getElementById('share').addEventListener('click', () => {
  const shareableLink = generateShareableLink();
  prompt('Copy this link to share the current map view:', shareableLink);
});

let showLines = false;
let usaLines = [];
let mexicoLines = [];

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
          html: `${Math.round(closestDistances[sortedIndices[0]])} miles`
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
          html: `${Math.round(closestDistances[sortedIndices[i]])} miles`
        })
      }).addTo(map);
      distanceLabel.setOpacity(0); // Initially invisible
      lines.push({ line, distanceLabel, site1: site, site2: additionalSite });
    }
  });

  return lines;
}

// Connect USA plants
usaLines = connectPlants('USA', 'blue');

// Connect Mexico plants with red lines and distance labels
mexicoLines = connectPlants('Mexico', 'red');

// Function to show/hide lines and distance labels connected to a site
function toggleLinesAndLabels() {
  showLines = !showLines;

  const button = document.querySelector('.toggle-distance-button');
  button.style.backgroundColor = showLines ? 'green' : '';
  button.innerHTML = showLines ? 'Hide Straight Line Distances' : 'Show Straight Line Distances';

  usaLines.forEach(({ line, distanceLabel }) => {
    line.setStyle({ opacity: showLines ? 0.5 : 0 });
    distanceLabel.setOpacity(showLines ? 1 : 0);
  });
  mexicoLines.forEach(({ line, distanceLabel }) => {
    line.setStyle({ opacity: showLines ? 0.5 : 0 });
    distanceLabel.setOpacity(showLines ? 1 : 0);
  });

  // Disable or enable plant popups
  sites.forEach(site => {
    const marker = L.marker(site.coords);
    if (showLines) {
      marker.off('mouseover');
      marker.off('mouseout');
      marker.off('click');
    } else {
      marker.on('mouseover', async function() {
        const plantInfo = await fetchPlantInfo(site.name);
        marker.bindPopup(createPlantInfoPopup(site.name, plantInfo)).openPopup();
      });

      marker.on('mouseout', function() {
        marker.closePopup();
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
      });
    }
  });
}

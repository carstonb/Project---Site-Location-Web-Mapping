// Omnisharp LLC 2025 Web Mapping Tool
// Mapbox API key for routing
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
  { name: 'SuKarne', coords: [25.3220694, -104.908717], type: 'plant', region: 'Mexico', icon: 'pig' },
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

// Add markers and calculate distances
let beefCount = 0;
let porkCount = 0;
let poultryCount = 0;

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
  L.marker(site.coords, { icon: icon }).addTo(map)
    .bindPopup(site.name);
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
}

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

  marker.on('click', function() {
    if (userLocationMarker) {
      getDirections([userLocationMarker.getLatLng().lat, userLocationMarker.getLatLng().lng], site.coords);
    } else {
      alert('If you would like routing directions to this site, please use the "Locate Me" button first to get your current location.');
    }
  });
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
              html: `${Math.round(distance)}`
            })
          }).addTo(map);
          distanceLabel.setOpacity(1); // Make the label visible
          roadDistanceLabels.push(distanceLabel);
        }
      });
  });
}

// Locate Me functionality
let userLocationMarker;

document.getElementById('locate-me').addEventListener('click', () => {
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
const map = L.map('map').setView([37.8, -96], 4.5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Define custom icons
const plantIcon = L.icon({
  iconUrl: 'Images/cow.png', // Ensure this path is correct
  iconSize: [25, 41], // Adjust these values to change the size
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hqIcon = L.icon({
  iconUrl: 'Images/HQ.png', // Ensure this path is correct
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// https://www.latlong.net/convert-address-to-lat-long.html
const sites = [
  // Plants - USA
  { name: 'Amarillo', coords: [35.4127458, -101.654053], type: 'plant', region: 'USA' },
  { name: 'Finney County', coords: [37.9983271, -101.0285989], type: 'plant', region: 'USA' },
  { name: 'Joslin', coords: [41.555850, -90.225245], type: 'plant', region: 'USA' },
  { name: 'Lexington', coords: [40.761108, -99.735229], type: 'plant', region: 'USA' },
  { name: 'Dakota City', coords: [42.478832, -96.413133], type: 'plant', region: 'USA' },
  { name: 'Smithfield', coords: [34.7545191, -78.8070153], type: 'plant', region: 'USA' },
  { name: 'Storm Lake', coords: [42.6392091, -95.1846581], type: 'plant', region: 'USA' },
  { name: 'Pasco', coords: [46.1375306, -118.9156132], type: 'plant', region: 'USA' },
  { name: 'Green Bay', coords: [44.5282995, -88.0901618], type: 'plant', region: 'USA' },
  { name: 'Plainwell', coords: [42.4211736, -85.6497604], type: 'plant', region: 'USA' },
  { name: 'Souderton', coords: [40.2712296, -75.3361326], type: 'plant', region: 'USA' },
  { name: 'Tolleson', coords: [33.4411955, -112.2553217], type: 'plant', region: 'USA' },
  { name: 'Omaha', coords: [41.2093464, -95.9701349], type: 'plant', region: 'USA' },
  // HQ and Remote Locations
  { name: 'Omnisharp', coords: [30.4604802, -97.6551371], type: 'hq' },
  // Sharpening Centers
  { name: 'Springdale', coords: [36.1907351, -94.4742007], type: 'SaaS' },
  { name: 'CES', coords: [53.4722462, -2.3793467], type: 'SaaS' },
  // International - Mexico
  { name: 'Keken ', coords: [20.9861173, -89.7936814], type: 'plant', region: 'Mexico' },
  { name: 'Proan', coords: [20.6740117, -103.4179727], type: 'plant', region: 'Mexico' },
  { name: 'SuKarne', coords: [25.3220694, -104.908717], type: 'plant', region: 'Mexico' },
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
sites.forEach(site => {
  const icon = site.type === 'plant' ? plantIcon : hqIcon;
  L.marker(site.coords, { icon: icon }).addTo(map)
    .bindPopup(site.name);
});

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
    const line = L.polyline([fromSite.coords, toSite.coords], { color: 'blue', weight: 2, opacity: 0 }).addTo(map);
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

// Toggle for connecting Mexico sites to the USA
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
        const line = L.polyline([mexicoPlant.coords, closestUSASite.coords], { color: 'green', weight: 2, opacity: 0 }).addTo(map); // Different color line
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
        distanceLabel.setOpacity(0); // Initially invisible
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

// Add hover event listeners to markers
sites.forEach(site => {
  const marker = L.marker(site.coords, { icon: site.type === 'plant' ? plantIcon : hqIcon }).addTo(map)
    .bindPopup(site.name);

  marker.on('mouseover', function() {
    toggleLinesAndLabels(site, usaLines, true);
    toggleLinesAndLabels(site, mexicoLines, true);
    toggleLinesAndLabels(site, mexicoToUSALines, true); // Ensure Mexico to USA lines are shown
    toggleLinesAndLabels(site, mexicoToUSADistanceLabels, true); // Ensure Mexico to USA distance labels are shown
  });

  marker.on('mouseout', function() {
    toggleLinesAndLabels(site, usaLines, false);
    toggleLinesAndLabels(site, mexicoLines, false);
    toggleLinesAndLabels(site, mexicoToUSALines, false); // Ensure Mexico to USA lines are hidden
    toggleLinesAndLabels(site, mexicoToUSADistanceLabels, false); // Ensure Mexico to USA distance labels are hidden
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
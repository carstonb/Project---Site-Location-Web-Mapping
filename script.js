const map = L.map('map').setView([37.8, -96], 4.5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Define custom icons
const plantIcon = L.icon({
  iconUrl: 'Images/cow.png', // Ensure this path is correct
  iconSize: [25, 41],
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
  { name: 'CES', coords: [46.138639, -118.912746], type: 'SaaS' },
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

  plants.forEach((site) => {
    let closestSite = null;
    let closestDistance = Infinity;

    plants.forEach((otherSite) => {
      if (site !== otherSite) {
        const distance = calculateDistance(site.coords, otherSite.coords);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestSite = otherSite;
        }
      }
    });

    if (closestSite) {
      connectedPlants.add(site);
      connectedPlants.add(closestSite);

      const line = L.polyline([site.coords, closestSite.coords], { color: lineColor, weight: 2 }).addTo(map); // Thinner line
      const midPoint = [
        (site.coords[0] + closestSite.coords[0]) / 2,
        (site.coords[1] + closestSite.coords[1]) / 2
      ];
      const distanceLabel = L.marker(midPoint, {
        icon: L.divIcon({
          className: 'distance-label',
          html: `${Math.round(closestDistance)} miles` // Whole numbers without fractions
        })
      }).addTo(map);
      connectedPlants.add(distanceLabel);
    }
  });

  // Ensure each plant has at least one connection
  plants.forEach((site) => {
    if (!connectedPlants.has(site)) {
      let closestSite = null;
      let closestDistance = Infinity;

      plants.forEach((otherSite) => {
        if (site !== otherSite) {
          const distance = calculateDistance(site.coords, otherSite.coords);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestSite = otherSite;
          }
        }
      });

      if (closestSite) {
        connectedPlants.add(site);
        connectedPlants.add(closestSite);

        const line = L.polyline([site.coords, closestSite.coords], { color: lineColor, weight: 2 }).addTo(map); // Thinner line
        const midPoint = [
          (site.coords[0] + closestSite.coords[0]) / 2,
          (site.coords[1] + closestSite.coords[1]) / 2
        ];
        const distanceLabel = L.marker(midPoint, {
          icon: L.divIcon({
            className: 'distance-label',
            html: `${Math.round(closestDistance)} miles` // Whole numbers without fractions
          })
        }).addTo(map);
        connectedPlants.add(distanceLabel);
      }
    }
  });
}

// Connect USA plants
connectPlants('USA', 'blue');

// Connect Mexico plants with red lines and distance labels
connectPlants('Mexico', 'red');

// Toggle for connecting Mexico sites to the USA
let connectMexicoToUSAToggle = false;
let mexicoToUSALines = [];
let mexicoToUSADistanceLabels = [];

function toggleConnectMexicoToUSA() {
  connectMexicoToUSAToggle = !connectMexicoToUSAToggle;

  if (connectMexicoToUSAToggle) {
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
        const line = L.polyline([mexicoPlant.coords, closestUSASite.coords], { color: 'green', weight: 2 }).addTo(map); // Different color line
        mexicoToUSALines.push(line);
        const midPoint = [
          (mexicoPlant.coords[0] + closestUSASite.coords[0]) / 2,
          (mexicoPlant.coords[1] + closestUSASite.coords[1]) / 2
        ];
        const distanceLabel = L.marker(midPoint, {
          icon: L.divIcon({
            className: 'distance-label',
            html: `${Math.round(closestDistance)} miles` // Whole numbers without fractions
          })
        }).addTo(map);
        mexicoToUSADistanceLabels.push(distanceLabel);
      }
    });
  } else {
    // Remove Mexico to USA connections
    mexicoToUSALines.forEach(line => map.removeLayer(line));
    mexicoToUSADistanceLabels.forEach(label => map.removeLayer(label));
    mexicoToUSALines = [];
    mexicoToUSADistanceLabels = [];
  }
}

// Add a button to toggle Mexico to USA connections
const toggleButton = L.control({ position: 'topright' });
toggleButton.onAdd = function () {
  const div = L.DomUtil.create('div', 'toggle-button');
  div.innerHTML = '<button onclick="toggleConnectMexicoToUSA()">Toggle Mexico to USA Connections</button>';
  return div;
};
toggleButton.addTo(map);
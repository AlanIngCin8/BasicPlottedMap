// OpenStreetMap implementation using Leaflet.js

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================
let map;
let markersLayer;
let nearbyMarkersLayer;
let allPoints = [];
let isLeafletAvailable = false;

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize the application when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if Leaflet is available
    if (typeof L !== 'undefined') {
        isLeafletAvailable = true;
        initializeLeafletMap();
    } else {
        console.warn('Leaflet.js not available, falling back to simple implementation');
        initializeFallbackMap();
    }
    
    loadMapPoints();
    setupEventListeners();
});

// ============================================================================
// MAP INITIALIZATION FUNCTIONS
// ============================================================================

function initializeLeafletMap() {
    // Initialize the map with OpenStreetMap tiles
    map = L.map('map').setView([40.7128, -74.0060], 3);

    // Create different tile layers
    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
    });

    // Add the default layer (street)
    streetLayer.addTo(map);

    // Create layer control
    const baseLayers = {
        "Street View": streetLayer,
        "Satellite View": satelliteLayer
    };

    L.control.layers(baseLayers).addTo(map);

    // Initialize markers layers
    markersLayer = L.layerGroup().addTo(map);
    nearbyMarkersLayer = L.layerGroup().addTo(map);
}

function initializeFallbackMap() {
    // Fallback implementation when Leaflet is not available
    document.body.classList.add('leaflet-fallback');
    const mapDiv = document.getElementById('map');
    mapDiv.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%; background: linear-gradient(180deg, #87CEEB 0%, #E0F6FF 30%, #90EE90 70%, #228B22 100%);">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #2c3e50;">
                <h3>Map View</h3>
                <p>OpenStreetMap tiles are not available in this environment</p>
                <p>Points will still be functional in the sidebar</p>
            </div>
        </div>
    `;
}

function setupEventListeners() {
    const nearbyBtn = document.getElementById('nearbyBtn');
    nearbyBtn.addEventListener('click', findNearbyPoints);
    
    // Stress test controls
    const loadTestBtn = document.getElementById('loadTestBtn');
    loadTestBtn.addEventListener('click', handleLoadTestData);
}

// Handle loading test data
async function handleLoadTestData() {
    const testSizeSelect = document.getElementById('testSizeSelect');
    const testTypeSelect = document.getElementById('testTypeSelect');
    const loadTestBtn = document.getElementById('loadTestBtn');
    
    const testSize = parseInt(testSizeSelect.value);
    const testType = testTypeSelect.value;
    
    // Disable button during loading
    loadTestBtn.disabled = true;
    loadTestBtn.textContent = 'Loading...';
    
    try {
        if (testSize === 0) {
            // Load original data
            await loadMapPoints(false);
        } else {
            // Load test data
            await loadMapPoints(true, testSize, testType);
        }
    } finally {
        // Re-enable button
        loadTestBtn.disabled = false;
        loadTestBtn.textContent = 'Load Test Data';
    }
}

// ============================================================================
// STRESS TESTING & PERFORMANCE
// ============================================================================

// Performance monitoring
let performanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    pointCount: 0,
    memoryUsage: 0,
    clusterCount: 0,
    generationTime: 0
};

// Performance analysis for different dataset sizes
function analyzePerformance(metrics) {
    const analysis = {
        dataProcessingRate: Math.round(metrics.pointCount / metrics.generationTime * 1000), // points per second
        memoryPerPoint: (metrics.memoryUsage / metrics.pointCount * 1024).toFixed(2), // KB per point
        totalThroughput: Math.round(metrics.pointCount / (metrics.loadTime / 1000)), // points per second total
        efficiency: metrics.pointCount > 1000 ? 'optimized' : 'standard'
    };
    
    console.log('Performance Analysis:', {
        pointsPerSecond: analysis.dataProcessingRate,
        memoryPerPointKB: analysis.memoryPerPoint,
        totalThroughput: analysis.totalThroughput,
        efficiency: analysis.efficiency,
        clusteringActive: metrics.clusterCount > 0
    });
    
    return analysis;
}

// Generate large test datasets for stress testing
function generateTestDataset(size, type = 'random') {
    const startTime = performance.now();
    const points = [];
    
    if (type === 'random') {
        // Generate random points globally
        for (let i = 0; i < size; i++) {
            points.push({
                id: i + 1000, // Offset to avoid conflicts with real data
                name: `Test Point ${i + 1}`,
                lat: (Math.random() - 0.5) * 180, // -90 to 90
                lng: (Math.random() - 0.5) * 360, // -180 to 180
                type: 'test',
                description: `Generated test point ${i + 1} for stress testing`
            });
        }
    } else if (type === 'clustered') {
        // Generate clustered points around major cities
        const centers = [
            {lat: 40.7128, lng: -74.0060}, // NYC
            {lat: 51.5074, lng: -0.1278},  // London
            {lat: 35.6762, lng: 139.6503}, // Tokyo
            {lat: -33.8688, lng: 151.2093}, // Sydney
            {lat: 48.8566, lng: 2.3522}    // Paris
        ];
        
        for (let i = 0; i < size; i++) {
            const center = centers[Math.floor(Math.random() * centers.length)];
            const radius = 0.5; // ~50km spread
            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * radius;
            
            points.push({
                id: i + 1000,
                name: `Clustered Point ${i + 1}`,
                lat: center.lat + (distance * Math.cos(angle)),
                lng: center.lng + (distance * Math.sin(angle)),
                type: 'test-clustered',
                description: `Clustered test point ${i + 1}`
            });
        }
    }
    
    const generationTime = performance.now() - startTime;
    console.log(`Generated ${size} ${type} points in ${generationTime.toFixed(2)}ms`);
    
    // Store generation time for analysis
    performanceMetrics.generationTime = generationTime;
    
    return points;
}

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

// Mock API function to get points data
async function fetchMapPoints(testMode = false, testSize = 0, testType = 'random') {
    const startTime = performance.now();
    
    // Simulate API delay (reduced for large datasets)
    const delay = testMode && testSize > 1000 ? 100 : 500;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    if (testMode && testSize > 0) {
        const testPoints = generateTestDataset(testSize, testType);
        performanceMetrics.loadTime = performance.now() - startTime;
        performanceMetrics.pointCount = testSize;
        return testPoints;
    }
    
    // Mock data with various global locations
    return [
        {
            id: 1,
            name: "New York City",
            lat: 40.7128,
            lng: -74.0060,
            type: "city",
            description: "The largest city in the United States"
        },
        {
            id: 2,
            name: "London",
            lat: 51.5074,
            lng: -0.1278,
            type: "city",
            description: "Capital of the United Kingdom"
        },
        {
            id: 3,
            name: "Tokyo",
            lat: 35.6762,
            lng: 139.6503,
            type: "city",
            description: "Capital of Japan"
        },
        {
            id: 4,
            name: "Sydney",
            lat: -33.8688,
            lng: 151.2093,
            type: "city",
            description: "Largest city in Australia"
        },
        {
            id: 5,
            name: "Paris",
            lat: 48.8566,
            lng: 2.3522,
            type: "city",
            description: "Capital of France"
        },
        {
            id: 6,
            name: "Cairo",
            lat: 30.0444,
            lng: 31.2357,
            type: "city",
            description: "Capital of Egypt"
        },
        {
            id: 7,
            name: "Mumbai",
            lat: 19.0760,
            lng: 72.8777,
            type: "city",
            description: "Financial capital of India"
        },
        {
            id: 8,
            name: "São Paulo",
            lat: -23.5505,
            lng: -46.6333,
            type: "city",
            description: "Largest city in Brazil"
        },
        {
            id: 9,
            name: "Cape Town",
            lat: -33.9249,
            lng: 18.4241,
            type: "city",
            description: "Legislative capital of South Africa"
        },
        {
            id: 10,
            name: "Vancouver",
            lat: 49.2827,
            lng: -123.1207,
            type: "city",
            description: "Coastal city in Canada"
        },
        // Melbourne area points for testing nearby functionality
        {
            id: 11,
            name: "Melbourne",
            lat: -37.8136,
            lng: 144.9631,
            type: "city",
            description: "Cultural capital of Australia"
        },
        {
            id: 12,
            name: "Geelong",
            lat: -38.1499,
            lng: 144.3617,
            type: "city",
            description: "Port city 75km southwest of Melbourne"
        },
        {
            id: 13,
            name: "Ballarat",
            lat: -37.5622,
            lng: 143.8503,
            type: "city",
            description: "Historic gold rush city 105km northwest of Melbourne"
        },
        {
            id: 14,
            name: "Bendigo",
            lat: -36.7570,
            lng: 144.2794,
            type: "city",
            description: "Regional city 150km north of Melbourne"
        },
        {
            id: 15,
            name: "Mornington",
            lat: -38.2176,
            lng: 145.0391,
            type: "coastal",
            description: "Coastal town on Mornington Peninsula, 60km south of Melbourne"
        },
        {
            id: 16,
            name: "Dandenong Ranges",
            lat: -37.8339,
            lng: 145.3464,
            type: "landmark",
            description: "Mountain range and national park 40km east of Melbourne"
        },
        {
            id: 17,
            name: "Frankston",
            lat: -38.1342,
            lng: 145.1231,
            type: "suburb",
            description: "Bayside suburb 40km southeast of Melbourne"
        },
        {
            id: 18,
            name: "St Kilda",
            lat: -37.8677,
            lng: 144.9811,
            type: "suburb",
            description: "Famous beachside suburb 8km south of Melbourne CBD"
        },
        {
            id: 19,
            name: "Richmond",
            lat: -37.8197,
            lng: 144.9934,
            type: "suburb",
            description: "Inner-city suburb 5km east of Melbourne CBD"
        },
        {
            id: 20,
            name: "Footscray",
            lat: -37.7993,
            lng: 144.9005,
            type: "suburb",
            description: "Multicultural suburb 8km west of Melbourne CBD"
        }
    ];
}

// Mock API function to get point details
async function fetchPointDetails(pointId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockDetails = {
        1: {
            title: "New York City Details",
            description: "The most populous city in the United States, located in the state of New York.",
            image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%234a90e2'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='20'%3ENew York%3C/text%3E%3C/svg%3E",
            data: [
                { property: "Population", value: "8.3 million" },
                { property: "Area", value: "778.2 km²" },
                { property: "Founded", value: "1624" },
                { property: "Time Zone", value: "EST (UTC-5)" }
            ]
        },
        2: {
            title: "London Details",
            description: "The capital and largest city of England and the United Kingdom.",
            image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23e74c3c'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='20'%3ELondon%3C/text%3E%3C/svg%3E",
            data: [
                { property: "Population", value: "9.0 million" },
                { property: "Area", value: "1,572 km²" },
                { property: "Founded", value: "47 AD" },
                { property: "Time Zone", value: "GMT (UTC+0)" }
            ]
        },
        3: {
            title: "Tokyo Details",
            description: "The capital of Japan and the most populous metropolitan area in the world.",
            image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23f39c12'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='20'%3ETokyo%3C/text%3E%3C/svg%3E",
            data: [
                { property: "Population", value: "37.4 million" },
                { property: "Area", value: "2,194 km²" },
                { property: "Founded", value: "1457" },
                { property: "Time Zone", value: "JST (UTC+9)" }
            ]
        },
        4: {
            title: "Sydney Details",
            description: "The largest city in Australia and a major global city known for its harbour.",
            image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%2327ae60'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='20'%3ESydney%3C/text%3E%3C/svg%3E",
            data: [
                { property: "Population", value: "5.3 million" },
                { property: "Area", value: "12,368 km²" },
                { property: "Founded", value: "1788" },
                { property: "Time Zone", value: "AEST (UTC+10)" }
            ]
        },
        5: {
            title: "Paris Details",
            description: "The capital and most populous city of France, known as the City of Light.",
            image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%239b59b6'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='20'%3EParis%3C/text%3E%3C/svg%3E",
            data: [
                { property: "Population", value: "2.1 million" },
                { property: "Area", value: "105.4 km²" },
                { property: "Founded", value: "3rd century BC" },
                { property: "Time Zone", value: "CET (UTC+1)" }
            ]
        },
        6: {
            title: "Cairo Details",
            description: "The capital of Egypt and the largest city in the Arab world.",
            image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23d35400'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='20'%3ECairo%3C/text%3E%3C/svg%3E",
            data: [
                { property: "Population", value: "20.9 million" },
                { property: "Area", value: "606 km²" },
                { property: "Founded", value: "969 AD" },
                { property: "Time Zone", value: "EET (UTC+2)" }
            ]
        },
        7: {
            title: "Mumbai Details",
            description: "The financial capital of India and the most populous city in the country.",
            image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%2316a085'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='20'%3EMumbai%3C/text%3E%3C/svg%3E",
            data: [
                { property: "Population", value: "20.4 million" },
                { property: "Area", value: "603.4 km²" },
                { property: "Founded", value: "1507" },
                { property: "Time Zone", value: "IST (UTC+5:30)" }
            ]
        },
        8: {
            title: "São Paulo Details",
            description: "The largest city in Brazil and the most populous city in the Southern Hemisphere.",
            image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%232c3e50'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='20'%3ES%C3%A3o Paulo%3C/text%3E%3C/svg%3E",
            data: [
                { property: "Population", value: "12.3 million" },
                { property: "Area", value: "1,521 km²" },
                { property: "Founded", value: "1554" },
                { property: "Time Zone", value: "BRT (UTC-3)" }
            ]
        },
        9: {
            title: "Cape Town Details",
            description: "The legislative capital of South Africa and one of the most beautiful cities in the world.",
            image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%238e44ad'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='20'%3ECape Town%3C/text%3E%3C/svg%3E",
            data: [
                { property: "Population", value: "4.6 million" },
                { property: "Area", value: "2,454 km²" },
                { property: "Founded", value: "1652" },
                { property: "Time Zone", value: "SAST (UTC+2)" }
            ]
        },
        10: {
            title: "Vancouver Details",
            description: "A coastal city in western Canada, consistently ranked among the world's most livable cities.",
            image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%2334495e'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='20'%3EVancouver%3C/text%3E%3C/svg%3E",
            data: [
                { property: "Population", value: "2.6 million" },
                { property: "Area", value: "2,878 km²" },
                { property: "Founded", value: "1886" },
                { property: "Time Zone", value: "PST (UTC-8)" }
            ]
        },
        // Melbourne area points for testing nearby functionality
        11: {
            title: "Melbourne Details",
            description: "The cultural capital of Australia, known for its coffee culture, street art, and sports events.",
            image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23e67e22'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='18'%3EMelbourne%3C/text%3E%3C/svg%3E",
            data: [
                { property: "Population", value: "5.2 million" },
                { property: "Area", value: "9,992 km²" },
                { property: "Founded", value: "1835" },
                { property: "Time Zone", value: "AEST (UTC+10)" }
            ]
        },
        12: {
            title: "Geelong Details",
            description: "Victoria's second largest city, known for its waterfront and proximity to the Surf Coast.",
            image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%233498db'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='20'%3EGeelong%3C/text%3E%3C/svg%3E",
            data: [
                { property: "Population", value: "253,000" },
                { property: "Area", value: "1,240 km²" },
                { property: "Distance from Melbourne", value: "75 km SW" },
                { property: "Time Zone", value: "AEST (UTC+10)" }
            ]
        },
        13: {
            title: "Ballarat Details",
            description: "Historic gold rush city with well-preserved Victorian architecture and Sovereign Hill.",
            image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23f1c40f'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='20'%3EBallarat%3C/text%3E%3C/svg%3E",
            data: [
                { property: "Population", value: "109,000" },
                { property: "Area", value: "740 km²" },
                { property: "Distance from Melbourne", value: "105 km NW" },
                { property: "Notable for", value: "Gold Rush history" }
            ]
        },
        14: {
            title: "Bendigo Details",
            description: "Regional city known for its Victorian architecture and thriving arts scene.",
            image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23e74c3c'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='20'%3EBendigo%3C/text%3E%3C/svg%3E",
            data: [
                { property: "Population", value: "118,000" },
                { property: "Area", value: "3,048 km²" },
                { property: "Distance from Melbourne", value: "150 km N" },
                { property: "Notable for", value: "Art Gallery & Historic architecture" }
            ]
        },
        15: {
            title: "Mornington Details",
            description: "Coastal town on the beautiful Mornington Peninsula, popular for beaches and wineries.",
            image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%2316a085'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='18'%3EMornington%3C/text%3E%3C/svg%3E",
            data: [
                { property: "Population", value: "25,000" },
                { property: "Type", value: "Coastal town" },
                { property: "Distance from Melbourne", value: "60 km S" },
                { property: "Known for", value: "Beaches & wineries" }
            ]
        },
        16: {
            title: "Dandenong Ranges Details",
            description: "Mountain range and national park known for tall forests, gardens, and scenic railways.",
            image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%2327ae60'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='16'%3EDandenong Ranges%3C/text%3E%3C/svg%3E",
            data: [
                { property: "Type", value: "Mountain range & National Park" },
                { property: "Elevation", value: "633m (highest point)" },
                { property: "Distance from Melbourne", value: "40 km E" },
                { property: "Famous for", value: "Puffing Billy Railway" }
            ]
        },
        17: {
            title: "Frankston Details",
            description: "Bayside suburb known for its beaches, pier, and gateway to the Mornington Peninsula.",
            image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%239b59b6'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='18'%3EFrankston%3C/text%3E%3C/svg%3E",
            data: [
                { property: "Population", value: "142,000" },
                { property: "Type", value: "Bayside suburb" },
                { property: "Distance from Melbourne", value: "40 km SE" },
                { property: "Known for", value: "Beaches & pier" }
            ]
        },
        18: {
            title: "St Kilda Details",
            description: "Famous beachside suburb known for Luna Park, penguins, and vibrant nightlife.",
            image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23f39c12'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='20'%3ESt Kilda%3C/text%3E%3C/svg%3E",
            data: [
                { property: "Population", value: "19,000" },
                { property: "Type", value: "Beachside suburb" },
                { property: "Distance from Melbourne", value: "8 km S" },
                { property: "Famous for", value: "Luna Park & penguins" }
            ]
        },
        19: {
            title: "Richmond Details",
            description: "Inner-city suburb known for Bridge Road shopping, Vietnamese food, and MCG proximity.",
            image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%234a90e2'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='20'%3ERichmond%3C/text%3E%3C/svg%3E",
            data: [
                { property: "Population", value: "26,000" },
                { property: "Type", value: "Inner-city suburb" },
                { property: "Distance from Melbourne", value: "5 km E" },
                { property: "Known for", value: "Bridge Road & MCG" }
            ]
        },
        20: {
            title: "Footscray Details",
            description: "Multicultural suburb known for its diverse food scene and University campus.",
            image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23d35400'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='18'%3EFootscray%3C/text%3E%3C/svg%3E",
            data: [
                { property: "Population", value: "17,000" },
                { property: "Type", value: "Inner-west suburb" },
                { property: "Distance from Melbourne", value: "8 km W" },
                { property: "Known for", value: "Multicultural food scene" }
            ]
        }
    };
    
    return mockDetails[pointId] || {
        title: "Unknown Location",
        description: "No details available for this location.",
        image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%237f8c8d'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E",
        data: []
    };
}

// ============================================================================
// MAP INTERACTION FUNCTIONS
// ============================================================================

async function loadMapPoints(testMode = false, testSize = 0, testType = 'random') {
    const totalStartTime = performance.now();
    updateStatus(testMode ? `Loading ${testSize} test points...` : "Loading map points...");
    
    try {
        const points = await fetchMapPoints(testMode, testSize, testType);
        allPoints = points;
        
        // Start render timing
        const renderStartTime = performance.now();
        
        if (isLeafletAvailable && markersLayer) {
            // Clear existing markers
            markersLayer.clearLayers();
            
            // For large datasets, implement progressive loading and clustering
            if (points.length > 1000) {
                await loadPointsWithClustering(points);
            } else {
                // Standard loading for smaller datasets
                points.forEach(point => {
                    const marker = L.marker([point.lat, point.lng])
                        .bindPopup(`<strong>${point.name}</strong><br>${point.description}`)
                        .on('click', () => handleMarkerClick(point));
                    
                    markersLayer.addLayer(marker);
                });
                
                // Fit map to show all markers
                if (points.length > 0) {
                    const group = new L.featureGroup(markersLayer.getLayers());
                    map.fitBounds(group.getBounds().pad(0.1));
                }
            }
        }
        
        // Calculate performance metrics
        const totalTime = performance.now() - totalStartTime;
        performanceMetrics.renderTime = performance.now() - renderStartTime;
        performanceMetrics.pointCount = points.length;
        
        // Report memory usage if available
        if (performance.memory) {
            performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        }
        
        const statusMessage = testMode 
            ? `Loaded ${points.length} test points (${totalTime.toFixed(0)}ms total, ${performanceMetrics.renderTime.toFixed(0)}ms render)`
            : `Loaded ${points.length} points`;
            
        updateStatus(statusMessage);
        
        // Log detailed performance for test mode
        if (testMode) {
            console.log('Performance Metrics:', {
                totalTime: totalTime.toFixed(2) + 'ms',
                loadTime: performanceMetrics.loadTime.toFixed(2) + 'ms', 
                renderTime: performanceMetrics.renderTime.toFixed(2) + 'ms',
                generationTime: performanceMetrics.generationTime.toFixed(2) + 'ms',
                pointCount: performanceMetrics.pointCount,
                clusterCount: performanceMetrics.clusterCount,
                memoryUsage: performanceMetrics.memoryUsage.toFixed(2) + 'MB'
            });
            
            // Perform detailed analysis
            analyzePerformance(performanceMetrics);
        }
        
    } catch (error) {
        console.error('Error loading map points:', error);
        updateStatus("Error loading points");
    }
}

// Load points with clustering for better performance at scale
async function loadPointsWithClustering(points) {
    updateStatus(`Clustering ${points.length} points for better performance...`);
    
    // Simple grid-based clustering
    const clusters = createGridClusters(points, 0.5); // 0.5 degree grid
    performanceMetrics.clusterCount = clusters.length;
    
    console.log(`Created ${clusters.length} clusters from ${points.length} points`);
    
    clusters.forEach(cluster => {
        if (cluster.points.length === 1) {
            // Single point - add normal marker
            const point = cluster.points[0];
            const marker = L.marker([point.lat, point.lng])
                .bindPopup(`<strong>${point.name}</strong><br>${point.description}`)
                .on('click', () => handleMarkerClick(point));
            markersLayer.addLayer(marker);
        } else {
            // Multiple points - add cluster marker
            const centerLat = cluster.points.reduce((sum, p) => sum + p.lat, 0) / cluster.points.length;
            const centerLng = cluster.points.reduce((sum, p) => sum + p.lng, 0) / cluster.points.length;
            
            const clusterIcon = L.divIcon({
                className: 'cluster-marker',
                html: `<div style="background: #ff6b35; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${cluster.points.length}</div>`,
                iconSize: [30, 30]
            });
            
            const clusterMarker = L.marker([centerLat, centerLng], { icon: clusterIcon })
                .bindPopup(createClusterPopup(cluster.points))
                .on('click', () => handleClusterClick(cluster));
            
            markersLayer.addLayer(clusterMarker);
        }
    });
    
    // Fit map to show all clusters
    if (clusters.length > 0) {
        const bounds = L.latLngBounds();
        clusters.forEach(cluster => {
            const centerLat = cluster.points.reduce((sum, p) => sum + p.lat, 0) / cluster.points.length;
            const centerLng = cluster.points.reduce((sum, p) => sum + p.lng, 0) / cluster.points.length;
            bounds.extend([centerLat, centerLng]);
        });
        map.fitBounds(bounds.pad(0.1));
    }
}

// Create grid-based clusters
function createGridClusters(points, gridSize) {
    const clusters = new Map();
    
    points.forEach(point => {
        const gridX = Math.floor(point.lat / gridSize);
        const gridY = Math.floor(point.lng / gridSize);
        const gridKey = `${gridX},${gridY}`;
        
        if (!clusters.has(gridKey)) {
            clusters.set(gridKey, { points: [], gridX, gridY });
        }
        clusters.get(gridKey).points.push(point);
    });
    
    return Array.from(clusters.values());
}

// Create popup content for clusters
function createClusterPopup(points) {
    const maxShow = 5;
    let content = `<div><strong>Cluster (${points.length} points)</strong><br>`;
    
    points.slice(0, maxShow).forEach(point => {
        content += `• ${point.name}<br>`;
    });
    
    if (points.length > maxShow) {
        content += `... and ${points.length - maxShow} more`;
    }
    
    content += '</div>';
    return content;
}

// Handle cluster click - zoom in or show details
function handleClusterClick(cluster) {
    if (map.getZoom() < 10) {
        // Zoom in to cluster
        const centerLat = cluster.points.reduce((sum, p) => sum + p.lat, 0) / cluster.points.length;
        const centerLng = cluster.points.reduce((sum, p) => sum + p.lng, 0) / cluster.points.length;
        map.setView([centerLat, centerLng], Math.min(map.getZoom() + 3, 15));
    } else {
        // Show cluster details
        displayClusterDetails(cluster);
    }
}

// Display cluster details in sidebar
function displayClusterDetails(cluster) {
    const details = {
        title: `Cluster Details (${cluster.points.length} points)`,
        description: `This cluster contains ${cluster.points.length} points in the same geographical area.`,
        image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23ff6b35'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='white' font-size='16'%3ECluster%3C/text%3E%3C/svg%3E",
        data: [
            { property: "Point Count", value: cluster.points.length.toString() },
            { property: "Grid Location", value: `${cluster.gridX}, ${cluster.gridY}` },
            { property: "Sample Points", value: cluster.points.slice(0, 3).map(p => p.name).join(', ') }
        ]
    };
    displayPointDetails(details);
}

async function handleMarkerClick(point) {
    updateStatus("Loading point details...");
    
    try {
        const details = await fetchPointDetails(point.id);
        displayPointDetails(details);
        updateStatus("Point details loaded");
    } catch (error) {
        console.error('Error loading point details:', error);
        updateStatus("Error loading details");
        displayPointDetails({
            title: "Error",
            description: "Failed to load point details",
            image: "",
            data: []
        });
    }
}

function displayPointDetails(details) {
    const detailsContainer = document.getElementById('pointDetails');
    
    let tableHtml = '';
    if (details.data && details.data.length > 0) {
        tableHtml = `
            <table class="detail-table">
                <thead>
                    <tr>
                        <th>Property</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    ${details.data.map(item => `
                        <tr>
                            <td>${item.property}</td>
                            <td>${item.value}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    detailsContainer.innerHTML = `
        <div class="point-detail-item">
            <h4>${details.title}</h4>
            <p>${details.description}</p>
            ${details.image ? `<img src="${details.image}" alt="${details.title}" class="detail-image">` : ''}
            ${tableHtml}
        </div>
    `;
}

// ============================================================================
// NEARBY POINTS FUNCTIONALITY
// ============================================================================

async function displayNearbyPointsDetails(nearbyPoints, center) {
    const detailsContainer = document.getElementById('pointDetails');
    
    if (nearbyPoints.length === 0) {
        detailsContainer.innerHTML = '<p>No nearby points found in the search area.</p>';
        return;
    }
    
    // Update sidebar title to show nearby points count
    const sidebarTitle = document.querySelector('.sidebar h3');
    sidebarTitle.textContent = `Point Details + Nearby (${nearbyPoints.length})`;
    
    // Create a section for nearby points and show loading message
    const nearbySection = document.createElement('div');
    nearbySection.className = 'nearby-points-section';
    nearbySection.innerHTML = `
        <hr style="margin: 1rem 0; border: 1px solid #eee;">
        <h4 style="color: #34495e; margin-bottom: 0.5rem;">🔍 Nearby Points</h4>
        <p>Loading nearby points details...</p>
    `;
    detailsContainer.appendChild(nearbySection);
    
    // Create HTML for all nearby points
    let nearbyHtml = '';
    
    for (const point of nearbyPoints) {
        const distance = Math.round(calculateDistance(center.lat, center.lng, point.lat, point.lng));
        
        try {
            // Fetch detailed information for each point
            const details = await fetchPointDetails(point.id);
            
            let tableHtml = '';
            if (details.data && details.data.length > 0) {
                tableHtml = `
                    <table class="detail-table">
                        <thead>
                            <tr>
                                <th>Property</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${details.data.map(item => `
                                <tr>
                                    <td>${item.property}</td>
                                    <td>${item.value}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
            
            nearbyHtml += `
                <div class="point-detail-item nearby-point-item">
                    <div class="nearby-point-header">
                        <h4>${point.name}</h4>
                        <span class="distance-badge">${distance}km away</span>
                    </div>
                    <p>${details.description}</p>
                    ${details.image ? `<img src="${details.image}" alt="${details.title}" class="detail-image">` : ''}
                    ${tableHtml}
                </div>
            `;
        } catch (error) {
            console.error(`Error loading details for ${point.name}:`, error);
            nearbyHtml += `
                <div class="point-detail-item nearby-point-item">
                    <div class="nearby-point-header">
                        <h4>${point.name}</h4>
                        <span class="distance-badge">${distance}km away</span>
                    </div>
                    <p>${point.description}</p>
                </div>
            `;
        }
    }
    
    // Replace the loading message in the nearby section with the actual content
    nearbySection.innerHTML = `
        <hr style="margin: 1rem 0; border: 1px solid #eee;">
        <h4 style="color: #34495e; margin-bottom: 0.5rem;">🔍 Nearby Points</h4>
        ${nearbyHtml}
    `;
    
    // Reset sidebar title and remove nearby section after 10 seconds (to match map marker clear timing)
    setTimeout(() => {
        const sidebarTitle = document.querySelector('.sidebar h3');
        sidebarTitle.textContent = 'Point Details';
        
        // Remove the nearby section if it exists, but keep any existing point details
        const nearbySection = detailsContainer.querySelector('.nearby-points-section');
        if (nearbySection) {
            nearbySection.remove();
        }
        
        // If no other content exists, show the default message
        if (detailsContainer.innerHTML.trim() === '') {
            detailsContainer.innerHTML = '<p>Click on a point to view details</p>';
        }
    }, 10000);
}

function findNearbyPoints() {
    let center, radius;
    
    if (isLeafletAvailable && map) {
        // Use actual map center and zoom-based radius when map is available
        center = map.getCenter();
        const zoomLevel = map.getZoom();
        const baseRadius = 1000; // km
        radius = baseRadius / Math.pow(2, Math.max(0, zoomLevel - 3));
    } else {
        // Use sample center point and fixed radius for demo in fallback mode
        center = { lat: -37.8136, lng: 144.9631 }; // Melbourne as demo center
        radius = 2000; // 2000km radius for demo to show Melbourne area points
        updateStatus("Demo mode: Finding points within 2000km of Melbourne...");
    }
    
    if (isLeafletAvailable && map) {
        updateStatus(`Finding points within ${Math.round(radius)}km...`);
        // Clear previous nearby markers
        nearbyMarkersLayer.clearLayers();
    }
    
    const nearbyPoints = allPoints.filter(point => {
        const distance = calculateDistance(
            center.lat, center.lng,
            point.lat, point.lng
        );
        return distance <= radius;
    });
    
    // Sort by distance for better user experience
    nearbyPoints.sort((a, b) => {
        const distanceA = calculateDistance(center.lat, center.lng, a.lat, a.lng);
        const distanceB = calculateDistance(center.lat, center.lng, b.lat, b.lng);
        return distanceA - distanceB;
    });
    
    if (isLeafletAvailable && map) {
        // Highlight nearby points on map
        nearbyPoints.forEach(point => {
            const nearbyMarker = L.circleMarker([point.lat, point.lng], {
                radius: 15,
                fillColor: '#ff7800',
                color: '#ff7800',
                weight: 3,
                opacity: 0.7,
                fillOpacity: 0.3
            }).bindPopup(`<strong>Nearby: ${point.name}</strong><br>Distance: ${Math.round(calculateDistance(center.lat, center.lng, point.lat, point.lng))}km`);
            
            nearbyMarkersLayer.addLayer(nearbyMarker);
        });
        
        // Auto-clear nearby markers after 10 seconds
        setTimeout(() => {
            nearbyMarkersLayer.clearLayers();
            updateStatus(`Loaded ${allPoints.length} points`);
        }, 10000);
    }
    
    // Display nearby points information in sidebar
    displayNearbyPointsDetails(nearbyPoints, center);
    
    updateStatus(`Found ${nearbyPoints.length} nearby points`);
}

function showSampleNearbyPoints() {
    updateStatus("Showing sample nearby points data...");
    
    // Sample scenario: searching from London (51.5074, -0.1278) with 3000km radius
    const sampleCenter = { lat: 51.5074, lng: -0.1278, name: "London" };
    const sampleRadius = 3000; // km
    
    // Calculate which cities are within the sample radius
    const nearbyPoints = allPoints.filter(point => {
        const distance = calculateDistance(
            sampleCenter.lat, sampleCenter.lng,
            point.lat, point.lng
        );
        return distance <= sampleRadius;
    }).map(point => {
        const distance = calculateDistance(
            sampleCenter.lat, sampleCenter.lng,
            point.lat, point.lng
        );
        return { ...point, distance: Math.round(distance) };
    }).sort((a, b) => a.distance - b.distance);
    
    // Display sample data in the sidebar
    displaySampleNearbyData(sampleCenter, sampleRadius, nearbyPoints);
    
    updateStatus(`Sample: Found ${nearbyPoints.length} points within ${sampleRadius}km of ${sampleCenter.name}`);
    
    // Auto-clear after 15 seconds to show it's a demo
    setTimeout(() => {
        document.getElementById('pointDetails').innerHTML = '<p>Click on a point to view details</p>';
        updateStatus("Sample data cleared - click a point for details");
    }, 15000);
}

function displaySampleNearbyData(center, radius, nearbyPoints) {
    const detailsContainer = document.getElementById('pointDetails');
    
    let pointsHtml = '';
    if (nearbyPoints.length > 0) {
        pointsHtml = `
            <div class="sample-points-list">
                ${nearbyPoints.map(point => `
                    <div class="sample-point-item" onclick="handleSamplePointClick(${point.id})">
                        <div class="sample-point-header">
                            <strong>${point.name}</strong>
                            <span class="sample-distance">${point.distance}km</span>
                        </div>
                        <div class="sample-point-description">${point.description}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    detailsContainer.innerHTML = `
        <div class="point-detail-item">
            <h4>🔍 Sample Nearby Points Search</h4>
            <p><strong>Search Center:</strong> ${center.name} (${center.lat.toFixed(4)}, ${center.lng.toFixed(4)})</p>
            <p><strong>Search Radius:</strong> ${radius}km</p>
            <p><strong>Results:</strong> ${nearbyPoints.length} points found</p>
            ${pointsHtml}
            <div class="sample-note">
                <em>💡 This is sample data showing how the nearby search works. In normal mode, the search uses your current map view center.</em>
            </div>
        </div>
    `;
}

async function handleSamplePointClick(pointId) {
    updateStatus("Loading sample point details...");
    try {
        const details = await fetchPointDetails(pointId);
        displayPointDetails(details);
        updateStatus("Sample point details loaded");
    } catch (error) {
        console.error('Error loading sample point details:', error);
        updateStatus("Error loading sample details");
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
}

function updateStatus(message) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    
    // Clear status after 3 seconds
    setTimeout(() => {
        if (statusElement.textContent === message) {
            statusElement.textContent = '';
        }
    }, 3000);
}
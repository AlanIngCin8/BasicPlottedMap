# BasicPlottedMap

A web-based map viewing application that displays interactive maps with plotted points, built with vanilla JavaScript and HTML5 Canvas.

## Features

### 🗺️ Interactive Map Display
- **OpenStreetMap Integration**: Real map tiles using Leaflet.js
- **Street View**: Standard OpenStreetMap tiles
- **Satellite View**: High-resolution satellite imagery from Esri
- **Professional map controls**: Zoom, pan, and layer switching
- **Fallback mode**: Graceful degradation when external resources are unavailable

### 📍 Point Plotting & Interaction
- **Global city markers**: 20 major cities plotted worldwide (including Melbourne area points)
- **Click to view details**: Interactive markers showing detailed information
- **Hover tooltips**: City names displayed on mouse hover
- **Mock API simulation**: Realistic API delay simulation for data fetching

### 📊 Detailed Point Information
- **Rich data display**: Each point shows comprehensive information
- **HTML table format**: Structured data including population, area, founding date, time zone
- **Sample images**: SVG placeholder images for each location
- **Responsive sidebar**: Clean, organized information panel

### 🔍 Nearby Points Feature
- **Proximity search**: Find points within a specified radius
- **Visual highlighting**: Nearby points highlighted in orange with pulse animation
- **Distance calculation**: Uses Haversine formula for accurate geo-distance
- **Auto-clear**: Highlighting automatically clears after 10 seconds

### 🎨 User Interface
- **Modern design**: Clean, professional interface
- **Responsive layout**: Works on desktop and mobile devices
- **Status feedback**: Real-time status updates for user actions
- **Smooth animations**: Hover effects and transitions

## Technical Implementation

### Architecture
- **Frontend**: HTML5, CSS3, and vanilla JavaScript with Leaflet.js
- **Map Rendering**: OpenStreetMap tiles via Leaflet.js library
- **Mock APIs**: Simulated backend with realistic data and delays
- **Graceful degradation**: Fallback mode when external resources are blocked

### Data Sources
- **Mock location API**: Returns 20 global cities with coordinates and realistic 500ms delay simulation
- **Mock details API**: Provides detailed information for each city with 300ms delay simulation  
- **SVG placeholder images**: Embedded data URIs for offline functionality
- **GitHub Pages Compatible**: Pure client-side implementation, no server dependencies

## Getting Started

### 🌐 Live Demo
**[View the live application on GitHub Pages](https://alaningcin8.github.io/BasicPlottedMap/)**

The application is automatically deployed and available online. No installation required!

### 🛠️ Local Development

#### Prerequisites
- Modern web browser with HTML5 support
- Internet connection (for OpenStreetMap tiles)
- Python 3.x (for local development server)

#### Installation & Running

1. **Clone the repository**
   ```bash
   git clone https://github.com/AlanIngCin8/BasicPlottedMap.git
   cd BasicPlottedMap
   ```

2. **Option A: Local development server**
   ```bash
   python3 server.py
   # Open http://localhost:8000
   ```

3. **Option B: Direct browser access**
   ```bash
   # Simply open index.html in your web browser
   open index.html
   ```

### 🚀 Deployment
The application automatically deploys to GitHub Pages when changes are pushed to the main branch using GitHub Actions.

### File Structure
```
BasicPlottedMap/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions deployment workflow
├── index.html              # Main HTML structure
├── styles.css              # Styling and responsive design
├── script.js               # Core application logic and map implementation
├── server.py               # Simple HTTP server for local development
└── README.md               # This file
```

## Usage

### Basic Navigation
1. **View the map**: Points are automatically loaded and displayed
2. **Switch views**: Click "Street View" or "Satellite View" buttons
3. **Zoom**: Use mouse wheel to zoom in/out
4. **Hover**: Move mouse over markers to see city names

### Interacting with Points
1. **Click markers**: Click any red marker to view detailed information
2. **View details**: Information appears in the right sidebar including:
   - City description
   - Statistical data table
   - Representative image

### Finding Nearby Points
1. **Click "Find Nearby Points"**: Searches within 2000km radius of current map center
2. **View results**: Nearby points highlighted in orange with pulse animation
3. **Automatic reset**: Highlighting clears after 10 seconds

## Cities Included

The application includes 20 global locations:

### Major International Cities
- 🇺🇸 New York City
- 🇬🇧 London
- 🇯🇵 Tokyo
- 🇦🇺 Sydney
- 🇫🇷 Paris
- 🇪🇬 Cairo
- 🇮🇳 Mumbai
- 🇧🇷 São Paulo
- 🇿🇦 Cape Town
- 🇨🇦 Vancouver

### Melbourne Metropolitan Area (for testing nearby functionality)
- 🇦🇺 Melbourne (Cultural capital)
- 🇦🇺 Geelong (Port city)
- 🇦🇺 Ballarat (Historic gold rush city)
- 🇦🇺 Bendigo (Regional city)
- 🇦🇺 Mornington (Coastal town)
- 🇦🇺 Dandenong Ranges (National park)
- 🇦🇺 Frankston (Bayside suburb)
- 🇦🇺 St Kilda (Famous beachside suburb)
- 🇦🇺 Richmond (Inner-city suburb)
- 🇦🇺 Footscray (Multicultural suburb)

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

## Future Enhancements

- GPS location support
- Custom marker addition
- Export/import functionality
- Advanced filtering options
- Real-time data integration

## License

This project is open source and available under the MIT License.
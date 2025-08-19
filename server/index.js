const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Extended mock data for DDoS attacks with various locations
const mockAttacks = [
  { source: { lat: 34.0522, lon: -118.2437 }, target: { lat: 35.6895, lon: 139.6917 } }, // Los Angeles to Tokyo
  { source: { lat: 51.5074, lon: -0.1278 }, target: { lat: 48.8566, lon: 2.3522 } },    // London to Paris
  { source: { lat: -33.8688, lon: 151.2093 }, target: { lat: -37.8136, lon: 144.9631 } }, // Sydney to Melbourne
  { source: { lat: 40.7128, lon: -74.0060 }, target: { lat: 19.0760, lon: 72.8777 } },   // New York to Mumbai
  { source: { lat: 35.6762, lon: 139.6503 }, target: { lat: 55.7558, lon: 37.6173 } },   // Tokyo to Moscow
  { source: { lat: 55.7558, lon: 37.6173 }, target: { lat: 37.7749, lon: -122.4194 } },  // Moscow to San Francisco
  { source: { lat: -33.8688, lon: 151.2093 }, target: { lat: 40.7128, lon: -74.0060 } }, // Sydney to New York
  { source: { lat: 48.8566, lon: 2.3522 }, target: { lat: -33.8688, lon: 151.2093 } },   // Paris to Sydney
  { source: { lat: 19.0760, lon: 72.8777 }, target: { lat: 51.5074, lon: -0.1278 } },    // Mumbai to London
  { source: { lat: 37.7749, lon: -122.4194 }, target: { lat: 35.6895, lon: 139.6917 } }, // San Francisco to Tokyo
  { source: { lat: 51.5074, lon: -0.1278 }, target: { lat: -33.8688, lon: 151.2093 } },  // London to Sydney
  { source: { lat: 35.6895, lon: 139.6917 }, target: { lat: 40.7128, lon: -74.0060 } },  // Tokyo to New York
  { source: { lat: -37.8136, lon: 144.9631 }, target: { lat: 55.7558, lon: 37.6173 } },  // Melbourne to Moscow
  { source: { lat: 48.8566, lon: 2.3522 }, target: { lat: 37.7749, lon: -122.4194 } },   // Paris to San Francisco
  { source: { lat: 19.0760, lon: 72.8777 }, target: { lat: 34.0522, lon: -118.2437 } }   // Mumbai to Los Angeles
];

app.get('/api/attacks', (req, res) => {
  // Return all mock attacks
  res.json(mockAttacks);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
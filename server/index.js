const express = require('express');
const cors    = require('cors');
const axios   = require('axios');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── In-memory cache ───────────────────────────────────────────────────────────
const cache = new Map();

function getCache(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
    return entry.data;
}

function setCache(key, data, ttlMs) {
    cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// ── Mock data (used when Cloudflare API is unavailable) ───────────────────────
const mockAttacks = [
    { source: { lat: 34.0522, lon: -118.2437 }, target: { lat: 35.6895, lon: 139.6917 } },
    { source: { lat: 51.5074, lon:  -0.1278  }, target: { lat: 48.8566, lon:   2.3522 } },
    { source: { lat:-33.8688, lon: 151.2093  }, target: { lat:-37.8136, lon: 144.9631 } },
    { source: { lat: 40.7128, lon: -74.0060  }, target: { lat: 19.0760, lon:  72.8777 } },
    { source: { lat: 35.6762, lon: 139.6503  }, target: { lat: 55.7558, lon:  37.6173 } },
    { source: { lat: 55.7558, lon:  37.6173  }, target: { lat: 37.7749, lon:-122.4194 } },
    { source: { lat:-33.8688, lon: 151.2093  }, target: { lat: 40.7128, lon: -74.0060 } },
    { source: { lat: 48.8566, lon:   2.3522  }, target: { lat:-33.8688, lon: 151.2093 } },
    { source: { lat: 19.0760, lon:  72.8777  }, target: { lat: 51.5074, lon:  -0.1278 } },
    { source: { lat: 37.7749, lon:-122.4194  }, target: { lat: 35.6895, lon: 139.6917 } },
    { source: { lat: 51.5074, lon:  -0.1278  }, target: { lat:-33.8688, lon: 151.2093 } },
    { source: { lat: 35.6895, lon: 139.6917  }, target: { lat: 40.7128, lon: -74.0060 } },
    { source: { lat:-37.8136, lon: 144.9631  }, target: { lat: 55.7558, lon:  37.6173 } },
    { source: { lat: 48.8566, lon:   2.3522  }, target: { lat: 37.7749, lon:-122.4194 } },
    { source: { lat: 19.0760, lon:  72.8777  }, target: { lat: 34.0522, lon:-118.2437 } },
];

const CF_HEADERS = { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` };

// ── Routes ────────────────────────────────────────────────────────────────────

// Static mock attacks (always available)
app.get('/api/attacks', (_req, res) => {
    res.json(mockAttacks);
});

// Live Cloudflare DDoS attack data (cached 30 s)
app.get('/api/cloudflare-attacks', async (_req, res) => {
    const CACHE_KEY = 'cf-attacks';
    const cached = getCache(CACHE_KEY);
    if (cached) return res.json(cached);

    try {
        const response = await axios.get(
            'https://api.cloudflare.com/client/v4/radar/attacks/layer3/top/attacks?dateRange=7d&format=JSON',
            { headers: CF_HEADERS, timeout: 8000 }
        );
        setCache(CACHE_KEY, response.data, 30_000);
        res.json(response.data);
    } catch (err) {
        const detail = err.response?.data || err.message;
        console.error('Cloudflare attacks error:', detail);
        res.status(502).json({ error: 'Failed to fetch Cloudflare attack data', detail });
    }
});

// Country/location lookup (cached 1 hour – data rarely changes)
app.get('/api/locations', async (_req, res) => {
    const CACHE_KEY = 'cf-locations';
    const cached = getCache(CACHE_KEY);
    if (cached) return res.json(cached);

    try {
        const response = await axios.get(
            'https://api.cloudflare.com/client/v4/radar/entities/locations?format=JSON',
            { headers: CF_HEADERS, timeout: 8000 }
        );
        setCache(CACHE_KEY, response.data, 3_600_000);
        res.json(response.data);
    } catch (err) {
        const detail = err.response?.data || err.message;
        console.error('Cloudflare locations error:', detail);
        res.status(502).json({ error: 'Failed to fetch location data', detail });
    }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

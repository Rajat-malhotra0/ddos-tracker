import React, { useState, useEffect, useRef, useCallback } from "react";
import Globe from "react-globe.gl";

const API_BASE = "http://localhost:3001";

const ARC_COLORS = ["rgba(255,60,60,0.9)", "rgba(255,180,0,0.6)", "rgba(0,200,255,0.9)"];
const SOURCE_COLOR = "#ff3333";
const TARGET_COLOR = "#00e5ff";
const SOURCE_RING  = "#ff3333";
const TARGET_RING  = "#00ccff";

const World = ({ onStatsUpdate }) => {
    const globeRef  = useRef();
    const [arcsData, setArcsData]   = useState([]);
    const [ringsData, setRingsData] = useState([]);
    const [locations, setLocations] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dimensions, setDimensions] = useState({
        width:  window.innerWidth,
        height: window.innerHeight,
    });

    // Keep globe sized to window
    useEffect(() => {
        const onResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Enable auto-rotation once the globe is ready
    useEffect(() => {
        if (!globeRef.current) return;
        const controls = globeRef.current.controls();
        controls.autoRotate      = true;
        controls.autoRotateSpeed = 0.4;
        controls.enableZoom      = true;
        // Start slightly tilted for a nicer angle
        globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.2 }, 1000);
    }, [isLoading]); // re-run after globe mounts (loading → false)

    // --- Fetch locations once ---
    useEffect(() => {
        fetch(`${API_BASE}/api/locations`)
            .then(r => (r.ok ? r.json() : Promise.reject(r)))
            .then(data => {
                if (data.result?.locations) {
                    const map = new Map(data.result.locations.map(l => [l.alpha2, l]));
                    setLocations(map);
                }
            })
            .catch(err => {
                console.error("Locations fetch failed:", err);
                // Still remove the loading screen even if locations fail
                setIsLoading(false);
            });
    }, []);

    // --- Load mock data as fallback ---
    const loadMockData = useCallback(() => {
        fetch(`${API_BASE}/api/attacks`)
            .then(r => r.json())
            .then(mockData => {
                const arcs = mockData.map(a => ({
                    startLat: a.source.lat,
                    startLng: a.source.lon,
                    endLat:   a.target.lat,
                    endLng:   a.target.lon,
                    originCountry: "??",
                    targetCountry: "??",
                    color: ARC_COLORS,
                }));
                setArcsData(arcs.slice(-20));
                setIsLoading(false);
            })
            .catch(console.error);
    }, []);

    // --- Fetch live attacks ---
    const fetchAttacks = useCallback(() => {
        if (!locations) return;

        fetch(`${API_BASE}/api/cloudflare-attacks`)
            .then(r => (r.ok ? r.json() : Promise.reject(r)))
            .then(data => {
                if (!data.result?.top_0) return;

                const newArcs = data.result.top_0.map(attack => {
                    const start = locations.get(attack.origin_country_alpha2);
                    const end   = locations.get(attack.target_country_alpha2);
                    if (!start || !end) return null;
                    return {
                        startLat:      start.latitude,
                        startLng:      start.longitude,
                        endLat:        end.latitude,
                        endLng:        end.longitude,
                        originCountry: attack.origin_country_alpha2,
                        targetCountry: attack.target_country_alpha2,
                        color:         ARC_COLORS,
                    };
                }).filter(Boolean);

                if (newArcs.length === 0) return;

                // Emit rings at source & target
                const newRings = newArcs.flatMap(arc => [
                    { lat: arc.startLat, lng: arc.startLng, maxR: 3, propagationSpeed: 3, repeatPeriod: 1200, color: () => SOURCE_RING },
                    { lat: arc.endLat,   lng: arc.endLng,   maxR: 3, propagationSpeed: 3, repeatPeriod: 1200, color: () => TARGET_RING },
                ]);
                setRingsData(prev => [...prev, ...newRings].slice(-60));

                setArcsData(prev => {
                    const updated = [...prev, ...newArcs].slice(-25);

                    // Compute stats for panels
                    if (onStatsUpdate) {
                        const originCounts = {};
                        const targetCounts = {};
                        updated.forEach(a => {
                            originCounts[a.originCountry] = (originCounts[a.originCountry] || 0) + 1;
                            targetCounts[a.targetCountry] = (targetCounts[a.targetCountry] || 0) + 1;
                        });
                        const topOrigin = Object.entries(originCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
                        const topTarget = Object.entries(targetCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
                        onStatsUpdate({ topOrigin, topTarget, total: updated.length });
                    }

                    return updated;
                });

                setIsLoading(false);
            })
            .catch(err => {
                console.warn("Cloudflare API unavailable, using mock data:", err);
                loadMockData();
            });
    }, [locations, onStatsUpdate, loadMockData]);

    useEffect(() => {
        if (!locations) return;
        fetchAttacks();
        const id = setInterval(fetchAttacks, 5000);
        return () => clearInterval(id);
    }, [locations, fetchAttacks]);

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
                <p className="loading-text">Initializing Global Tracker…</p>
            </div>
        );
    }

    const pointsData = [
        ...arcsData.map(a => ({ lat: a.startLat, lng: a.startLng, size: 0.4,  color: SOURCE_COLOR })),
        ...arcsData.map(a => ({ lat: a.endLat,   lng: a.endLng,   size: 0.28, color: TARGET_COLOR })),
    ];

    return (
        <Globe
            ref={globeRef}
            width={dimensions.width}
            height={dimensions.height}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundColor="rgba(0,0,0,0)"
            atmosphereColor="#1a6fff"
            atmosphereAltitude={0.18}
            // Arcs
            arcsData={arcsData}
            arcColor="color"
            arcDashLength={0.4}
            arcDashGap={0.15}
            arcDashAnimateTime={1200}
            arcStroke={1.0}
            arcCurveResolution={64}
            arcAltitudeAutoScale={0.45}
            // Points
            pointsData={pointsData}
            pointColor="color"
            pointAltitude={0.005}
            pointRadius="size"
            pointsMerge={false}
            // Rings / pulses
            ringsData={ringsData}
            ringColor="color"
            ringMaxRadius="maxR"
            ringPropagationSpeed="propagationSpeed"
            ringRepeatPeriod="repeatPeriod"
        />
    );
};

export default World;
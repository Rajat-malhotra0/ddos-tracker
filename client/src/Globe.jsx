import React, { useState, useEffect } from "react";
import Globe from "react-globe.gl";

const World = () => {
    const [arcsData, setArcsData] = useState([]);

    // Generate realistic attack arcs
    useEffect(() => {
        const interval = setInterval(() => {
            // Realistic DDoS attack data between major cities
            const attacks = [
                // US to Europe
                { startLat: 37.7749, startLng: -122.4194, endLat: 51.5074, endLng: -0.1278 }, // San Francisco to London
                { startLat: 40.7128, startLng: -74.0060, endLat: 48.8566, endLng: 2.3522 },  // New York to Paris
                // Asia to US
                { startLat: 35.6762, startLng: 139.6503, endLat: 34.0522, endLng: -118.2437 }, // Tokyo to Los Angeles
                { startLat: 31.2304, startLng: 121.4737, endLat: 37.7749, endLng: -122.4194 }, // Shanghai to San Francisco
                // Europe to Asia
                { startLat: 51.5074, startLng: -0.1278, endLat: 55.7558, endLng: 37.6173 },  // London to Moscow
                { startLat: 48.8566, startLng: 2.3522, endLat: 52.5200, endLng: 13.4050 },     // Paris to Berlin to Beijing
                // Asia to Asia
                { startLat: 35.6762, startLng: 139.6503, endLat: 37.5665, endLng: 126.9780 }, // Tokyo to Seoul
                { startLat: 28.6139, startLng: 77.2090, endLat: 31.2304, endLng: 121.4737 },  // Delhi to Shanghai
                // Australia to US
                { startLat: -33.8688, startLng: 151.2093, endLat: 34.0522, endLng: -118.2437 }, // Sydney to Los Angeles
                // US to Asia
                { startLat: 40.7128, startLng: -74.0060, endLat: 35.6762, endLng: 139.6503 }  // New York to Tokyo
            ];

            const randomAttack = attacks[Math.floor(Math.random() * attacks.length)];

            const newArc = {
                startLat: randomAttack.startLat,
                startLng: randomAttack.startLng,
                endLat: randomAttack.endLat,
                endLng: randomAttack.endLng,
                color: `rgba(0, 255, 255, 0.8)`, // Bright cyan for DDoS attacks
            };

            setArcsData((prev) => [...prev, newArc].slice(-15)); // Keep last 15 arcs
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    return (
        <Globe
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            backgroundColor="rgba(0,0,0,0)"
            // Attack Arcs
            arcsData={arcsData}
            arcColor={"color"}
            arcDashLength={0.25}
            arcDashGap={0.1}
            arcDashAnimateTime={2000}
            arcStroke={1.5}
            arcCurveResolution={64}
            // Points for attack sources
            pointsData={arcsData.map(arc => ({
                lat: arc.startLat,
                lng: arc.startLng,
                size: 0.1,
                color: "#ff5555"
            }))}
            pointColor="color"
            pointAltitude={0.02}
            // Labels
            labelsData={arcsData.length > 0 ? [{
                lat: arcsData[arcsData.length - 1].startLat,
                lng: arcsData[arcsData.length - 1].startLng,
                text: "DDoS Attack Source",
                color: "#ff5555",
                size: 1.5
            }] : []}
            labelColor="color"
            labelSize={1.5}
            labelText="text"
            labelDotRadius={0.5}
        />
    );
};

export default World;
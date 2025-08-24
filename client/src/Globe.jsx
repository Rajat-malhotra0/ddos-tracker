import React, { useState, useEffect } from "react";
import Globe from "react-globe.gl";

const World = () => {
    const [arcsData, setArcsData] = useState([]);
    const [locations, setLocations] = useState(null);

    useEffect(() => {
        // Fetch locations data
        fetch('http://localhost:3001/api/locations')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                if (data.result && data.result.locations) {
                    console.log('Locations data:', data.result.locations);
                    const locationsMap = new Map(data.result.locations.map(loc => [loc.alpha2, loc]));
                    setLocations(locationsMap);
                }
            })
            .catch(error => console.error('Error fetching locations:', error));
    }, []);

    useEffect(() => {
        if (!locations) return;

        const interval = setInterval(() => {
            fetch('http://localhost:3001/api/cloudflare-attacks')
                .then(res => {
                    if (!res.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return res.json();
                })
                .then(data => {
                    if (data.result && data.result.top_0) {
                        console.log('Attacks data:', data.result.top_0);
                        const newArcs = data.result.top_0.map(attack => {
                            const start = locations.get(attack.origin_country_alpha2);
                            const end = locations.get(attack.target_country_alpha2);

                            if (start && end) {
                                return {
                                    startLat: start.latitude,
                                    startLng: start.longitude,
                                    endLat: end.latitude,
                                    endLng: end.longitude,
                                    color: `rgba(0, 255, 255, 0.8)`,
                                };
                            }
                            return null;
                        }).filter(Boolean);

                        console.log('New arcs:', newArcs);
                        setArcsData(prev => [...prev, ...newArcs].slice(-15));
                    }
                })
                .catch(error => console.error('Error fetching attacks:', error));
        }, 5000); // Fetch new data every 5 seconds

        return () => clearInterval(interval);
    }, [locations]);

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
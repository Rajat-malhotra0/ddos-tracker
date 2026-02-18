import React, { useState, useEffect } from 'react';
import World from './Globe';
import './App.css';

const COUNTRY_NAMES = {
    US: "United States", CN: "China", RU: "Russia", DE: "Germany",
    GB: "United Kingdom", FR: "France", JP: "Japan", KR: "South Korea",
    IN: "India", BR: "Brazil", AU: "Australia", CA: "Canada",
    NL: "Netherlands", SE: "Sweden", SG: "Singapore", UA: "Ukraine",
    IR: "Iran", TR: "Turkey", ID: "Indonesia", MX: "Mexico",
};

const countryLabel = code => COUNTRY_NAMES[code] || code;

function App() {
    const [stats, setStats] = useState({ topOrigin: [], topTarget: [], total: 0 });
    const [tick, setTick] = useState(0);   // drives the clock

    // Live clock
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(id);
    }, []);

    const now = new Date();
    const timeStr = now.toUTCString().replace('GMT', 'UTC');

    return (
        <div className="App">
            {/* ── Header ── */}
            <header className="app-header">
                <div className="header-brand">
                    <span className="brand-icon">⬡</span>
                    <span className="brand-name">DDOS<span className="brand-accent">TRACKER</span></span>
                </div>
                <div className="header-center">
                    <div className="live-badge">
                        <span className="live-dot" />
                        LIVE
                    </div>
                    <span className="header-subtitle">Global Layer‑3 Threat Monitor</span>
                </div>
                <div className="header-clock">{timeStr}</div>
            </header>

            {/* ── Globe ── */}
            <div className="globe-container">
                <World onStatsUpdate={setStats} />
            </div>

            {/* ── Left Panel – Top Attackers ── */}
            <aside className="stats-panel panel-left">
                <div className="panel-header">
                    <span className="panel-dot red" />
                    <h3 className="panel-title">Top Attackers</h3>
                </div>
                {stats.topOrigin.length > 0 ? (
                    <ul className="stats-list">
                        {stats.topOrigin.map(([code, count], i) => (
                            <li key={code} className="stats-item">
                                <span className="rank">#{i + 1}</span>
                                <span className="country">{countryLabel(code)}</span>
                                <div className="bar-track">
                                    <div
                                        className="bar-fill red"
                                        style={{ width: `${(count / stats.topOrigin[0][1]) * 100}%` }}
                                    />
                                </div>
                                <span className="hit-count">{count}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-data">Awaiting data…</p>
                )}
            </aside>

            {/* ── Right Panel – Top Targets ── */}
            <aside className="stats-panel panel-right">
                <div className="panel-header">
                    <span className="panel-dot cyan" />
                    <h3 className="panel-title">Top Targets</h3>
                </div>
                {stats.topTarget.length > 0 ? (
                    <ul className="stats-list">
                        {stats.topTarget.map(([code, count], i) => (
                            <li key={code} className="stats-item">
                                <span className="rank">#{i + 1}</span>
                                <span className="country">{countryLabel(code)}</span>
                                <div className="bar-track">
                                    <div
                                        className="bar-fill cyan"
                                        style={{ width: `${(count / stats.topTarget[0][1]) * 100}%` }}
                                    />
                                </div>
                                <span className="hit-count">{count}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-data">Awaiting data…</p>
                )}
            </aside>

            {/* ── Legend ── */}
            <div className="legend">
                <div className="legend-item">
                    <span className="legend-swatch red" />
                    <span>Attack Origin</span>
                </div>
                <div className="legend-item">
                    <span className="legend-swatch cyan" />
                    <span>Attack Target</span>
                </div>
                <div className="legend-item legend-total">
                    <span className="legend-total-val">{stats.total}</span>
                    <span>Tracked Arcs</span>
                </div>
            </div>
        </div>
    );
}

export default App;

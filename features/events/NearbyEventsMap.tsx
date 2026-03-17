"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";

// Fix for default marker icon in leaflet with Next.js
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Pulsing user-location marker
const UserIcon = L.divIcon({
    className: "",
    html: `<div style="
        width: 18px; height: 18px;
        background: #818cf8;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 12px rgba(129,140,248,0.7), 0 0 24px rgba(129,140,248,0.3);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});

export interface NearbyEvent {
    id: string;
    title: string;
    date: string;
    location: string;
    latitude: number;
    longitude: number;
    category?: string;
    imageUrl?: string;
}

interface NearbyEventsMapProps {
    events: NearbyEvent[];
    center: { lat: number; lng: number };
    radiusKm: number;
}

// Sub-component to re-center and re-zoom the map when center/radius changes
function MapUpdater({ center, radiusKm }: { center: { lat: number; lng: number }; radiusKm: number }) {
    const map = useMap();

    useEffect(() => {
        // Calculate a zoom level from the radius
        // Approximate: zoom ≈ 14 - log2(radiusKm / 2)
        const zoom = Math.max(8, Math.min(14, Math.round(14 - Math.log2(radiusKm / 2))));
        map.flyTo([center.lat, center.lng], zoom, { duration: 0.8 });
    }, [center.lat, center.lng, radiusKm, map]);

    return null;
}

export default function NearbyEventsMap({ events, center, radiusKm }: NearbyEventsMapProps) {
    return (
        <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-white/10 relative z-0">
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={12}
                scrollWheelZoom={true}
                className="h-full w-full z-0"
                style={{ background: "#111" }}
            >
                {/* Dark-style tile layer */}
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <MapUpdater center={center} radiusKm={radiusKm} />

                {/* User location marker */}
                <Marker position={[center.lat, center.lng]} icon={UserIcon}>
                    <Popup>
                        <div style={{ textAlign: "center", fontFamily: "sans-serif" }}>
                            <strong>📍 You are here</strong>
                        </div>
                    </Popup>
                </Marker>

                {/* Radius circle */}
                <Circle
                    center={[center.lat, center.lng]}
                    radius={radiusKm * 1000}
                    pathOptions={{
                        color: "#818cf8",
                        fillColor: "#818cf8",
                        fillOpacity: 0.06,
                        weight: 1.5,
                        dashArray: "6, 6",
                    }}
                />

                {/* Event markers */}
                {events.map((event) => (
                    <Marker
                        key={event.id}
                        position={[event.latitude, event.longitude]}
                    >
                        <Popup>
                            <div style={{ fontFamily: "sans-serif", minWidth: 180 }}>
                                <strong style={{ fontSize: 14 }}>{event.title}</strong>
                                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                                    📅 {event.date}
                                </div>
                                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                                    📍 {event.location}
                                </div>
                                <a
                                    href={`/events/${event.id}`}
                                    style={{
                                        display: "inline-block",
                                        marginTop: 8,
                                        padding: "4px 12px",
                                        background: "#7c3aed",
                                        color: "white",
                                        borderRadius: 8,
                                        fontSize: 12,
                                        textDecoration: "none",
                                        fontWeight: 600,
                                    }}
                                >
                                    View Event →
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

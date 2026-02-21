"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in leaflet with Next.js
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
    onLocationSelect: (lat: number, lng: number, address?: string) => void;
    searchAddress?: string; // New prop for forward geocoding
}

function LocationMarker({ onLocationSelect, searchAddress }: MapComponentProps) {
    const [position, setPosition] = useState<L.LatLng | null>(null);

    const map = useMapEvents({
        async click(e) {
            setPosition(e.latlng);

            // Reverse Geocoding via Nominatim
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}&zoom=18&addressdetails=1`);
                const data = await res.json();

                let locationName = "Unknown Location";
                if (data && data.display_name) {
                    locationName = data.display_name;
                }

                onLocationSelect(e.latlng.lat, e.latlng.lng, locationName);
            } catch (err) {
                console.error("Geocoding failed:", err);
                onLocationSelect(e.latlng.lat, e.latlng.lng);
            }
        },
    });

    // Handle Forward Geocoding (Address -> Lat/Lng) when searchAddress prop changes
    useEffect(() => {
        if (!searchAddress || searchAddress.trim().length < 5) return; // Prevent searching overly short generic strings

        const geocodeAddress = async () => {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=1`);
                const data = await res.json();

                if (data && data.length > 0) {
                    const newLat = parseFloat(data[0].lat);
                    const newLng = parseFloat(data[0].lon);
                    const newPos = new L.LatLng(newLat, newLng);

                    setPosition(newPos);
                    map.flyTo(newPos, 14); // Smoothly fly the map to the new location
                    onLocationSelect(newLat, newLng); // Don't pass the address back to avoid circular dependency
                }
            } catch (err) {
                console.error("Forward Geocoding failed:", err);
            }
        };

        // Debounce the call so it doesn't spam the API while typing
        const timeoutId = setTimeout(geocodeAddress, 1500);
        return () => clearTimeout(timeoutId);
    }, [searchAddress, map]); // Removed onLocationSelect from dep array to avoid infinite loops

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

export default function MapComponent({ onLocationSelect, searchAddress }: MapComponentProps) {
    // Default to a generic world view (or a specific city if desired)
    const defaultCenter: L.LatLngExpression = [37.7749, -122.4194]; // SF

    return (
        <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-white/10 z-0 relative">
            <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={false} className="h-full w-full z-0">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker onLocationSelect={onLocationSelect} searchAddress={searchAddress} />
            </MapContainer>
        </div>
    );
}

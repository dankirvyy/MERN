import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// --- Fix for React-Leaflet icons ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;
// --- End of icon fix ---

// This component takes props to be reusable
function LocationMap({ lat, lng, popupText }) {
    const position = [lat, lng];

    return (
        <MapContainer center={position} zoom={13} scrollWheelZoom={false} className="h-96 w-full rounded-lg shadow-md">
            <TileLayer
                attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
                <Popup>
                    <b>{popupText}</b>
                </Popup>
            </Marker>
        </MapContainer>
    );
}

export default LocationMap;
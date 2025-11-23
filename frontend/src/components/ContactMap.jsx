import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// --- This is a common fix for a bug with React-Leaflet icons ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41] // Manually set anchor point
});

L.Marker.prototype.options.icon = DefaultIcon;
// --- End of icon fix ---

function ContactMap() {
    // Coordinates from your contact.php file
    const position = [13.4146, 121.1812];

    return (
        // Set the height just like in your PHP file (h-96)
        <MapContainer center={position} zoom={14} scrollWheelZoom={false} className="h-96 w-full rounded-lg shadow-md" style={{ zIndex: 0 }}>
            <TileLayer
                attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
                <Popup>
                    <b>Visit Mindoro Office</b><br />Calapan City
                </Popup>
            </Marker>
        </MapContainer>
    );
}

export default ContactMap;
import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

// Replace with your Barangay's actual coordinates
const center = {
  lat: 14.5995,  // Example: Manila coordinates
  lng: 120.9842
};

const BrgyMap = () => {
  return (
    <LoadScript
      googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY" // Replace with your actual API key
      loadingElement={<div className="loading-map">Loading Map...</div>}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        }}
      >
        <Marker 
          position={center}
          icon={{
            url: "/logo.png", // Path to your barangay logo
            scaledSize: new window.google.maps.Size(40, 40)
          }}
        />
      </GoogleMap>
    </LoadScript>
  );
};

export default BrgyMap;
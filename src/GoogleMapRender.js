import React, { useMemo } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";

const GoogleMapRender = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, // Replace with your API key
  });

  const center = useMemo(() => ({ lat: 44, lng: -80 }), []);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="map-container"> {/* Add your CSS class here */}
      <GoogleMap zoom={17} center={center}>
        <Marker position={center} />
      </GoogleMap>
    </div>
  );
};

export default GoogleMapRender;
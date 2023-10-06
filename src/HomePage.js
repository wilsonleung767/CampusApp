
import React, { useMemo,useState } from "react";
import { GoogleMap, useLoadScript, Marker, MarkerF } from "@react-google-maps/api";
import './HomePage.css'; // Import your CSS file for styling
import ToiletLayer from './ToiletLayer';

const HomePage = () => {
    const [showToiletLayer, setShowToiletLayer] = useState(false);
    console.log(showToiletLayer)
    const [originalZoom, setOriginalZoom] = useState(15.1); // Store the original zoom level
    const center = useMemo(() => ({ lat: 22.418426709637526, lng: 114.20771628364456 }), []);
    
    const mapOptions = [
        {
            streetViewControl: false,
        }
    ]

    // toilet Layer
    const toiletMarkers = [
        { lat: 22.418513526569456, lng: 114.20523001796764, name: "Toilet 1" },
        { lat: 22.418023226021322, lng: 114.20793097185044, name: "Toilet 2" },
        // Add more toilet marker data as needed
      ];
    // Function to render toilet markers
    const renderToiletMarkers = () => {
        if (!showToiletLayer) return null;
  
        return toiletMarkers.map((marker, index) => (
          <MarkerF
            key={index}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.name}
          />
        ));
      };
    
    //   
    function Map() {
        return (
            <GoogleMap zoom={showToiletLayer ? originalZoom : 15.1} // Use originalZoom when toilet layer is off
                       center={center}                mapContainerClassName="map-container">
                  {renderToiletMarkers()} {/* Render toilet markers */}      
            </GoogleMap>
        );
    }

  const { isLoaded } = useLoadScript({
     googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, // Replace with your API key
  });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="home-page">
      <main>
        <section className="map-section">
        <button onClick={() => {
            setShowToiletLayer(!showToiletLayer);
            if (!showToiletLayer) {
              setOriginalZoom(15.1); // Set originalZoom when toilet layer is turned on
            }
          }}>
            Toggle Toilet Layer
          </button>
            <Map />
        </section>
      </main>

      <footer>
        <p>Copyright &copy; 2023 My Website</p>
      </footer>
    </div>
  );
};

export default HomePage;
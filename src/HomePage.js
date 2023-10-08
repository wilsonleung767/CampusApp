
import React, { useMemo,useState, useEffect, useRef , useLayoutEffect} from "react";
import { GoogleMap, useLoadScript,  MarkerF,  LoadScript, Autocomplete, DirectionsRenderer,InfoWindow} from "@react-google-maps/api";
// import {Box,Button,ButtonGroup,Flex,HStack,IconButton,Input,SkeletonText,Text} from '@chakra-ui/react'
import { Button, IconButton, Box, TextField, Typography, ButtonGroup , InputAdornment} from "@mui/material";
import LocationPicker from "location-picker";
import { FaLocationArrow, FaTimes } from 'react-icons/fa'
import {FaLocationCrosshairs} from 'react-icons/fa6'
// import InfoWindowComponent from "./InfoWindowCompoent";
// import './HomePage.css'; // Import your CSS file for styling


const HomePage = () => {
  
  const [showToiletLayer, setShowToiletLayer] = useState(false);
  const center = useMemo(() => ({ lat: 22.418426709637526, lng: 114.20771628364456 }), []);
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  
  const google = window.google;
  const [destination, setDestination] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [origin, setOrigin] = useState('');
  const [originName, setOriginName] = useState('');

  // Info Window
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isInfoWindowVisible, setIsInfoWindowVisible] = useState(false);

  const [map, setMap] = useState(/** @type google.maps.Map */ (null))
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [mapKey, setMapKey] = useState(0); 
  
  // Load GOOGLE MAP API
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey, 
    libraries: ['places'],
  });
  
  
  /** @type React.MutableRefObject<HTMLInputElement> */
  const originInputRef = useRef()
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destinationInputRef = useRef(null);
  
  
  
  
  async function calculateRoute() {
    let originValue = origin;
    let destinationValue = destination;
    
    // Check if the destination value is in lat/lng format and process accordingly
    if (destinationValue.includes(',')) {
      const [lat, lng] = destinationValue.split(',').map(coord => parseFloat(coord.trim()));
      destinationValue = new google.maps.LatLng(lat, lng);
    }
    if (originValue.includes(',')) {
      const [lat, lng] = originValue.split(',').map(coord => parseFloat(coord.trim()));
      originValue = new google.maps.LatLng(lat, lng);
    }
    
    if (!originValue || !destinationValue) {
      return;
    }
    
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService()
    const results = await directionsService.route({
      origin: originValue,
      destination: destinationValue,
            // eslint-disable-next-line no-undef
            travelMode: google.maps.TravelMode.WALKING,
          })
          setDirectionsResponse(results)
          setDistance(results.routes[0].legs[0].distance.text)
          setDuration(results.routes[0].legs[0].duration.text)
        }
        
    function clearRoute() {
          setDirectionsResponse(null);
          setDistance('');
          setDuration('');
          originInputRef.current.value = '';
          destinationInputRef.current.value = '';
          setOrigin('');
          setOriginName('');
          setDestinationName('');
          setDestination(''); // Reset the destination value
          setMapKey(prevKey => prevKey + 1);
        }
        
        const mapOptions = [
          {
            streetViewControl: false,
          }
        ]
        
        // ALL the faciliteis layers
      const toiletMarkers = [
          { lat: 22.418513526569456, lng: 114.20523001796764, name: "Toilet 1" },
          { lat: 22.418023226021322, lng: 114.20793097185044, name: "Toilet 2" },
          // Add more toilet marker data as needed
        ];
        const waterFountainMarkers = [
          
          
        ];
        const touristSpotMarkers = [
          
          
        ];

    useEffect(() => {
          if (!window.google) return; // Ensure Google scripts are loaded
      
          const setupAutocomplete = (inputRef, setLocation, setLocationName) => {
              const autocomplete = new window.google.maps.places.Autocomplete(
                  inputRef.current,
                  {
                      componentRestrictions: { country: "HK" },
                  }
              );
      
              autocomplete.addListener("place_changed", () => {
                  const place = autocomplete.getPlace();
                  if (place.geometry) {
                      setLocationName(place.formatted_address);
                      setLocation(`${place.geometry.location.lat()},${place.geometry.location.lng()}`);
                  }
              });
          };
      
          if (destinationInputRef.current) {
              setupAutocomplete(destinationInputRef, setDestination, setDestinationName);
          }
      
          if (originInputRef.current) {
              setupAutocomplete(originInputRef, setOrigin, setOriginName); // assuming you have a state called setOriginName for origin name
          }
      
      }, [destinationInputRef.current, originInputRef.current]);


    // Function to render toilet markers
    const renderToiletMarkers = () => {
      if (!showToiletLayer) return null;
      
      return toiletMarkers.map((marker, index) => (
        <MarkerF
            key={index}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.name}
            onClick={() => handleMarkerClick(marker)}/>
        ));
      };
    const renderDirectionsResponse = () =>{
      if (!directionsResponse) return null;
      return <DirectionsRenderer
        directions={directionsResponse}
        options={{
          suppressMarkers: true, // Hide the default route markers
        }}/>
    }

    function handleMarkerClick(marker) {
        setSelectedMarker(marker);
        setIsInfoWindowVisible(true);
    }
    
    const InfoWindowComponent = ({ marker, onClose }) => {
      if (!marker) return null;
  
      return (
          <InfoWindow
              position={{ lat: marker.lat, lng: marker.lng }}
              onCloseClick={onClose}
          >
              <div>
                  <h4>{marker.name}</h4>
                  <button onClick={() => {
                      setOrigin(`${marker.lat}, ${marker.lng}`);
                      setOriginName(marker.name);
                      onClose();
                  }}>
                      Choose as Origin
                  </button>
                  <button onClick={() => {
                      setDestination(`${marker.lat}, ${marker.lng}`);
                      setDestinationName(marker.name);
                      onClose();
                  }}>
                      Choose as Destination
                  </button>
              </div>
          </InfoWindow>
        );
      };

    if (!isLoaded) return <div>Loading...</div>;

  return (
    <Box 
      position="relative" 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      height="100vh" 
      width="100vw">
      {/* Search & Control Area */}
      <Box 
          position="absolute" 
          top={10} 
          zIndex={1}
          p={0.8} 
          borderRadius="8px"
          bgcolor="background.paper" 
          boxShadow="3"
          width="80%">
         <Box display="flex" flexDirection="column" alignItems="stretch">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <TextField
                  label="Origin"
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={originName}
                  onChange={(e) => setOriginName(e.target.value)}
                  inputRef={originInputRef}
              />
                <TextField
                  label="Destination"
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={destinationName}
                  onChange={(e) => setDestinationName(e.target.value)}
                  inputRef={destinationInputRef}
                />

            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Button 
                    variant="contained" 
                    color="primary" 
                    size="small" 
                    style={{ marginRight: '8px' }} 
                    onClick={calculateRoute}
                >
                    Go
                </Button>
                <IconButton onClick={clearRoute} size="small">
                    <FaTimes />
                </IconButton>
            </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" mt={2} alignItems="center">
          <Typography variant="body2">Distance: {distance}</Typography>
          <Typography variant="body2">Duration: {duration}</Typography>
          <IconButton size="small" onClick={() => {
            map.panTo(center);
            map.setZoom(15.59);
          }}>
            <FaLocationArrow />
          </IconButton>
        </Box>
      </Box>    

      {/* Google Map */}
      <Box 
        position="absolute"        
        height="70%" 
        width="95%">
        <GoogleMap
          key={mapKey}
          zoom={15.59}
          center={center}
          options={mapOptions}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          onLoad={map => setMap(map)}>
          {renderToiletMarkers()}
          {renderDirectionsResponse()}
          
          {isInfoWindowVisible && (
            <InfoWindowComponent 
                marker={selectedMarker} 
                onClose={() => setIsInfoWindowVisible(false)}/>
          )}
          
        
        </GoogleMap>
      </Box>
      
      {/* Toggle Toilet Layer Button */}
      <Box 
        position="absolute" 
        bottom="5%" 
        left="50%" 
        transform="translateX(-50%)">
        <Button variant="contained" color="primary" onClick={() => setShowToiletLayer(!showToiletLayer)}>
          Toggle Toilet Layer
        </Button>
      </Box>
    </Box>
           
  );
};

export default HomePage;
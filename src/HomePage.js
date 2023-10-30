
import React, { useMemo,useState, useEffect, useRef , useLayoutEffect} from "react";
import { GoogleMap, useLoadScript,  MarkerF,  LoadScript, Autocomplete, DirectionsRenderer,InfoWindow,Marker} from "@react-google-maps/api";
// import {Box,Button,ButtonGroup,Flex,HStack,IconButton,Input,SkeletonText,Text} from '@chakra-ui/react'
import { Button, IconButton, Box, TextField, Typography, ButtonGroup , InputAdornment} from "@mui/material";
import LocationPicker from "location-picker";
import { FaLocationArrow, FaTimes } from 'react-icons/fa'
import {FaLocationCrosshairs} from 'react-icons/fa6'
import {MdKeyboardArrowUp} from 'react-icons/md'
import InfoPage from "./components/InfoPage";
// import './HomePage.css'; // Import your CSS file for styling


const HomePage = () => {
  
  // Search Bar
  const [showOriginSearch, setShowOriginSearch] = useState(false);

  const [showToiletLayer, setShowToiletLayer] = useState(false);
  const center = useMemo(() => ({ lat: 22.418426709637526, lng: 114.20771628364456 }), []);
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  
  const google = window.google;
  const [destinationCoord, setDestinationCoord] = useState([]);
  const [destinationName, setDestinationName] = useState('');
  const [originCoord, setOriginCoord] = useState([]);
  const [originName, setOriginName] = useState('');

  // Info Window
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isInfoWindowVisible, setIsInfoWindowVisible] = useState(false);

  const [map, setMap] = useState(/** @type google.maps.Map */ (null))
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [mapKey, setMapKey] = useState(0); 
  
  // Real time user location tracking 
  const accuracyCircle = useRef(null);
  const [circleProps, setCircleProps] = useState(null);
  const marker = useRef(null);
  const [currentUserLocation, setCurrentUserLocation] = useState([]);
  const blueDot = {
    path: 'M 0, 0 m -8, 0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0',
    fillColor: "#4285F4",
    fillOpacity: 1,
    scale: 1,
    strokeColor: "white",
    strokeWeight: 2
  };

  // Custom Info page (Pop up)
  const [showInfoPage, setShowInfoPage] = useState(false);
  
  // Load GOOGLE MAP API
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey, 
    libraries: ['places'],
  });
  
  // Function to get the current GPS location
  useEffect(() => {
    if (!isLoaded) {
      return;
    }
  
    let watcher = null;
    if ("geolocation" in navigator) {
      watcher = navigator.geolocation.watchPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const currentLocation = { lat: latitude, lng: longitude };
          setCurrentUserLocation([latitude,longitude])
          console.log("current user location is ", currentUserLocation)
          // Update or create marker
          if (marker.current) {
            marker.current.setPosition(currentLocation);
          } else {
            marker.current = new window.google.maps.Marker({
              position: currentLocation,
              map: map,
              icon: blueDot,
              title: 'You are here!'
            });
          }
  
          // Update or create accuracy circle
          const maxRadius = 20; 
          if (accuracyCircle.current) {
            accuracyCircle.current.setMap(null);
          }
          accuracyCircle.current = new window.google.maps.Circle({
            center: currentLocation,
            fillColor: "#61a0bf",
            fillOpacity: 0.4,
            radius: Math.min(position.coords.accuracy, maxRadius),
            strokeColor: "#1bb6ff",
            strokeOpacity: 0.4,
            strokeWeight: 1,
            zIndex: 1,
            map: map
          });
        },
        error => {
          console.error("Error watching position:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }
  
    return () => {
      if (watcher) {
        navigator.geolocation.clearWatch(watcher);
      }
    };
  }, [isLoaded, map]);
  

  // Use GPS API to get User current location
  const GetGPSClick = () => {
    if (!isLoaded) {
      console.error("Google Maps script not yet loaded");
      return;
    }
      const [lat,lng] = currentUserLocation
      setOriginCoord([lat,lng])
      console.log("OriginCoord after GetGPSclick is", originCoord)
  };
  
  /** @type React.MutableRefObject<HTMLInputElement> */
  const originInputRef = useRef(null)
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destinationInputRef = useRef(null);
  
  
  
  // when user input string in input field, we should parse the string into coordinatate and cal route
  async function calculateRoute() {
    // Convert array [lat, lng] to google.maps.LatLng object
    let originValue = originCoord.length === 2 ? new google.maps.LatLng(...originCoord) : null;
    let destinationValue = destinationCoord.length === 2 ? new google.maps.LatLng(...destinationCoord) : null;
  
    if (!originValue || !destinationValue) {
      console.log("Origin and destination are not valid");
      return;
    }
  
    const directionsService = new google.maps.DirectionsService();
    try {
      const results = await directionsService.route({
        origin: originValue,
        destination: destinationValue,
        travelMode: google.maps.TravelMode.WALKING,
      });
      setDirectionsResponse(results);
      setDistance(results.routes[0].legs[0].distance.text);
      setDuration(results.routes[0].legs[0].duration.text);
    } catch (error) {
      console.error("Failed to calculate route", error);
    }
  }
  
        
    const clearRoute= () => {
          setDirectionsResponse(null);
          setDistance('');
          setDuration('');
          originInputRef.current.value = '';
          destinationInputRef.current.value = '';
          setOriginCoord([]);
          setOriginName('');
          setDestinationCoord([]); // Reset the destinationCoord value
          setDestinationName('');
          // setMapKey(prevKey => prevKey + 1);
        }
        
  const mapOptions = [
          {
            streetViewControl: false,
          }
        ]
        
        // ALL the faciliteis layers
    
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
                      setLocation([place.geometry.location.lat(), place.geometry.location.lng()]);
                  }
              });
          };
      
    if (destinationInputRef.current) {
              setupAutocomplete(destinationInputRef, setDestinationCoord, setDestinationName);
          }
      
    if (originInputRef.current) {
              setupAutocomplete(originInputRef, setOriginCoord, setOriginName); // assuming you have a state called setOriginName for originCoord name
          }
      
      }, [destinationInputRef.current, originInputRef.current]);


  // Function to render toilet markers
  const toiletMarkers = [
      { lat: 22.418513526569456, lng: 114.20523001796764, name: "Toilet 1" },
      { lat: 22.418023226021322, lng: 114.20793097185044, name: "Toilet 2" },
      // Add more toilet marker data as needed
    ];
  const waterFountainMarkers = [
      
      
    ];
  const touristSpotMarkers = [
      
      
    ];

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
                      setOriginCoord([marker.lat, marker.lng]);
                      setOriginName(marker.name);
                      onClose();
                  }}>
                      Choose as Origin
                  </button>
                  <button onClick={() => {
                      setDestinationCoord([marker.lat, marker.lng]);
                      setDestinationName(marker.name);
                      onClose();
                  }}>
                      Choose as Destination
                  </button>
              </div>
          </InfoWindow>
        );
      };


  // useEffect(()=>{
  //   getCurrentLocation()
  // }, [])
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <Box 
      position="relative" 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      height="100dvh" 
      width="100vw"
      >
        
      {/* Search & Control Area */}
      <Box 
          position="absolute" 
          top={12} 
          zIndex={10}
          p={0.8} 
          bgcolor="background.paper" 
          boxShadow="3"
          borderRadius={5}
          padding={1.2}
          width="90%">
         <Box
            style={{
              maxHeight: showOriginSearch ? '100px' : '0',  // Adjust these values based on your layout
              overflow: 'hidden',
              transition: 'all 0.3s ease-out', // Adjust timing and easing as needed
              opacity: showOriginSearch ? 1 : 0,
              paddingBottom: showOriginSearch ? '15px' : '0',
              paddingTop: showOriginSearch ? '6px' : '0 '
            }}
          >
            <TextField
              label="Origin"
              fullWidth
              variant="outlined"
              size="small"
              value={originName}
              onChange={(e) => setOriginName(e.target.value)}
              inputRef={originInputRef}
              InputProps={{
                style: { borderRadius: '20px', paddingRight: "8px"},
                endAdornment:(
                  <IconButton  onClick={GetGPSClick} >
                    <FaLocationCrosshairs size={25}/>
                  </IconButton>                  
                ),
              }}
            />
          </Box>

          <Box display="flex" alignItems="center" mb={1}>
            <TextField
              label="Where are you going?"
              fullWidth
              variant="outlined"
              size="small"
              value={destinationName}
              onChange={(e) => setDestinationName(e.target.value)}
              inputRef={destinationInputRef}
              InputProps={{
                style: { borderRadius: '20px', paddingRight: "5px" },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton    onClick={() => setShowOriginSearch(prev => !prev)} >
                      <MdKeyboardArrowUp size={32} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center">
                <Button 
                    variant="contained" 
                    color="primary" 
                    size="small" 
                    style={{ marginRight: '8px' }} 
                    onClick={()=>{
                       calculateRoute();
                       setShowInfoPage(true);
                    }}>
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
        

      {/* Google Map */}
      <Box 
        position="absolute"        
        height="100%" 
        width="100%">
        <GoogleMap
          key={mapKey}
          zoom={15.59}
          center={center}
          options={mapOptions}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          onLoad={map => setMap(map)}
          onClick={() => setShowInfoPage(false)}
          >
          {renderToiletMarkers()}
          {renderDirectionsResponse()}    
          {isInfoWindowVisible && (
            <InfoWindowComponent 
                marker={selectedMarker} 
                onClose={() => setIsInfoWindowVisible(false)}
                destinationCoord
                />
          )}
      
        </GoogleMap>
        <InfoPage 
            show={showInfoPage} 
            originCoord= {originCoord}
            destinationCoord = {destinationCoord}
          />
        
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
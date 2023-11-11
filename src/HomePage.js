
import React, { useMemo,useState, useEffect, useRef , useLayoutEffect} from "react";
import { GoogleMap, useLoadScript,  MarkerF,  LoadScript, Autocomplete, DirectionsRenderer,InfoWindow,Marker} from "@react-google-maps/api";
// import {Box,Button,ButtonGroup,Flex,HStack,IconButton,Input,SkeletonText,Text} from '@chakra-ui/react'
import { Button, IconButton, Box, TextField, Typography, ButtonGroup , InputAdornment, Icon} from "@mui/material";
import LocationPicker from "location-picker";
import { FaLocationArrow, FaTimes,FaRoute } from 'react-icons/fa'
import {FaLocationCrosshairs,FaRobot} from 'react-icons/fa6'
import {MdKeyboardArrowUp,MdKeyboardArrowDown} from 'react-icons/md'
import InfoPage from "./components/InfoPage/InfoPage";
import RealTimeUserLocationTracker from "./components/RealTimeUserLocationTracker.js";
import RenderSuggestions from "./components/RenderSuggestion/RenderSuggestion.js";
import { customPlaces } from "./data/Places.js";
// import getNLPResult from "./components/ChatgptSearch/handleSearch";
import './HomePage.css'


const HomePage = () => {
  
  // Search Bar
  const [showOriginSearch, setShowOriginSearch] = useState(false);
    // NLP function
  const [NLPSearchToggle, setNLPSearchToggleToggle] = useState(false);
  const [NLPQuery, setNLPQuery] = useState("");

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
  const [currentUserLocation, setCurrentUserLocation] = useState([]);


  // Custom Info page (Pop up)
  const [showInfoPage, setShowInfoPage] = useState(false);
  
  // Load GOOGLE MAP API
  const [ libraries ] = useState(['places']);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey, 
    libraries,
  });


  // Use GPS API to get User current location
  const GetGPSClick = () => {
    if (!isLoaded) {
          console.error("Google Maps script not yet loaded");
          return;
      }
      const [lat,lng] = currentUserLocation
      setOriginCoord([lat,lng])
      
      // Map pan to current user location
      map.panTo({lat: lat , lng: lng });
      map.setZoom(17);

      // Create a Geocoder instance
      const geocoder = new google.maps.Geocoder();
      
      // Use the Geocoder to find the address
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK") {
          if (results[0]) {
              console.log("Address:", results[0].formatted_address);
              setOriginName(results[0].formatted_address)  
            } else {
              console.log("No results found");
            }
          } else {
            console.error("Geocoder failed due to: " + status);
          }
        });

      console.log("OriginCoord after GetGPSclick is", originCoord);
  };

  /** @type React.MutableRefObject<HTMLInputElement> */
  const originInputRef = useRef(null)
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destinationInputRef = useRef(null);
  
  
  
  // when user input string in input field, we should parse the string into coordinatate and calroute—
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
      setShowInfoPage(true);
    } catch (error) {
      console.error("Failed to calculate route", error);
    }
  }
  const renderDirectionsResponse = () =>{
    if (!directionsResponse) return null;
    return <DirectionsRenderer
      directions={directionsResponse}
      options={{
        suppressMarkers: true, // Hide the default route markers
      }}/>
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
          
        }
  
  const handleShowInfoPage= () => {



  }
  // Function to calculate the distance from the origin to each toilet
  function getNearestToilet(origin) {
    const originLatLng = new google.maps.LatLng(origin[0], origin[1]);
    const service = new google.maps.DistanceMatrixService();
    const destinations = toiletMarkers.map(marker => new google.maps.LatLng(marker.lat, marker.lng));

    // Return a new Promise
    return new Promise((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins: [originLatLng],
          destinations: destinations,
          travelMode: 'WALKING', // or 'DRIVING'
        },
        (response, status) => {
          if (status !== 'OK') {
            console.log('Error was: ' + status);
            reject(status); // Reject the promise if there's an error
          } else {
            let distances = response.rows[0].elements;
            let minimumDistance = Number.MAX_VALUE;
            let nearestToiletIndex = -1;

            distances.forEach((distance, index) => {
              if (distance.distance.value < minimumDistance) {
                minimumDistance = distance.distance.value;
                nearestToiletIndex = index;
              }
            });

            if (nearestToiletIndex !== -1) {
              let nearestToilet = toiletMarkers[nearestToiletIndex];
              console.log('Nearest Toilet:', nearestToilet);
              resolve(nearestToilet); // Resolve the promise with the nearest toilet
            } else {
              reject('No toilets found.'); // Reject if no toilets are found
            }
          }
        }
      );
    });
  };



  const mapOptions = [
          {
            streetViewControl: false,
          }
        ]
        
  
  

  // Function to handle place selection

  const [suggestions, setSuggestions] = useState([]);
  const [activeInput, setActiveInput] = useState(""); // "" or "origin" or "destination"

  const handleInputChange = (value) => {
    if (activeInput ==="origin") {
      setOriginName(value);
    } else {
      setDestinationName(value);
    }

    if (value === '') {
      setSuggestions([]);
    } else {
      const filteredSuggestions = customPlaces
        .map(placeObj => Object.keys(placeObj)[0])
        .filter(placeName => placeName.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
  
      setSuggestions(filteredSuggestions);
    }
  };

  const handleNLPQuery = () => {  
    // const NLPResult = getNLPResult(NLPQuery)
    // selectPlace(NLPResult, "destination")
  };

  
  const selectPlace = async (inputString, isOrigin) => {
    console.log("Place selected: ", inputString);
    // If 'Nearest Toilet' is selected, calculate the nearest toilet
    if (inputString.toLowerCase() === 'nearest toilet') {
        setShowToiletLayer(true);
        // Determine the origin coordinates based on the current origin or user's location
        const originCoords = isOrigin ? originCoord : currentUserLocation; // Assume currentUserLocation is obtained elsewhere
        try {
          const nearestToilet = await getNearestToilet(originCoords);

          setDestinationName(nearestToilet.name);
          setDestinationCoord([nearestToilet.lat, nearestToilet.lng]);
          // Add marker for the nearest toilet
          console.log(`Nearest toilet set to: ${nearestToilet.name}`);
      } catch (error) {
        console.error('An error occurred while finding the nearest toilet:', error);
      }

    } else {
            setShowToiletLayer(false);
            let coord;
            const placeObj = customPlaces.find(p => Object.keys(p)[0] === inputString);
            if (placeObj) {
              coord = placeObj[inputString];
            }

            if (!coord) return; // Handle non-existent place

            if (isOrigin) {
              setOriginName(inputString);
              setOriginCoord([coord.lat, coord.lng]);
            } else {
              setDestinationName(inputString);
              setDestinationCoord([coord.lat, coord.lng]);
            }        
    }
    // After selecting the place, clear suggestions
    setSuggestions([]);
  };


  useEffect(() => {
    console.log("selected origin name is", originName);
    console.log("selected origin coordinates are", originCoord);
    console.log("selected dest name is", destinationName);
    console.log("selected dest coordinates are", destinationCoord);
  }, [originName, originCoord, destinationName]);

  

  // Function to render toilet markers
  const toiletMarkers = [
      { lat: 22.418513526569456, lng: 114.20523001796764, name: "Toilet 1" },
      { lat: 22.418023226021322, lng: 114.20793097185044, name: "Toilet 2" },
      { lat: 22.4196819	, lng: 114.2039352 , name:"Lee Shau Kee Building Toilet" },
      { lat: 22.4200548, lng: 114.206562 , name: "Y. C. Liang Hall Toilet"}

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

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <Box 
      position="relative" 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      height="100dvh" 
      width="100%"
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
            position="relative"
            style={{
              maxHeight: showOriginSearch ? '100px' : '0',  
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
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setActiveInput("origin")}
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
            {activeInput === "origin" && <RenderSuggestions suggestions={suggestions} activeInput={activeInput} selectPlace={selectPlace}/>}
          </Box>

          <Box  position="relative" alignItems="center" mb={1} >
            <TextField
              label= {showOriginSearch  ? "Destination" : "Where are you going?" }
              fullWidth
              variant="outlined"
              size="small"
              value={ NLPSearchToggle ? NLPQuery : destinationName}
              onChange={ NLPSearchToggle ? (e) => setNLPQuery(e.target.value) : (e) => handleInputChange(e.target.value)}
              onFocus={ NLPSearchToggle ? null : () => setActiveInput("destination")}
              inputRef={destinationInputRef}
              InputProps={{
                style: { borderRadius: '20px', paddingRight: "5px" },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <FaRobot onClick={() => {
                                                setNLPSearchToggleToggle(prev => !prev)
                                                setDestinationName("")
                                                setNLPQuery("")
                                              }} size={25} color = {NLPSearchToggle? "#2f77eb":""} />
                    </IconButton>
                    {showOriginSearch ? 
                                      <IconButton    onClick={() => setShowOriginSearch(prev => !prev)} >
                                        <MdKeyboardArrowUp size={32} />
                                      </IconButton> 
                                      :  
                                      <IconButton    onClick={() => setShowOriginSearch(prev => !prev)} >
                                        <MdKeyboardArrowDown size={32} />
                                      </IconButton>  }
                  </InputAdornment>
                ),
              }}
            />
            {activeInput === "destination" && <RenderSuggestions suggestions={suggestions} activeInput={activeInput} selectPlace={selectPlace}/>}
          </Box>
         

          <Box display="flex" justifyContent="space-between"  paddingLeft={1} paddingRight= {1.6}mt={1.4}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    size="small" 
                    
                    style={{display: "flex", 
                            alignItems: "center",
                            justifyContent: "center",
                            alignContent: "center" 
                          }} 
                    onClick = { NLPSearchToggle ? () => {handleNLPQuery()} :
                                                  () => {calculateRoute();
                              }}>
                    <span style={{ fontSize: 16, marginRight: 7 }}>
                          Search
                    </span>
                    <FaRoute size={20}/>
                
                </Button>
                <IconButton onClick={clearRoute} size="small" >
                    <FaTimes size={22}/>
                </IconButton>

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
          {isLoaded && map && (
                <RealTimeUserLocationTracker
                    onLocationUpdate={setCurrentUserLocation}
                    isLoaded={isLoaded}
                    map={map}
                />)
          }
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
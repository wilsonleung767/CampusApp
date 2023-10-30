import React, { useMemo,useState, useEffect, useRef } from "react";
import { GoogleMap, useLoadScript,  MarkerF,  LoadScript, Autocomplete, DirectionsRenderer,InfoWindow} from "@react-google-maps/api";
import {Box,Button,ButtonGroup,Flex,HStack,IconButton,Input,SkeletonText,Text} from '@chakra-ui/react'
import { FaLocationArrow, FaTimes, FaLocationCrosshairs } from 'react-icons/fa'
import './HomePage.css'; // Import your CSS file for styling


const HomePage = () => {
  
  const [showToiletLayer, setShowToiletLayer] = useState(false);
  const center = useMemo(() => ({ lat: 22.418426709637526, lng: 114.20771628364456 }), []);
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  
  // const google = window.google;
  
  
  const [map, setMap] = useState(/** @type google.maps.Map */ (null))
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [mapKey, setMapKey] = useState(0); 
  
  // Load GOOGLE MAP API
  const { isLoaded } = useLoadScript({
          // googleMapsApiKey: apiKey, 
          libraries: ['places'],
    });
  
  
    /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef()
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destiantionRef = useRef()

  async function calculateRoute() {
    if (originRef.current.value === '' || destiantionRef.current.value === '') {
      return
    }
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService()
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destiantionRef.current.value,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.WALKING,
    })
    setDirectionsResponse(results)
    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)
  }

  function clearRoute() {
    setDirectionsResponse(null)
    setDistance('')
    setDuration('')
    originRef.current.value = ''
    destiantionRef.current.value = ''
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
    const renderDirectionsResponse = () =>{
      if (!directionsResponse) return null;
      return <DirectionsRenderer
        directions={directionsResponse}
        options={{
          suppressMarkers: true, // Hide the default route markers
        }}/>
    }

    if (!isLoaded) return <div>Loading...</div>;



  return (
    <Flex
      position='relative'
      flexDirection='column'
      alignItems='center'
      h='100vh'
      w='100vw'>
            {/* <LoadScript id="script-loader" googleMapsApiKey={apiKey} libraries= {["places"]}> */}
        <Box
                  p={4}
                  borderRadius='lg'
                  m={4}
                  bgColor='white'
                  shadow='base'
                  minW='container.md'
                  zIndex='1'
              >
          <HStack spacing={2} justifyContent='space-between'>
            <Box flexGrow={1}>
              <Autocomplete
                options={{
                  componentRestrictions: { country: "HK" },
                  }}>
                <Input type='text' placeholder='Origin' ref={originRef}  />
              </Autocomplete>
            </Box>
            <Box flexGrow={1}>
              <Autocomplete>
                <Input
                  type='text'
                  placeholder='Destination'
                  ref={destiantionRef}
                />
              </Autocomplete>
            </Box>

            <ButtonGroup>
              <Button colorScheme='pink' type='submit' onClick={calculateRoute}>
                Calculate Route
              </Button>
              <IconButton
                aria-label='center back'
                icon={<FaTimes />}
                onClick={clearRoute}
              />
            </ButtonGroup>
          </HStack>
          <HStack spacing={4} mt={4} justifyContent='space-between'>
            <Text>Distance: {distance} </Text>
            <Text>Duration: {duration} </Text>
            <IconButton
              aria-label='center back'
              icon={<FaLocationArrow />}
              isRound
              onClick={() => {
                map.panTo(center)
                map.setZoom(16.1)
              }}
            />
          </HStack>
        </Box>
        {/* Map box */}
        <Box position='absolute' h='65%' w='95%'>
              <GoogleMap
                  // set the state with the current instance of map.
                  key={mapKey}
                  zoom= {16.1} // Set the zoom based on originalZoom
                  center={center}
                  options={mapOptions}
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  onLoad={map => setMap(map)}>
                {renderToiletMarkers()} {/* Render toilet markers */}
                {renderDirectionsResponse()}
              </GoogleMap>
        </Box>
              {/* </LoadScript> */}
          <Button colorScheme='pink' onClick={() => setShowToiletLayer(!showToiletLayer)} >
                Toggle Toilet Layer
          </Button>
    </Flex> 
           
  );
};

export default HomePage;



<Autocomplete 
                    onLoad={onLoad}
                    onPlaceChanged={onPlaceChanged}
                    options={{
                      componentRestrictions: { country: "HK" },
                  }}
                  style={{ flex: 2 }}
                >
                    <TextField 
                      label="Destination" 
                      fullWidth 
                      variant="outlined" 
                      size="small"
                      value={destinationName}
                      onChange={e => setDestinationName(e.target.value)}
                    />
                </Autocomplete> 
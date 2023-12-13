import React, { useMemo,useState, useEffect, useRef , useLayoutEffect} from "react";
import { GoogleMap, useLoadScript,  MarkerF,Polyline,  LoadScript, Autocomplete, DirectionsRenderer,InfoWindow,Marker} from "@react-google-maps/api";
// import {Box,Button,ButtonGroup,Flex,HStack,IconButton,Input,SkeletonText,Text} from '@chakra-ui/react'
import { Button, IconButton, Box, TextField, Typography, ButtonGroup , InputAdornment, Icon,} from "@mui/material";
import LocationPicker from "location-picker";
import { FaLocationArrow, FaTimes,FaRoute } from 'react-icons/fa'
import {FaLocationCrosshairs,FaRobot} from 'react-icons/fa6'
import {MdKeyboardArrowUp,MdKeyboardArrowDown} from 'react-icons/md'
import InfoPage from "./components/InfoPage/InfoPage";
import RealTimeUserLocationTracker from "./components/RealTimeUserLocationTracker.js";
import RenderSuggestions from "./components/SearchBarSuggestion/RenderSuggestion.js";
import { customPlaces } from "./data/Places.mjs";
import { toiletMarkers,waterFountainMarkers} from "./data/Markers.js";
// import getNLPResult from "./components/ChatgptSearch/handleSearch";
import './HomePage.css'
import { FaPersonWalking , FaMagnifyingGlass } from "react-icons/fa6";
import { FaBusSimple } from "react-icons/fa6";
import { pairPlaceAlias } from "./components/PairPlaceAlias.mjs";
import { getBusRoute } from "./components/SearchBusRoute/getBusRoute.mjs";
import { busPolyline } from "./data/CustomRoute.mjs";

import { calculateTripDurationByBus } from "./components/SearchBusRoute/calculateTripDurationByBus.mjs";
import greyDot from './image/greyDot.png';
import busStopGrey from './image/busStopGrey.png';
import toiletImg from './image/toilet.png';
import toiletImgHighlighted from './image/toiletHighlighted.png';
import waterFountainImg from './image/waterFountain.png';
import waterFoundationImgHighlighted from './image/waterFountainHighlighted.png';
import busStopImg from './image/busStop.png';
import { busDetails } from "./data/busDetails.mjs";
import { stationLocation} from "./data/Places.mjs";
import { getFullPlaceName } from "./components/PairPlaceAlias.mjs";
import { shortCutPair } from "./data/CustomRoute.mjs";

const HomePage = () => {
  
  // Search Bar
  const [showOriginSearch, setShowOriginSearch] = useState(false);
  const [afterSearch, setAfterSearch] = useState(false);
  const [travelType, setTravalType] = useState("");

    // NLP function
  const [NLPSearchToggle, setNLPSearchToggleToggle] = useState(false);
  const [NLPQuery, setNLPQuery] = useState("");

  const [showToiletMarkers, setShowToiletMarkers] = useState(false);
  const [showWaterFountainMarkers, setShowWaterFountainMarkers] = useState(false);
  const [busRouteMarkers, setBusRouteMarkers] = useState([]);
  const [startStationName, setStartStationName] = useState('');
  const [endStationName, setEndStationName] = useState(''); 
  const [selectedBusRoute, setSelectedBusRoute] = useState(null);

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
  const [walkDirectionsResponse, setWalkDirectionsResponse] = useState(null)
  const [distance, setDistance] = useState('')
  const [walkDuration, setWalkDuration] = useState('')
  const [mapKey, setMapKey] = useState(0); 
  
  // Real time user location tracking 
  const [currentUserLocation, setCurrentUserLocation] = useState([]);


  // Custom Info page (Pop up)
  const [showInfoPage, setShowInfoPage] = useState(false);
  
  // Polyline
  const [selectedBusPolyline, setSelectedBusPolyline] = useState(null);

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
      geocoder.geocode({ location: { lat, lng }  , language: 'en'}, (results, status) => {
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
  async function calculateRouteByWalking() {
    // Convert array [lat, lng] to google.maps.LatLng object
    // setDirectionsResponseFromStationToDest(null);
    // setDirectionsResponseFromOriginToStation(null);
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
      setWalkDirectionsResponse(results);
      setDistance(results.routes[0].legs[0].distance.text);
      let durationInMin = Math.ceil(results.routes[0].legs[0].duration.value/60)
      setWalkDuration(durationInMin);
      setShowInfoPage(true);
    } catch (error) {
      console.error("Failed to calculate route", error);
    }
  }
  const renderWalkDirectionsResponse = () => {
    const shortcut = shortCutPair.find(pair => 
      pair.origin === originName && pair.destination === destinationName);
    
      if (shortcut) {
        // Render custom polyline for shortcut
        return (
          <>
            <Polyline
              path={shortcut.polyline}
              options={{
                strokeColor: "#2c6bf2", // Customize as needed
                strokeOpacity: 1,
                strokeWeight: 5,
              }}
            />
            {/* <Marker // Start marker
              position={{lat: originCoord[0],
                        lng: originCoord[1],}}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: "#f2f2f2",
                fillOpacity: 1,
                strokeOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#787878",
                scale: 7,
              }}
            />
            <Marker // End marker
              position={shortcut.polyline[shortcut.polyline.length - 1]}
            /> */}
          </>
        );
      }
    
    if (!walkDirectionsResponse) return null;

    return (
      <>
        <DirectionsRenderer
          directions={walkDirectionsResponse}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: 'White', // Color of the dotted line
              strokeOpacity: 0, // Make the primary line invisible
              strokeWeight: 1,
              icons: [{
                icon: {
                  path: google.maps.SymbolPath.CIRCLE, // Use a circle symbol
                  strokeOpacity: 1,
                  strokeWeight: 2, // Weight of the invisible primary line
                  fillOpacity: 1,
                  fillColor: "#2c6bf2",
                  scale: 5, // Size of the circle dot
                },
                offset: '0',
                repeat: '20px' // Distance between each circle dot
              }],
            },
          }}
        />
        <Marker // Start marker
          position={{
            lat: originCoord[0],
            lng: originCoord[1],
          }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE, // Use a circle symbol
            fillColor: "#f2f2f2",
            fillOpacity: 1,
            strokeOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#787878",
            scale: 7, // Size of the circle dot
          }}
          
        />
        <Marker // End marker
          position={{
            lat: destinationCoord[0],
            lng: destinationCoord[1],
          }}
        />
      </>
    );
  };

  const renderBusDirectionsResponse = () =>{
    if (!selectedBusRoute) return null;
    // Extracting start and end locations
    const startLocationFromOriginToStation = selectedBusRoute.directionsResponseFromOriginToStation.routes[0].legs[0].start_location;
    // const endLocationFromOriginToStation = selectedBusRoute.directionsResponseFromOriginToStation.routes[0].legs[directionsResponseFromOriginToStation.routes[0].legs.length - 1].end_location;

    // const startLocationFromStationToDest = selectedBusRoute.directionsResponseFromStationToDest.routes[0].legs[0].start_location;
    // const endLocationFromStationToDest = selectedBusRoute.end
    
    const stationMarkers = createBusStationMarkers(selectedBusRoute.route, selectedBusRoute.startStation, selectedBusRoute.endStation);

    return (
      <>      
          {selectedBusRoute.polyline &&
          <Polyline
              path={selectedBusRoute.polyline}
              options={{
              strokeColor: "#9b17f1",
              strokeOpacity: 0.5,
              strokeWeight: 5,
              fillColor: "#9b17f1",
              fillOpacity: 0.2,
              clickable: false,
              draggable: false,
              editable: false,
              visible: true,
              radius: 30000,
              
            }}
          />
            }
          <DirectionsRenderer
                directions={selectedBusRoute.directionsResponseFromOriginToStation}
                options={{
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: 'White', // Color of the dotted line
                      strokeOpacity: 0, // Make the primary line invisible
                      strokeWeight: 1,
                      icons: [{
                        icon: {
                          path: google.maps.SymbolPath.CIRCLE, // Use a circle symbol
                          strokeOpacity: 1,
                          strokeWeight: 2, // Weight of the invisible primary line
                          fillOpacity: 1,
                          fillColor: '#4285F4',
                          scale: 5, // Size of the circle dot
                        },
                        offset: '0',
                        repeat: '18px' // Distance between each circle dot
                      }],
                    },
                }}
            />
            <DirectionsRenderer
                directions={selectedBusRoute.directionsResponseFromStationToDest}
                options={{
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: 'White', // Color of the dotted line
                      strokeOpacity: 0, // Make the primary line invisible
                      strokeWeight: 1,
                      icons: [{
                        icon: {
                          path: google.maps.SymbolPath.CIRCLE, // Use a circle symbol
                          strokeOpacity: 1,
                          strokeWeight: 2, // Weight of the invisible primary line
                          fillOpacity: 1,
                          fillColor: '#ff2527',
                          scale: 5, // Size of the circle dot
                        },
                        offset: '0',
                        repeat: '18px' // Distance between each circle dot
                      }],
                    },
                }}
            />
            <Marker
              position={{lat:originCoord[0], lng:originCoord[1]}}
              icon={{
                path: google.maps.SymbolPath.CIRCLE, // Use a circle symbol
                fillColor: "#f2f2f2",
                fillOpacity: 1,
                strokeOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#787878",
                scale: 8, // Size of the circle dot
              }}
            />
            <Marker
                position={{lat:destinationCoord[0], lng:destinationCoord[1]}}
              />
      
            {stationMarkers}
        </>
      )
  }

  // const [directionsResponseFromOriginToStation, setDirectionsResponseFromOriginToStation] = useState(null);
  // const [directionsResponseFromStationToDest, setDirectionsResponseFromStationToDest] = useState(null);
  // const [busStart, setBusStart] = useState({ lat: 22.415917172642065, lng: 114.211104527007 });
  // const [busEnd, setBusEnd] = useState({lat: 22.419788004309634, lng: 114.20867167235077});
  const [originToStationDuration , setOriginToStationDuration] = useState(null);
  const [stationToDestDuration , setDepartureToDestDuration] = useState(null);
    // Calculate the walking route from origin to busStart


  const calculateWalkingRouteToBusStop = (busStartCoord) => {
      return new Promise((resolve, reject) => {
        let originValue = originCoord.length === 2 ? new google.maps.LatLng(...originCoord) : null;
    
        const directionsService = new google.maps.DirectionsService();
        directionsService.route({
          origin: originValue, // user's current location
          destination: busStartCoord, // coordinates of the bus stop
          travelMode: google.maps.TravelMode.WALKING,
        }, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            let durationInMin = Math.ceil(result.routes[0].legs[0].duration.value/60)
            console.log("duration is",durationInMin)
            resolve({duration: durationInMin, walkDirectionsResponse: result });
          } else {
            console.error(`error fetching directions: ${status}`);
            reject(`Error fetching directions: ${status}`);
          }
        });
      });
    };
  const calculateWalkingRouteFromBusStop = (busEndCoord) => {
      return new Promise((resolve, reject) => {
        let destinationValue = destinationCoord.length === 2 ? new google.maps.LatLng(...destinationCoord) : null;
        const directionsService = new google.maps.DirectionsService();
        directionsService.route({
          origin: busEndCoord, 
          destination: destinationValue, // coordinates of the bus stop
          travelMode: google.maps.TravelMode.WALKING,
        }, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            let durationInMin = Math.ceil(result.routes[0].legs[0].duration.value/60)
            console.log("duration is",durationInMin)
            resolve({duration: durationInMin, walkDirectionsResponse: result });
          } else {
            console.error(`error fetching directions: ${status}`);
            reject(`Error fetching directions: ${status}`);
          }
        });
      });
    };


  const showBusRoute =(busStart, busEnd) =>{
      
      setWalkDirectionsResponse(null);
      calculateWalkingRouteToBusStop(busStart);
      calculateWalkingRouteFromBusStop(busEnd);
    }
 
  useEffect(()=>{
    console.log(originToStationDuration , "  ",  stationToDestDuration)
  },[originToStationDuration ,stationToDestDuration]
  )

  const onSelectBusRoute = (selectedBusRoute) => {
    // Update state to render bus directions on the map
    setTravalType("bus")
    // setDirectionsResponseFromOriginToStation(selectedBusRoute.directionsResponseFromOriginToStation);
    // setDirectionsResponseFromStationToDest(selectedBusRoute.directionsResponseFromStationToDest);
    setSelectedBusRoute(selectedBusRoute)
  };

  
  useEffect(()=>{console.log("Current selectedBusroute is ", selectedBusRoute)
                  }, [selectedBusRoute])

  const clearRoute= () => {
          setWalkDirectionsResponse(null);
          // setDirectionsResponseFromStationToDest(null);
          // setDirectionsResponseFromOriginToStation(null);
          setDistance('');
          setWalkDuration('');
          originInputRef.current.value = '';
          destinationInputRef.current.value = '';
          setOriginCoord([]);
          setOriginName('');
          setDestinationCoord([]); // Reset the destinationCoord value
          setDestinationName('');
          setAfterSearch(false)
          setShowInfoPage(false)
          setShowToiletMarkers(false)
          setShowWaterFountainMarkers(false)
          setSelectedBusPolyline(null)
          setBusRouteMarkers([])
          setSelectedBusRoute(null)
        }
  
  const handleShowInfoPage= () => {



  }

  const originDestionationPair = () => {
    if (originName === "" || destinationName === "") 
  
  }
  const [startBuilding,setStartBuilding] = useState("");
  const [endBuilding,setEndBuilding] = useState("");

  
  async function retrieveNearestBuilding(origin) {
    try {
        let startNearestBuilding = getNearestBuilding(origin);
        console.log("Nearest building is: " + startNearestBuilding);
        return startNearestBuilding; // This will be a string
    } catch (error) {
        console.error("Error finding the nearest building: " + error);
    }
}

  
  
  const [busList, setBusList] = useState([
    {
        route: "",
        startStation: "",
        endStation: "",
        timeFromOriginToStation: null,
        timeFromDepartureToDest: null,
        busTravelDuration: null,
        timeForTotalBusTrip: null,
        departureTime:null,
        arrivalTime:null,
        upcomingDepartures:[],
        status:"",
        polyline: [],
        directionsResponseFromOriginToStation: null,
        directionsResponseFromStationToDest: null
    }
  ]);

  async function handleSearch(){
    try{
    calculateRouteByWalking() 
    // calculateWalkingRouteToBusStop({ lat: 22.415880, lng: 114.210859 })

    let startBuilding, endBuilding;

    startBuilding = await retrieveNearestBuilding(originCoord);
    // endBuilding = await retrieveNearestBuilding(destinationCoord);

    const startBuildingAlias = pairPlaceAlias(startBuilding)
    const endBuildingAlias = pairPlaceAlias(destinationName)
    const tempBusList = [];
    
    const busRouteList = getBusRoute(startBuildingAlias,endBuildingAlias,'TD')
  //   const busRouteList = [ 
  //   { busRoute: '2', startStation: 'MTRP', endStation: 'UADM', startStationLocation:{lat: 22.413901, lng: 114.209770 } , endStationLocation: { lat: 22.418799, lng: 114.205340  }, passedStations: [ 'MTR', 'SPORTC', 'SHAWHALL' ]},
  //   { busRoute: '1A', startStation: 'MTR', endStation: 'SHAWHALL' , startStationLocation:{lat: 22.414523, lng: 114.210223 } , endStationLocation: { lat: 22.4198826971, lng: 114.206907327 }, passedStations: [ 'MTR', 'SPORTC', 'SHAWHALL' ]}
  // ]
  
    for (let bus of busRouteList){
      try {
        const walkingRouteToBusStop = await calculateWalkingRouteToBusStop(bus.startStationLocation);
        const timeFromOriginToStation = walkingRouteToBusStop.duration;
        const directionsResponseFromOriginToStation = walkingRouteToBusStop.walkDirectionsResponse
        const walkingRouteFromBusStop = await calculateWalkingRouteFromBusStop(bus.endStationLocation);
        const timeFromDepartureToDest = walkingRouteFromBusStop.duration
        const directionsResponseFromStationToDest = walkingRouteFromBusStop.walkDirectionsResponse
        const busDetails = calculateTripDurationByBus(bus.busRoute, bus.startStation, bus.endStation, timeFromOriginToStation, timeFromDepartureToDest)
        
      
        tempBusList.push({
          route: bus.busRoute,
          startStation: bus.startStation,
          endStation: bus.endStation,
          timeFromOriginToStation,
          timeFromDepartureToDest,
          timeForTotalBusTrip: busDetails.totalTripTime,
          busTravelDuration: busDetails.busTravelDuration,
          departureTime: busDetails.departureTime,
          arrivalTime: busDetails.arrivalTime,
          upcomingDepartures: busDetails.upcomingDepartures,
          status: busDetails.status,
          directionsResponseFromOriginToStation:directionsResponseFromOriginToStation,
          directionsResponseFromStationToDest:directionsResponseFromStationToDest,
          passedStations: bus.passedStations,
          polyline: busPolyline[bus.busRoute]
        })

      } catch (error) {
        console.error(error);
      }
    }
    // Sort the tempBusList by timeForTotalBusTrip in ascending order
    if (tempBusList.length > 1) {
        tempBusList.sort((a, b) => a.timeForTotalBusTrip - b.timeForTotalBusTrip);
    }

    // Update the busList state with sorted/temporary array
    setBusList(tempBusList);

    // For debugging
    console.log(tempBusList);
    setAfterSearch(true);
    setTravalType("walk")
    setShowInfoPage(true);
    }
    catch(error){
      console.log(error)
    }
  }

  useEffect(()=>{
    console.log("busList : ",busList)
  }, [busList])

  
  // Euclidean distance calculation
  function calculateEuclideanDistance(lat1, lng1, lat2, lng2) {
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
  }

// Function to find the five nearest toilets
  function  findFiveNearestToilet(origin) {
    if (origin.length > 1){}
    return toiletMarkers.map(facility => ({
        ...facility,
        distance: calculateEuclideanDistance(origin[0], origin[1], facility.lat, facility.lng)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);
}

  function findFiveNearestWaterFountain(origin) {
    return waterFountainMarkers.map(facility => ({
        ...facility,
        distance: calculateEuclideanDistance(origin[0], origin[1], facility.lat, facility.lng)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);
}
function getNearestToilet(originCoord) {
  const nearestToilets = findFiveNearestToilet(originCoord);
  return nearestToilets[0]
}
function getNearestWaterFountain(originCoord) {
  const nearestWaterFountain = findFiveNearestWaterFountain(originCoord);
  return nearestWaterFountain[0]
}

function getNearestBuilding(originCoord){
  return customPlaces.map(placeObj => {
    const placeName = Object.keys(placeObj)[0]
    const { lat, lng } = placeObj[placeName];

        return {
            name: placeName,
            lat,
            lng,
            distance: calculateEuclideanDistance(originCoord[0], originCoord[1], lat, lng)
        };
    })
    .sort((a, b) => a.distance - b.distance)
    [0].name;
  
}

const mapOptions = {
  styles: [
    {
        featureType: "poi", // Points of Interest
        elementType: "labels",
        stylers: [{ visibility: "off" }]
    },
    {
        featureType: "transit",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
    }
    // You can add more features to hide other elements like roads, parks, etc.
],
  zoomControl: false,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false
  };
          
          
          
          
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
  
  
  const [nearestToiletMarker, setNearestToiletMarker] = useState(null);
  const [nearestWaterFountainMarker, setNearestWaterFountainMarker] = useState(null);
  const selectPlace = (inputString, isOrigin, showOriginSearch) => {
    console.log("Place selected: ", inputString);
    // If 'Nearest Toilet' is selected, calculate the nearest toilet
    if (inputString.toLowerCase() === 'nearest toilet') {
      setShowToiletMarkers(true);
      // Determine the origin coordinates based on the current origin or user's location
      const originCoords = showOriginSearch ? originCoord : currentUserLocation; // Assume currentUserLocation is obtained elsewhere
      try {
        const nearestToilet = getNearestToilet(originCoords);
        
        setDestinationName(nearestToilet.name);
        setDestinationCoord([nearestToilet.lat, nearestToilet.lng]);
        setNearestToiletMarker(nearestToilet);
        // Add marker for the nearest toilet
        console.log(`Nearest toilet set to: ${nearestToilet.name}`);
      } catch (error) {
        console.error('An error occurred while finding the nearest toilet:', error);
      }
    } 
    else if (inputString.toLowerCase() === 'nearest water fountain'){
      setShowWaterFountainMarkers(true);
      const originCoords = showOriginSearch ? originCoord : currentUserLocation; 
      try {
        const nearestWaterFountain = getNearestWaterFountain(originCoords);

        setDestinationName(nearestWaterFountain.name);
        setDestinationCoord([nearestWaterFountain.lat, nearestWaterFountain.lng]);
        setNearestWaterFountainMarker(nearestWaterFountain);
        console.log(`Nearest water fountain set to: ${nearestWaterFountain.name}`);
    } catch (error) {
      console.error('An error occurred while finding the nearest water fountain:', error);
      
      }
    } 
    else {
            setShowToiletMarkers(false);
            setShowWaterFountainMarkers(false);
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

  const handleWalkButtonClick = () => {
      setTravalType("walk")
      setShowInfoPage(true)
  };
  const handleBusButtonClick = () => {
    setTravalType("bus")
    setShowInfoPage(true)
    // if(busList.length > 0) {
      // setDirectionsResponseFromOriginToStation(busList[0].directionsResponseFromOriginToStation);
      // setDirectionsResponseFromStationToDest(busList[0].directionsResponseFromStationToDest);
      // setSelectedBusPolyline(busList[0].polyline);
      // const markers= getStationCoordinatesForRoute(busList[0].route);
      // setBusRouteMarkers(markers);
    // }
  };

  const touristSpotMarkers = [
      
      
    ];

  const renderToiletMarkers = () => {
      if (!showToiletMarkers) return null;
      
      return toiletMarkers.map((marker, index) => (
        <MarkerF
            key={index}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.name}
            onClick={() => handleMarkerClick(marker)}
            icon={{
              url: nearestToiletMarker && marker.name === nearestToiletMarker.name ? toiletImgHighlighted : toiletImg , 
              scaledSize: new google.maps.Size(30,30 ), 
              }}
            />
        ));
    };
    const renderWaterFountainMarkers = () => {
      if (!showWaterFountainMarkers) return null;
      return waterFountainMarkers.map((marker, index) => (
        <MarkerF
            key={index}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.name}
            onClick={() => handleMarkerClick(marker)}
            icon={{
                url: nearestWaterFountainMarker && marker.name === nearestWaterFountainMarker.name ? waterFoundationImgHighlighted : waterFountainImg, 
                scaledSize: new google.maps.Size(30, 30), 
                }}
        />
      ));
    };
  
  const getStationCoordinatesForRoute = (busRoute) => {
    const routeStations = busDetails[busRoute].station;
    const stationCoordinates = [];
  
    routeStations.forEach(stationName => {
      const stationObj = stationLocation.find(obj => obj.hasOwnProperty(stationName));
      if (stationObj) {
        const { lat, lng } = stationObj[stationName];
        stationCoordinates.push({ name: stationName, lat, lng });
      }
    });
  
    return stationCoordinates;
  };

  const createBusStationMarkers = (busRoute, startStation, endStation) => {
    const busStationInfo = getStationCoordinatesForRoute(busRoute);
    return busStationInfo.map((marker, index) => {
      let iconUrl = (marker.name.trim().toLowerCase() === startStation.trim().toLowerCase() || 
               marker.name.trim().toLowerCase() === endStation.trim().toLowerCase()) ? 
               busStopImg : busStopGrey;

      console.log("inside createBusStationMarkers marker.name is", marker.name , "startStation is", startStation, "endStation is", endStation)
      const makerFullname = getFullPlaceName(marker.name)
      return (
        <MarkerF
          key={marker.name + index}
          position={{ lat: marker.lat, lng: marker.lng }}
          title={makerFullname}
          onClick={() => handleMarkerClick(marker)}
          icon={{
            url: iconUrl,
            scaledSize: new google.maps.Size(28, 40) // Adjust size as needed
          }}
        />
      );
    });
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
          p={0.5} 
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
              paddingBottom: showOriginSearch ? '12px' : '0',
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
            {activeInput === "origin" && <RenderSuggestions suggestions={suggestions} activeInput={activeInput} showOriginSearch={showOriginSearch} selectPlace={selectPlace}/>}
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
            {activeInput === "destination" && <RenderSuggestions suggestions={suggestions} activeInput={activeInput}  showOriginSearch={showOriginSearch} selectPlace={selectPlace}/>}
          </Box>
         

          <Box display="flex" justifyContent="space-between"  paddingLeft={1} paddingRight= {1.6}mt={1.4}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    size="small" 
                    style={{
                            display: "relative",
                            left: "34%",
                            borderRadius: "8px", 
                          }} 
                    onClick = { NLPSearchToggle ? () => {handleNLPQuery()} :
                                                  () => {handleSearch() 
                                                          // getNearestBuilding(originCoord)
                              }}>
                    <span style={{ fontSize: 14, marginRight: 7 }}>
                          Search
                    </span>
                    <FaMagnifyingGlass size={20}/>
                
                </Button>
                <IconButton onClick={clearRoute} size="small" >
                    <FaTimes size={22}/>
                </IconButton>

          </Box>
 
        
          <Box position="relative"
            style={{
              maxHeight: afterSearch ? '36px' : '0',  
              transition: 'all 0.1s ease-out', // Adjust timing and easing as needed
              opacity: afterSearch ? 1 : 0,
              // paddingBottom: showOriginSearch ? '15px' : '0',
              paddingTop: afterSearch ? '8px' : '0 ',
              display: "flex",
              justifyContent: "center",
            }}>
              <IconButton style={{borderRadius: "20px ", backgroundColor: travelType === "walk" ? "#98cefa" : "#c7c7c7" ,color:"black", height: "29px" , fontSize:"16px", marginRight:"15px"}} onClick={()=> handleWalkButtonClick() }>
                                      <FaPersonWalking size={20} style={{marginRight:"1px"}}/>
                                      {walkDuration} min
              </IconButton>
              <IconButton style={{borderRadius: "20px ", backgroundColor: travelType === "bus" ? "#98cefa" : "#c7c7c7",color:"black", height: "29px" , fontSize:"16px" , textAlign:"center"}}  onClick={()=> handleBusButtonClick()}>
                                      <FaBusSimple size={20} style={{marginRight:"4px"}}/>
                                      {busList && busList.length > 0 ? `${busList[0].timeForTotalBusTrip} min` : ""  }
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
                    customLocation={{
                      latitude: 22.419498460232973,
                      longitude: 114.207202570846
                  }}
                />)
          }
          {renderToiletMarkers()}
          {renderWaterFountainMarkers()}
          {/* {travelType === "bus" ?renderBusStationMarkers() : null} */}

          {travelType === "walk" ? renderWalkDirectionsResponse() : renderBusDirectionsResponse()}    

      

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
            destinationName={destinationName}
            travelType={travelType}
            busList={busList}
            onSelectBusRoute={onSelectBusRoute}
            originName={originName}
        />
        
      </Box>


      {/* Toggle Toilet Layer Button */}
      {/* <Box 
        position="absolute" 
        bottom="5%" 
        left="50%" 
        transform="translateX(-50%)">
        <Button variant="contained" color="primary" onClick={() => setShowToiletMarkers(!showToiletMarkers)}>
          Toggle Toilet Layer
        </Button>
        <Button variant="contained" color="primary" onClick={() => showBusRoute({ lat: 22.415917172642065, lng: 114.211104527007 }, {lat: 22.419788004309634, lng: 114.20867167235077} )}>
          show bus route
        </Button>
        <Button variant="contained" color="primary" onClick={() =>{  setOriginCoord([22.416390590230055, 114.2106063761265]) 
                                                                    getNearestBuilding(originCoord)}}>
          show nearest building
        </Button>
      </Box> */}
    

    </Box>
           
    );
};

export default HomePage;
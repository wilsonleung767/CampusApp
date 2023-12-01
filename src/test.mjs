import { stationLocation } from "./data/Places.mjs";
import { busDetails } from "./data/busDetails.mjs";
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

// Example usage for busRoute "1A"
const route1AStations = getStationCoordinatesForRoute("1A");

console.log(route1AStations);



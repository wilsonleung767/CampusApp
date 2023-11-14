import { busDetails } from "../../data/busDetails.mjs";
import { timeTable } from "../../data/timeTable.mjs";

function findFirstStationOccurrence(route, station) {
    if (!busDetails[route]) {
        console.error("Route not found");
        return null;
    }

    const stations = busDetails[route].station;
    const matchingStation = stations.find(s => s.startsWith(station + '|') || s === station);

    return matchingStation || null; // Returns null if no matching station is found
}


// function normalizeName(stationName){
//     // Remove extra characters like "|" or anything after it
//     return stationName.split('|')[0];
// }

export function calculateBusDuration(route, startStation, endStation) {
    const StartStation = findFirstStationOccurrence(route,startStation)
    const EndStation = findFirstStationOccurrence(route,endStation)

    console.log(StartStation, EndStation)
    if (!timeTable[StartStation] || !timeTable[EndStation]) {
        console.error("Station not found in timeTable");
        return null;
    }

    let departures = timeTable[StartStation][route];
    let arrivals = timeTable[EndStation][route];

    if (!departures || !arrivals) {
        console.error("Route not found in station timeTable");
        return null;
    }

    // Find the first departure and arrival times
    let firstDepartureTime = departures[0];
    let firstArrivalTime = arrivals[0];

    if (!firstDepartureTime || !firstArrivalTime) {
        console.error("No matching times found for route");
        return null;
    }

    // Convert times to Date objects
    let departureTime = parseTime(firstDepartureTime);
    let arrivalTime = parseTime(firstArrivalTime);

    // Calculate duration in minutes
    let duration = (arrivalTime - departureTime) / (1000 * 60); // Convert milliseconds to minutes

    return Math.ceil(duration);
}  // return the duration in minutes after rounded up


function parseTime(timeStr) {
    const [time, station] = timeStr.split('|');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds, 0);
    return date;
}


// Example usage
let duration = calculateBusDuration("1A", "MTR", "SHHC");
console.log("Duration:", duration, "minutes");
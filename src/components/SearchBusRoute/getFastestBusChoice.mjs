// find the 
// - least time for the whole trip ( walk + take bus time + walk)
// - earliest arrival
import { parseTime } from "./calculateBusDuration.mjs";
import { timeTable } from "../../data/timeTable.mjs";
import { calculateBusDuration } from "./calculateBusDuration.mjs";
import { getBusRoute } from "./getBusRoute.mjs";

export function getFastestBusChoice(busRouteList, timeOfOriginToStation, timeOfDepartureToDest) {
    let busChoices = [];
    let currentTime = new Date("2023-11-16T18:09:23.813Z");

    busRouteList.forEach(bus => {
        const route = bus.busRoute;
        const startStation = bus.startStation;
        const endStation = bus.endStation;

        const nextDeparture = findNextDepartureTime(route, startStation, currentTime, timeOfOriginToStation);
        if (nextDeparture) {
            // Parse the departure time in UTC to align with currentTime
            const departureDateTime = parseTimeToUTC(nextDeparture, currentTime);
            const waitBusTime = (departureDateTime - currentTime) / 60000; // Waiting time in minutes
            const busTravelDuration = calculateBusDuration(route, startStation, endStation);

            if (busTravelDuration !== null) {
                const arrivalTime = new Date(departureDateTime.getTime() + busTravelDuration * 60000); // Convert minutes to milliseconds
                const totalTripTime = timeOfOriginToStation + waitBusTime + busTravelDuration + timeOfDepartureToDest;

                busChoices.push({
                    route: route,
                    status: "working",
                    totalTripTime: Math.ceil(totalTripTime),
                    departureTime: departureDateTime,
                    arrivalTime: arrivalTime
                });
            }
        }
        else{
            busChoices.push({
                route:route,
                status: "stopped",
                totalTripTime:10000
            })
        }
    });



    // Sort bus choices by total trip time
    busChoices.sort((a, b) => a.totalTripTime - b.totalTripTime);

    return busChoices;
}

function findNextDepartureTime(route, startStation, currentTime, timeOfOriginToStation) {
    if (!timeTable[startStation] || !timeTable[startStation][route]) {
        console.error("Route or station not found in timeTable");
        return null;
    }

    let departures = timeTable[startStation][route];

    // Convert currentTimeStr to a Date object and adjust for walking time
    // let currentTime = new Date(currentTimeStr); 
    let adjustedCurrentTime = new Date(currentTime.getTime() + timeOfOriginToStation * 60000);

    // Convert each departure time to UTC for comparison
    for (let departure of departures) {
        let departureTime = parseTimeToUTC(departure, currentTime); // Adjusting the function to parse to UTC
        if (departureTime >= adjustedCurrentTime) {
            return departure;
        }
    }

    return null; // No suitable departure time found
}

function parseTimeToUTC(timeStr, referenceTime) {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    const date = new Date(referenceTime);
    date.setUTCHours(hours, minutes, seconds, 0);
    return date;
}

// console.log(findNextDepartureTime("1A", "MTR", currentTime, 3));
export function getCurrentTimeInHongKong() {
    const currentTimeUTC = new Date(); // Current time in UTC
    const offsetInHours = 8; // Hong Kong is UTC+8
    const oneHourInMilliseconds = 3600000; // Number of milliseconds in one hour

    // Calculate Hong Kong time
    const currentTimeInHongKong = new Date(currentTimeUTC.getTime() + offsetInHours * oneHourInMilliseconds);

    return currentTimeInHongKong;
}

const currentTime = "2023-11-16T18:09:23.813Z";
console.log("Current time in Hong Kong:", currentTime);
console.log(getFastestBusChoice(getBusRoute("YIAP", "ULIB", "TD"), currentTime, 2,3))
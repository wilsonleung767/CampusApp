// find the 
// - least time for the whole trip ( walk + take bus time + walk)
// - earliest arrival
import { parseTime } from "./calculateBusDuration.mjs";
import { timeTable } from "../../data/timeTable.mjs";
import { calculateBusDuration } from "./calculateBusDuration.mjs";
import { getBusRoute } from "./getBusRoute.mjs";

function getFastestBusChoice(busRouteList, currentTimeStr, timeOfOriginToStation, timeOfDepartureToDest) {
    let busChoices = [];
    let currentTime = new Date(currentTimeStr);

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
                    totalTripTime: totalTripTime,
                    departureTime: departureDateTime,
                    arrivalTime: arrivalTime
                });
            }
        }
    });

    // Sort bus choices by total trip time
    busChoices.sort((a, b) => a.totalTripTime - b.totalTripTime);

    return busChoices;
}

function findNextDepartureTime(route, startStation, currentTimeStr, timeOfOriginToStation) {
    if (!timeTable[startStation] || !timeTable[startStation][route]) {
        console.error("Route or station not found in timeTable");
        return null;
    }

    let departures = timeTable[startStation][route];

    // Convert currentTimeStr to a Date object and adjust for walking time
    let currentTime = new Date(currentTimeStr); 
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

const currentTime = "2023-11-15T15:10:00.000Z";
// console.log(findNextDepartureTime("1A", "MTR", currentTime, 3));

console.log(getFastestBusChoice(getBusRoute("YIAP", "ULIB", "TD"), currentTime, 2,3))
// find the 
// - least time for the whole trip ( walk + take bus time + walk)
// - earliest arrival



// Works fine
import { timeTable } from "../../data/timeTable.mjs";
import { calculateBusDuration } from "./calculateBusDuration.mjs";


export function calculateTripDurationByBus(busRoute, startStation, endStation, timeOfOriginToStation, timeOfDepartureToDest) {
    let busDetails = null;
    // let currentTime = getCurrentTimeInHongKong();
    const currentTime = new Date("2023-11-17T13:09:23.813Z")
    const upcomingDepartures = findNextDepartureTime(busRoute, startStation, currentTime);

    if (upcomingDepartures.length > 0) {
        const nextDeparture = upcomingDepartures[0]; // Nearest bus
        const departureDateTime = parseTimeToUTC(nextDeparture, currentTime);
        const waitBusTime = (departureDateTime - currentTime) / 60000; // Waiting time in minutes
        const busTravelDuration = calculateBusDuration(busRoute, startStation, endStation);

        if (busTravelDuration !== null) {
            const arrivalTime = new Date(departureDateTime.getTime() + busTravelDuration * 60000);
            const totalTripTime = timeOfOriginToStation + waitBusTime + busTravelDuration + timeOfDepartureToDest;

            busDetails = {
                busRoute: busRoute,
                status: "working",
                busTravelDuration: busTravelDuration,
                totalTripTime: Math.ceil(totalTripTime),
                departureTime: departureDateTime,
                arrivalTime: arrivalTime,
                upcomingDepartures: upcomingDepartures // Adding upcoming departures
            };
        }
    } else {
        busDetails = {
            busRoute: busRoute,
            status: "stopped",
            totalTripTime: 10000,
            upcomingDepartures: [] // No upcoming departures
        };
    }

    return busDetails;
}


function findNextDepartureTime(busRoute, startStation, currentTime) {
    if (!timeTable[startStation] || !timeTable[startStation][busRoute]) {
        console.error("busRoute or station not found in timeTable");
        return null;
    }

    let departures = timeTable[startStation][busRoute];

    // Convert currentTimeStr to a Date object and adjust for walking time
    // let currentTime = new Date(currentTimeStr); 
    
    let adjustedCurrentTime = new Date(currentTime.getTime() );

    let upcomingDepartures = [];

    for (let departure of departures) {
        let departureTime = parseTimeToUTC(departure, currentTime); // Adjust to parse local time
        if (departureTime >= adjustedCurrentTime) {
            upcomingDepartures.push(departure);
            if (upcomingDepartures.length === 3) break; // Get only the next three departures
        }
    }

    return upcomingDepartures;
}

function parseTimeToUTC(timeStr, referenceTime) {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    const date = new Date(referenceTime);
    date.setUTCHours(hours, minutes, seconds, 0);
    return date;
}

// console.log(findNextDepartureTime("1A", "MTR", currentTime, 3));
function getCurrentTimeInHongKong() {
    const currentTimeUTC = new Date(); // Current time in UTC
    const offsetInHours = 8; // Hong Kong is UTC+8
  
    // Apply the offset to the UTC time
    currentTimeUTC.setUTCHours(currentTimeUTC.getUTCHours() + offsetInHours);
    return currentTimeUTC;
  }

  // const currentTime = getCurrentTimeInHongKong();
//   const currentTime = new Date("2023-11-17T13:09:23.813Z")
//   console.log(parseTimeToUTC("12:29:39",currentTime))
// console.log("Current time in Hong Kong:", currentTime.toISOString());
// console.log(findNextDepartureTime("1A", "MTR", currentTime));
console.log(calculateTripDurationByBus("1A","MTR", "SHHC", 1,1))


// {
//   busRoute: '1A',
//   status: 'working',
//   busTravelDuration: 8,
//   totalTripTime: 21,
//   departureTime: 2023-11-17T13:20:00.000Z,
//   arrivalTime: 2023-11-17T13:28:00.000Z,
//   upcomingDepartures: [ '13:20:00', '13:40:00', '14:20:00' ]
// }
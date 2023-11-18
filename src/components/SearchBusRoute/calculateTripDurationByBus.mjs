// find the 
// - least time for the whole trip ( walk + take bus time + walk)
// - earliest arrival

import { timeTable } from "../../data/timeTable.mjs";
import { calculateBusDuration } from "./calculateBusDuration.mjs";


export function calculateTripDurationByBus(busRoute,startStation, endStation, timeOfOriginToStation, timeOfDepartureToDest) {
    let busDetails= null;
    // let currentTime = new Date("2023-11-17T12:09:23.813Z");
    let currentTime = getCurrentTimeInHongKong()

   
    const nextDeparture = findNextDepartureTime(busRoute, startStation, currentTime, timeOfOriginToStation);
    if (nextDeparture) {
            // Parse the departure time in UTC to align with currentTime
            const departureDateTime = parseTimeToUTC(nextDeparture, currentTime);
            const waitBusTime = (departureDateTime - currentTime) / 60000; // Waiting time in minutes
            const busTravelDuration = calculateBusDuration(busRoute, startStation, endStation);

            if (busTravelDuration !== null) {
                const arrivalTime = new Date(departureDateTime.getTime() + busTravelDuration * 60000); // Convert minutes to milliseconds
                const totalTripTime = timeOfOriginToStation + waitBusTime + busTravelDuration + timeOfDepartureToDest;

                busDetails = {
                    busRoute: busRoute,
                    status: "working",
                    totalTripTime: Math.ceil(totalTripTime),
                    departureTime: departureDateTime,
                    arrivalTime: arrivalTime
                }
            }
        }
        else{
            busDetails ={
                busRoute:busRoute,
                status: "stopped",
                totalTripTime:10000
            }
        }
    

    // Sort bus choices by total trip time
    // busChoices.sort((a, b) => a.totalTripTime - b.totalTripTime);

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

    for (let departure of departures) {
        let departureTime = parseTimeToUTC(departure, currentTime); // Adjust to parse local time
        if (departureTime >= adjustedCurrentTime) {
            return departure;
        }
    }

    return null;
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


const currentTime = getCurrentTimeInHongKong();
// const currentTime = new Date("2023-11-17T16:09:23.813Z")
console.log("Current time in Hong Kong:", currentTime.toISOString());
console.log(findNextDepartureTime("1A", "MTR", currentTime));
// console.log(calculateTripDurationByBus("1A","MTR", "SHHC", 1,1))
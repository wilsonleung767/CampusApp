import { buildingStationPair } from "../../data/buildingStationPair.mjs";
import { busDetails } from "../../data/busDetails.mjs";
import { stationLocation } from "../../data/Places.mjs";


export function getCurrentTimeInHongKong() {
    const currentTimeUTC = new Date(); // Current time in UTC
    const offsetInHours = 8; // Hong Kong is UTC+8
    currentTimeUTC.setHours(currentTimeUTC.getUTCHours() + offsetInHours);
    return currentTimeUTC;
}



// Updated function to get the current weekday in Hong Kong
function getCurrentWeekdayInHongKong() {
    const currentTimeInHongKong = getCurrentTimeInHongKong();
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return weekdays[currentTimeInHongKong.getUTCDay()];
}

function isCurrentTimeWithinOperation(timeRange) {
    const customTime = new Date("2023-12-14T05:09:23.813Z");
    // const customTime = getCurrentTimeInHongKong();

    const currentHour = customTime.getHours();
    const currentMinute = customTime.getMinutes();

    const startTimeString = timeRange[0];
    const endTimeString = timeRange[1];

    const [startHour, startMinute] = startTimeString.split(':').map(Number);
    const [endHour, endMinute] = endTimeString.split(':').map(Number);

    // Create start and end times for comparison
    const startTime = new Date(customTime);
    startTime.setHours(startHour, startMinute, 0, 0); // Reset seconds and milliseconds to zero

    const endTime = new Date(customTime);
    endTime.setHours(endHour, endMinute, 0, 0); // Reset seconds and milliseconds to zero

    // Current time for comparison
    const currentTime = new Date(customTime);
    currentTime.setHours(currentHour, currentMinute, 0, 0); // Reset seconds and milliseconds to zero

    // Comparison
    return currentTime >= startTime && currentTime <= endTime;
}

export const getBusRoute = (startBuilding, endBuilding, isTeachingDay) => {
    let res = [];
    let startStations = buildingStationPair[startBuilding];
    let endStations = buildingStationPair[endBuilding];
    let inputWeekday = getCurrentWeekdayInHongKong() // Assuming this is a placeholder for the current weekday
    console.log(inputWeekday);

    for (let route in busDetails) {
        console.log("route:", route);
        let routeDetails = busDetails[route];
        let stops = routeDetails.station;
        let operatesOnTeachingDay = routeDetails.teachingDay.includes(isTeachingDay ? 'TD' : 'NT');
        let operatesOnWeekday = routeDetails.weekday.includes(inputWeekday);

        if (operatesOnTeachingDay && operatesOnWeekday && isCurrentTimeWithinOperation(routeDetails.time)) {
            let foundRoute = false;
            for (let startStation of startStations) {
                let startIndex = stops.findIndex(station => station.includes(startStation));
                if (startIndex !== -1) {
                    for (let endStation of endStations) {
                        let endIndex = stops.findIndex(station => station.includes(endStation));
                        if (endIndex !== -1 && endIndex > startIndex) {
                            let passedStations = stops.slice(startIndex, endIndex + 1);
                            let startStationLocation = getStationCoordinates(startStation, stationLocation);
                            let endStationLocation = getStationCoordinates(endStation, stationLocation);
                            res.push({
                                busRoute: route,
                                startStation: startStation,
                                endStation: endStation,
                                startStationLocation: startStationLocation,
                                endStationLocation: endStationLocation,
                                passedStations: passedStations
                            });
                            foundRoute = true;
                            break; // Found a valid route, no need to check other end stations
                        }
                    }
                    if (foundRoute) break; // Break out of startStation loop if a route is found
                }
            }
        }
    }

    return res;
}

function getStationCoordinates(stationName, stationLocationArray) {
    // First, try to find an exact match
    let stationObj = stationLocationArray.find(obj => obj.hasOwnProperty(stationName));
    if (stationObj) {
        return stationObj[stationName];
    } else {
        // If no exact match, find a station that starts with the stationName
        for (let obj of stationLocationArray) {
            let key = Object.keys(obj)[0];
            if (key.startsWith(stationName + "|")) {
                return obj[key];
            }
        }
    }
    return null;
}

// export default searchBusRoute;


console.log(getBusRoute("YIAP", "ULIB", "TD"))


// let timeRange = ['07:30', '18:40']; // Example time range
// let isWithinOperation = isCurrentTimeWithinOperation(timeRange);
// console.log(isWithinOperation);

// [
//     { busRoute: '2', startStation: 'MTRP', endStation: 'UADM' },
//     { busRoute: '3', startStation: 'YIAP', endStation: 'SCIC' },
//     { busRoute: '4', startStation: 'YIAP', endStation: 'UADM' },
//     { busRoute: '5', startStation: 'CCTEA', endStation: 'SHAWHALL' },
//     { busRoute: '1A', startStation: 'MTR', endStation: 'UADM' },
//     { busRoute: '1B', startStation: 'MTR', endStation: 'SHAWHALL' },
//     { busRoute: '2#', startStation: 'MTRP', endStation: 'SHAWHALL' },
//     { busRoute: 'N', startStation: 'MTR', endStation: 'SHAWHALL' },
//     { busRoute: 'N#', startStation: 'MTR', endStation: 'SHAWHALL' },
//     { busRoute: '5#', startStation: 'CCTEA', endStation: 'SHAWHALL' }
//   ]
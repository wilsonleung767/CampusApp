import { buildingStationPair } from "../../data/buildingStationPair.mjs";
import { busDetails } from "../../data/busDetails.mjs";

const referenceDate = new Date();
referenceDate.setFullYear(2000, 0, 1);

const searchBusRoute = (startBuilding, endBuilding,  isTeachingDay) => {
    let resRoute = [];
    let startStations = buildingStationPair[startBuilding];
    let endStations = buildingStationPair[endBuilding];

    // Parse the input time for comparison
    let inputTime = new Date();
    inputTime = adjustDateToMatch(inputTime);
    
    let inputWeekday= new Date();
    inputWeekday = getCurrentWeekday(inputWeekday)
    
    // Find a route considering the direction, time, and day
    for (let route in busDetails) {
        let routeDetails = busDetails[route];
        let stops = routeDetails.station;
        let operatingTime = parseTimeRange(routeDetails.time);
        let operatesOnTeachingDay = routeDetails.teachingDay.includes(isTeachingDay ? 'TD' : 'NT');
        let operatesOnWeekday = routeDetails.weekday.includes(inputWeekday);

        // Check if the route operates at the given time and day
        if (operatesOnTeachingDay && operatesOnWeekday && isWithinTimeRange(inputTime, operatingTime)) {
            for (let startStation of startStations) {
                if (stops.includes(startStation)) {
                    let startIndex = stops.indexOf(startStation);
                    for (let endStation of endStations) {
                        if (stops.includes(endStation) && stops.indexOf(endStation) > startIndex) {
                            resRoute.push(route);
                            break; // Found a valid route, no need to check other end stations
                        }
                    }
                }
            }
        }
    }

    return resRoute; // Return the list of routes
}


console.log(searchBusRoute("YIAP", "ULIB", "TD"))

// Helper functions to parse time and check if a given time is within the operating time range

function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const time = new Date(referenceDate); // Using the reference date
    time.setHours(hours, minutes, 0, 0); // Sets hours, minutes, seconds, milliseconds
    return time;
}


function parseTimeRange(timeRange) {
    return timeRange.map(timeStr => parseTime(timeStr));
}

function isWithinTimeRange(time, timeRange) {
    const [startTime, endTime] = timeRange;
    return time >= startTime && time <= endTime;
}

function adjustDateToMatch(inputTime) {
    return new Date(
        referenceDate.getFullYear(), 
        referenceDate.getMonth(), 
        referenceDate.getDate(),
        inputTime.getHours(),
        inputTime.getMinutes(),
        inputTime.getSeconds()
    );
}

function getCurrentWeekday(inputWeekday) {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayOfWeek = weekdays[inputWeekday.getDay()];
    return dayOfWeek;
}
// Example usage
// let inputTime = new Date();
// let operatingTime = parseTimeRange(["07:30", "18:40"]);
// inputTime = adjustDateToMatch(inputTime);
// console.log(inputTime)
// console.log(operatingTime)
// console.log(isWithinTimeRange(inputTime,operatingTime))



import { buildingStationPair } from "../../data/buildingStationPair.mjs";
import { busDetails } from "../../data/busDetails.mjs";


const referenceDate = new Date();
referenceDate.setFullYear(2000, 0, 1);

function getCurrentTimeInHongKong() {
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

export const getBusRoute = (startBuilding, endBuilding, isTeachingDay) => {
    let res = [];
    let startStations = buildingStationPair[startBuilding];
    let endStations = buildingStationPair[endBuilding];

    // Parse the input time for comparison

    let inputWeekday = getCurrentWeekdayInHongKong();
    console.log(inputWeekday);


    // Find a route considering the direction, time, and day
    for (let route in busDetails) {
        let routeDetails = busDetails[route];
        let stops = routeDetails.station;
        let operatesOnTeachingDay = routeDetails.teachingDay.includes(isTeachingDay ? 'TD' : 'NT');
        let operatesOnWeekday = routeDetails.weekday.includes(inputWeekday);

        // Check if the route operates at the given time and day
        if (operatesOnTeachingDay && operatesOnWeekday ) {
            for (let startStation of startStations) {
                if (stops.includes(startStation)) {
                    let startIndex = stops.indexOf(startStation);
                    for (let endStation of endStations) {
                        if (stops.includes(endStation) && stops.indexOf(endStation) > startIndex) {
                            res.push({
                                busRoute: route,
                                startStation: startStation,
                                endStation: endStation
                            });
                            break; // Found a valid route, no need to check other end stations
                        }
                    }
                }
            }
        }
    }

    return res; // Return the list of routes with their start and end stations
    // e.g. { busRoute: '2#', startStation: 'MTRP', endStation: 'SHAWHALL' }
}

// export default searchBusRoute;


console.log(getBusRoute("YIAP", "ULIB", "TD"))


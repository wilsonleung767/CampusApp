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

    let inputWeekday = "Thu"; // Assuming this is a placeholder for the current weekday
    console.log(inputWeekday);

    for (let route in busDetails) {
        console.log("route:", route);
        let routeDetails = busDetails[route];
        let stops = routeDetails.station;
        let operatesOnTeachingDay = routeDetails.teachingDay.includes(isTeachingDay ? 'TD' : 'NT');
        let operatesOnWeekday = routeDetails.weekday.includes(inputWeekday);

        if (operatesOnTeachingDay && operatesOnWeekday) {
            let foundRoute = false;
            for (let startStation of startStations) {
                let startIndex = stops.findIndex(station => station.includes(startStation));
                if (startIndex !== -1) {
                    for (let endStation of endStations) {
                        let endIndex = stops.findIndex(station => station.includes(endStation));
                        if (endIndex !== -1 && endIndex > startIndex) {
                            let passedStations = stops.slice(startIndex, endIndex + 1);
                            res.push({
                                busRoute: route,
                                startStation: startStation,
                                endStation: endStation,
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

// export default searchBusRoute;


console.log(getBusRoute("MTR", "ULIB", "TD"))



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
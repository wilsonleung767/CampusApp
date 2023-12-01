import { buildingStationPair } from "../data/buildingStationPair.mjs";
import { customPlaces,stationLocation } from "../data/Places.mjs";
export function pairPlaceAlias(buildingFullName) {
    for (let alias in buildingStationPair) {
        if (buildingFullName.includes(alias)) {
            console.log(`Found alias from pairPlaceAlias function: ${alias}`);
            return alias;
        }
    }

    // If no alias is found in the buildingFullName
    console.log('No alias found for', buildingFullName);
    return null;
}

// Example usage
// let buildingFullName = "University Library (ULIB)";
// let result = pairPlaceAlias(buildingFullName);
// console.log(result);


export function getFullPlaceName(alias) {
    const places = [
      ...customPlaces,
      ...stationLocation
    ];

    for (const place of places) {
      const [name] = Object.keys(place);
      if (name.toLowerCase().includes(alias.toLowerCase())) {
        let fullName = name.substring(0, name.indexOf('(')).trim();
        return fullName;
      }
    }
    return null;
  }

  // console.log(getFullPlaceName("SHAWHALL"))
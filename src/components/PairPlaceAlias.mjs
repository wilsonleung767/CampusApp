import { buildingStationPair } from "../data/buildingStationPair.mjs";
import { customPlaces,stationLocation } from "../data/Places.mjs";
export function pairPlaceAlias(buildingFullName) {
  for (let alias in buildingStationPair) {
      // Create a regular expression to match the alias with word boundaries
      let regex = new RegExp(`\\b${alias}\\b`, 'i');

      if (regex.test(buildingFullName)) {
          console.log(`Found alias from pairPlaceAlias function: ${alias}`);
          return alias;
      }
  }

  // If no alias is found in the buildingFullName
  console.log('No alias found for', buildingFullName);
  return null;
}

// Example usage
let buildingFullName = "Benjamin Franklin Centre Coffee Corner (COFFEE CON,BFCCC)";
let result = pairPlaceAlias(buildingFullName);
console.log(result);


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
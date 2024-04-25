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
// let buildingFullName = "Benjamin Franklin Centre Coffee Corner (COFFEE CON,BFCCC)";
// let result = pairPlaceAlias(buildingFullName);
// console.log(result);


export function getFullPlaceName(alias) {
    const places = [
      ...customPlaces,
      ...stationLocation
    ];

   // Split the alias at the "|" symbol and use the first part for matching
   const mainAlias = alias.split('|')[0].trim();

   for (const place of places) {
       const [name] = Object.keys(place);
       if (name.toLowerCase().includes(mainAlias.toLowerCase())) {
           // Assuming the full name is before any '(' character in the place's name
           let fullName = name.substring(0, name.indexOf('(')).trim();
           return fullName;
       }
   }
   return null;
  }

  export function getFullPlaceNameWithAlias(alias){
    const places = [
      ...customPlaces,
      ...stationLocation
    ];
    for (const place of places) {
      const [name] = Object.keys(place);
      if (name.toLowerCase().includes(alias.toLowerCase())) {
        return name;
      }
    }
    return null;
  }


  // console.log(getFullPlaceName("SCIC"))
  // console.log(getFullPlaceNameWithAlias("SCIC"))
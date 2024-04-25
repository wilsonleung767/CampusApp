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
   const mainAlias = alias.split('|')[0].trim().toLowerCase();

    for (const place of places) {
        const [name] = Object.keys(place);
        // Using regular expression to match alias inside parentheses or elsewhere in the name
        if (new RegExp(`\\b${mainAlias}\\b`, 'i').test(name)) {
            // Returns the full name before any ' (' character if present, otherwise returns the entire name
            let fullName = name.includes('(') ? name.substring(0, name.indexOf(' (')).trim() : name.trim();
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
    // Normalize the alias and prepare for regular expression matching
    const normalizedAlias = alias.trim().toLowerCase();

    for (const place of places) {
        const [name] = Object.keys(place);
        // Use a regular expression to match the alias anywhere in the name, enclosed by word boundaries
        if (new RegExp(`\\b${normalizedAlias}\\b`, 'i').test(name)) {
            return name;
        }
    }
    return null;
  }

  export function removeTextInParentheses(inputString) {
    // This regular expression matches any text between parentheses including the parentheses themselves
    return inputString.replace(/\s*\([^()]*\)\s*/g, ' ').trim();
}

  // console.log(getFullPlaceName("ULIB"))
  // console.log(getFullPlaceNameWithAlias("New Asia College (NAC)"))
  // console.log(removeTextInParentheses("New Asia College (NAC)"))
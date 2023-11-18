import { buildingStationPair } from "../data/buildingStationPair.mjs";

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
let buildingFullName = "University Library (ULIB)";
let result = pairPlaceAlias(buildingFullName);
console.log(result);



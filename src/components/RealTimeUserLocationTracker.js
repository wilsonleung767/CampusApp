import React, {useEffect, useRef} from "react";

const RealTimeUserLocationTracker = ({onLocationUpdate, isLoaded, map}) => {
    const blueDot = {
        path: 'M 0, 0 m -8, 0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0',
        fillColor: "#4285F4",
        fillOpacity: 1,
        scale: 1,
        strokeColor: "white",
        strokeWeight: 2
      };
    const marker = useRef(null);
    const accuracyCircle = useRef(null);
  
    useEffect(() => {
          if (!isLoaded) {
              return;
          }
  
        let watcher = null;
        if ("geolocation" in navigator) {
            watcher = navigator.geolocation.watchPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    const currentLocation = { lat: latitude, lng: longitude };
                    const { heading } = position.coords;

                    console.log("Inside RealTimeUserLocationTracker: curr loc is", currentLocation)
                    onLocationUpdate([latitude, longitude]);
                      

                    
                      // Update or create marker
                      if (marker.current) {
                          marker.current.setPosition(currentLocation);
                      } else {
                          marker.current = new window.google.maps.Marker({
                              position: currentLocation,
                              map: map,
                              icon: blueDot,
                              title: 'You are here!'
                          });
                      }
  
                      // Update or create accuracy circle
                      const maxRadius = 100; 
                      if (accuracyCircle.current) {
                          accuracyCircle.current.setMap(null);
                      }
                      accuracyCircle.current = new window.google.maps.Circle({
                          center: currentLocation,
                          fillColor: "#61a0bf",
                          fillOpacity: 0.4,
                          radius: Math.min(position.coords.accuracy, maxRadius),
                          strokeColor: "#1bb6ff",
                          strokeOpacity: 0.4,
                          strokeWeight: 1,
                          zIndex: 1,
                          map: map
                      });
                  },
                  error => {
                      console.error("Error watching position:", error);
                  },
                  {
                      enableHighAccuracy: true,
                      timeout: 5000,
                      maximumAge: 0,
                  }
              );
          }
  
          return () => {
              if (watcher) {
                  navigator.geolocation.clearWatch(watcher);
              }
          };
      }, [isLoaded, map, onLocationUpdate]);
  
      return null; // This component does not render anything itself

}

export default RealTimeUserLocationTracker;
import React, { useEffect, useState } from 'react';
import "./InfoPage.css";
import { Button, IconButton, Box, TextField, Typography, ButtonGroup , InputAdornment, Icon} from "@mui/material";
import { FaPersonWalking } from "react-icons/fa6";
import { FaBusSimple } from "react-icons/fa6";
import { FaLocationDot } from "react-icons/fa6";
import { MdKeyboardArrowRight } from "react-icons/md";



function InfoPage({ show, travelType, busList, onSelectBusRoute ,originName, destinationName}) {
    const [isDragging, setIsDragging] = useState(false);
    const [lastTouchY, setLastTouchY] = useState(0);
    const [infoPageHeight, setInfoPageHeight] = useState('45dvh'); // Initial height

    const handleTouchStart = (e) => {
        setIsDragging(true);
        setLastTouchY(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const touchY = e.touches[0].clientY;
        const delta = lastTouchY - touchY;

        // Update the height based on the delta
        // You can adjust the min and max values as per your requirement
        setInfoPageHeight(prevHeight => {
            let newHeight = Math.min(Math.max(parseInt(prevHeight) + delta, 20), 100);
            return `${newHeight}dvh`;
        });
        
        setLastTouchY(touchY);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        // Snap to closest position
        setInfoPageHeight(prevHeight => {
            const height = parseInt(prevHeight);
            if (height > 32.5) return '45dvh'; // Close to 45%
            if (height > 10) return '17dvh'; // Close to 17%
            return '0dvh'; // Otherwise, consider it closed
        });
    };

       const extractDestinationParts = (destinationName) => {
        const regex = /^(.*?)\s*\((.*?)\)$/; // Regular expression to match full name and nickname
        const matches = destinationName.match(regex);
        if (matches && matches.length === 3) {
            return {
                fullName: matches[1],
                nickName: matches[2],
            };
        } else {
            // If the regular expression doesn't match, treat the whole name as full name
            return {
                fullName: destinationName,
                nickName: "", // No nickname
            };
        }
    };

    const { fullName, nickName } = extractDestinationParts(destinationName);
    
    const BusInfoSection = ({ bus, index, originName, destinationName }) => {
        const [waitingTime, setWaitingTime] = useState(0);

        useEffect(() => {
            const updateWaitingTime = () => {
                const currentTime = new Date("2023-11-17T13:03:23.813Z");
                const departureTime = new Date(bus.departureTime);
                const newWaitingTime = Math.max(0, Math.ceil((departureTime - currentTime) / (1000 * 60)));
                setWaitingTime(newWaitingTime); // Update waiting time in minutes
            };
    
            // Initial update
            updateWaitingTime();
    
            // Set an interval to update waiting time every minute
            const intervalId = setInterval(updateWaitingTime, 60000); // 60,000 milliseconds = 1 minute
    
            // Clean up interval on component unmount
            return () => clearInterval(intervalId);
        }, [bus.departureTime]);
        
        return (
        <Box
            style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "10px",
                marginTop: "15px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                backgroundColor: "white",
            }}
        >
                <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="10px">
                    <Typography variant="body1">
                        <FaPersonWalking style={{ marginRight: "5px" }} />
                        Walk to <FaLocationDot color="blue" /> {bus.startStation} station
                    </Typography>
                    <Typography variant="body1" style={{ fontWeight: "bold" }}>
                        {bus.timeFromOriginToStation} min
                    </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="10px">
                    
                    <Box style={{display:"flex", alignItems:"center"}}>
                    <Typography variant="body1">
                        Take
                    </Typography> <FaBusSimple style={{ marginLeft:"5px", marginRight: "3px" }} />
                        <Box style={{ backgroundColor: "red", padding: "0 5px", borderRadius: "4px" }}>
                            <Typography variant="body1" style={{ color: "white", textAlign: "center" }}>
                                {bus.route}
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="body1" style={{ fontWeight: "bold", color: "#4caf50" }}>
                        Coming in {waitingTime} min
                    </Typography>
                </Box>
                <Typography variant="body1" marginLeft="20px" marginBottom="10px">
                    More Buses at
                    {bus.upcomingDepartures.slice(1).map((time, index) => (
                        <Box key={index} component="span" mx="8px" bgcolor="#f0f0f0" px="5px" borderRadius="4px">
                            {time.slice(0, 5)}
                        </Box>
                    ))}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1">
                        <FaPersonWalking style={{ marginRight: "5px" }} />
                        Walk to <FaLocationDot color="red" /> {destinationName}
                    </Typography>
                    <Typography variant="body1" style={{ fontWeight: "bold" }}>
                        {bus.timeFromDepartureToDest} min
                    </Typography>
                </Box>
        </Box>
            );
        };

    useEffect(()=>{
        console.log("inside infopage originName",originName , "destinationName",destinationName)}
    ,[destinationName,originName])
    
    return (
        <div 
            className={`info-page ${show ? 'open' : ''}`}
            style={{ height: infoPageHeight }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {travelType === "walk" && (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" width="100%">
                    <div className="info-page-handle" />
                    <Typography mt={2.4} variant="h6">Walking Directions</Typography>
                    <Typography variant="body1">Destination: {fullName}</Typography>
                    <Typography variant="body1">Nickname: {nickName}</Typography>
                    {/* Add any additional information related to walking directions here */}
                </Box>
            )}

            {travelType === "bus" && (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" width="100%">
                    <div className="info-page-handle" />
                    <Typography mt={2.4} variant="h6">CU Bus</Typography>

                    {busList.map((bus, index) => (
                        <Box width="93%">

                            <Box key={index} className="route-choice"  onClick={() => onSelectBusRoute(bus)}>
                                            {/* Walking to Station */}
                                <Box display="flex" alignItems="center">
                                                <FaPersonWalking style={{ marginRight: "3px" }} />
                                                <Typography variant="body1">{bus.timeFromOriginToStation}</Typography>
                                </Box>
                                            
                                            {/* Arrow Icon */}
                                            <MdKeyboardArrowRight/>

                                            {/* Bus Route */}
                                            <Box display="flex" alignItems="center">
                                                <FaBusSimple style={{ marginRight: "3px" }} />
                                                <Box bgcolor="red" px={0.5} borderRadius="4px">
                                                    <Typography variant="body1" color="white">
                                                        {bus.route}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Arrow Icon */}
                                            <MdKeyboardArrowRight />

                                            {/* Walking from Station */}
                                            <Box display="flex" alignItems="center">
                                                <FaPersonWalking style={{ marginRight: "5px" }} />
                                                <Typography variant="body1">{bus.timeFromDepartureToDest}</Typography>
                                            </Box>

                                            {/* Total Duration */}
                                            <Box ml={2}>
                                                <Typography variant="body1" fontWeight="bold">Duration: {bus.timeForTotalBusTrip} min</Typography>
                                            </Box>
                                        </Box>
                            <BusInfoSection bus={bus} index={index} originName={originName} destinationName={destinationName} />
                        </Box>
                    ))}
                </Box>
            )}
            
            </div>
                
    );
}

export default InfoPage;

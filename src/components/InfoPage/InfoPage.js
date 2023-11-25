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
        return (
            <Box
                style={{
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "10px",
                    marginTop: "10px",
                }}
            >
                <div>
                    <span>Walk by red line to {bus.startStation} station</span>
                    <span style={{ float: "right" }}>{bus.timeFromOriginToStation} min</span>
                </div>
                <div>
                    <span>Take bus {bus.route}</span>
                    <span style={{ float: "right" }}>{bus.busTravelDuration} min</span>
                </div>
                <div>
                    <span>
                        Get off at {bus.endStation}, walk by blue line to{" "}
                        <FaLocationDot color="red" /> {destinationName}
                    </span>
                    <span style={{ float: "right" }}>{bus.timeFromDepartureToDest} min</span>
                </div>
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
                        <Box width="90%">

                        <Box key={index} className="route-choice"  onClick={() => onSelectBusRoute(bus)}>
                            <Box display="flex" alignItems="center">
                                <FaPersonWalking />
                                <span style={{ fontSize: "15px" }}>{bus.timeFromOriginToStation} min</span> {/* Replace with actual data */}
                                <Box ml={2}><MdKeyboardArrowRight /> <FaBusSimple/>{bus.route} </Box>
                                <Box ml={2}><MdKeyboardArrowRight /> <FaPersonWalking className="route-choice-icon" /><span>{bus.timeFromDepartureToDest} min</span></Box> {/* Replace with actual data */}
                            </Box>
                            <Box>
                                Duration: {bus.timeForTotalBusTrip} {/* Display total trip time */}
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

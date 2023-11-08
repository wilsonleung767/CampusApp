import React, { useState } from 'react';
import "./InfoPage.css";

function InfoPage({ show, originCoord, destinationCoord }) {
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
            return `${newHeight}vh`;
        });
        
        setLastTouchY(touchY);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        // Snap to closest position
        setInfoPageHeight(prevHeight => {
            const height = parseInt(prevHeight);
            if (height > 32.5) return '45dvh'; // Close to 45%
            if (height > 10) return '17dvh'; // Close to 20%
            return '0vh'; // Otherwise, consider it closed
        });
    };

    return (
        <div 
            className={`info-page ${show ? 'open' : ''}`}
            style={{ height: infoPageHeight }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Insert other destination details here */}
            <div className="info-page-handle" />
                <div className='content-area'>

                    <span>fdjsfjkds</span>
                    <span>fdjsfjkds</span>
                    <span>fdjsfjkds</span>
                    <span>fdjsfjkds</span>
                    <span>fdjsfjkds</span>
                </div>
            
                
        </div>
    );
}

export default InfoPage;

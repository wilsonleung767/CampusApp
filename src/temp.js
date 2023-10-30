<Box 
      position="relative" 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      height="100dvh" 
      width="100vw"
      >
        
      {/* Search & Control Area */}
      <Box 
          position="absolute" 
          top={12} 
          zIndex={10}
          p={0.8} 
          bgcolor="background.paper" 
          boxShadow="3"
          borderRadius={20}
          width="90%">
         <Box display="flex" flexDirection="column" alignItems="stretch">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <TextField
                  label="Origin"
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={originName}
                  onChange={(e) => setOriginName(e.target.value)}
                  inputRef={originInputRef}
              />
                <TextField
                  label="Destination"
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={destinationName}
                  onChange={(e) => setDestinationName(e.target.value)}
                  inputRef={destinationInputRef}
                />

            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Button 
                    variant="contained" 
                    color="primary" 
                    size="small" 
                    style={{ marginRight: '8px' }} 
                    onClick={()=>{
                       calculateRoute();
                       setShowInfoPage(true);
                    }}>
                    Go
                </Button>
                <IconButton onClick={clearRoute} size="small">
                    <FaTimes />
                </IconButton>
            </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" mt={2} alignItems="center">
          <Typography variant="body2">Distance: {distance}</Typography>
          <Typography variant="body2">Duration: {duration}</Typography>
          <IconButton size="small" onClick={() => {
            map.panTo(center);
            map.setZoom(15.59);
          }}>
            <FaLocationArrow />
          </IconButton>
        </Box>
      </Box>    

      {/* Google Map */}
      <Box 
        position="absolute"        
        height="100%" 
        width="100%">
        <GoogleMap
          key={mapKey}
          zoom={15.59}
          center={center}
          options={mapOptions}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          onLoad={map => setMap(map)}
          onClick={() => setShowInfoPage(false)}
          >

          {renderToiletMarkers()}
          {renderDirectionsResponse()}    
          {isInfoWindowVisible && (
            <InfoWindowComponent 
                marker={selectedMarker} 
                onClose={() => setIsInfoWindowVisible(false)}
                destinationCor
                />
          )}
      
        </GoogleMap>
        <InfoPage 
            show={showInfoPage} 
            originCor= {originCor}
            destinationCor = {destinationCor}
          />
        
      </Box>
import { InfoWindow } from "@react-google-maps/api";
const InfoWindowComponent = ({ marker, onClose }) => {
    if (!marker) return null;

    return (
        <InfoWindow
            position={{ lat: marker.lat, lng: marker.lng }}
            onCloseClick={onClose}
        >
            <div>
                <h4>{marker.name}</h4>
                <button onClick={() => {
                    setDestination(`${marker.lat}, ${marker.lng}`);
                    setDestinationName(marker.name);
                    onClose();
                    }}>
                    Choose as Destination
                </button>
            </div>
        </InfoWindow>
    );
};

export default InfoWindowComponent;
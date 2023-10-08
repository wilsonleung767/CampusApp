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
                {/* Additional content here */}
            </div>
        </InfoWindow>
    );
};

export default InfoWindowComponent;
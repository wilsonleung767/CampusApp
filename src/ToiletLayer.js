// class ToiletLayer extends google.maps.OverlayView {
//     constructor() {
//       super();
  
//       this.markers = [];
//     }
  
//     onAdd() {
//       const div = document.createElement('div');
//       div.classList.add('toilet-layer');
  
//       this.markers.forEach((marker) => {
//         div.appendChild(marker.getElement());
//       });
  
//       this.setMap(this.getMap());
//       this.div = div;
//     }
  
//     onRemove() {
//       this.div.parentNode.removeChild(this.div);
//       this.div = null;
//     }
  
//     addMarker(marker) {
//       this.markers.push(marker);
//       if (this.div) {
//         this.div.appendChild(marker.getElement());
//       }
//     }
  
//     removeMarker(marker) {
//       this.markers.splice(this.markers.indexOf(marker), 1);
//       if (this.div) {
//         this.div.removeChild(marker.getElement());
//       }
//     }
  
//     getMarkers() {
//       return this.markers;
//     }
//   }
  
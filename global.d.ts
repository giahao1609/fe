// ⚙️ Cho phép import module Mapbox GL CSS
declare module "mapbox-gl/dist/mapbox-gl.css";

// ⚙️ Cho phép import Mapbox Geocoder
declare module "@mapbox/mapbox-gl-geocoder" {
  const MapboxGeocoder: any;
  export default MapboxGeocoder;
}
declare module "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

// ⚙️ Cho phép import Mapbox Directions
declare module "@mapbox/mapbox-gl-directions" {
  const MapboxDirections: any;
  export default MapboxDirections;
}
declare module "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";

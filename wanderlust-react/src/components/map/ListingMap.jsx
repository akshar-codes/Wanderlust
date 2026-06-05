import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function ListingMap({ coordinates, title }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!coordinates || coordinates.length !== 2) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      console.warn("VITE_MAPBOX_TOKEN not set — map disabled");
      return;
    }

    mapboxgl.accessToken = token;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: coordinates,
      zoom: 9,
    });

    new mapboxgl.Marker({ color: "#fe424d" })
      .setLngLat(coordinates)
      .setPopup(new mapboxgl.Popup().setText(title || "Location"))
      .addTo(mapRef.current);

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      mapRef.current?.remove();
    };
  }, [coordinates, title]);

  if (!import.meta.env.VITE_MAPBOX_TOKEN) {
    return (
      <div className="map-placeholder">
        <p>Map unavailable — add VITE_MAPBOX_TOKEN to .env.local</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="listing-map" aria-label="Location map" />
  );
}

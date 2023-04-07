import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import './ParkFinderPage.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ParkFinderPage = () => {
  const [location, setLocation] = useState('')
  const [parks, setParks] = useState([])
  const [center, setCenter] = useState([37.7749, -122.4194])
  const [map, setMap] = useState(null);

  const mapRef = useRef();

  // This function is used to handle the form submission and retrieve park data based on the entered location.
  const handleSubmit = async (e) => {
    e.preventDefault() // Prevent the default form submission behavior

    try {
      // Fetch the location data from OpenStreetMap's Nominatim API
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`);
      const data = await response.json(); // Parse the response data into JSON

      const parkMarkers = []; // An empty array to store the park markers

      // Loop through each location returned from Nominatim API
      for (const loc of data) {
        const lat = loc.lat;
        const lon = loc.lon;

        // Fetch park data from OpenStreetMap's Overpass API
        const parkResponse = await fetch(`https://overpass-api.de/api/interpreter?data=[out:json];node(around:1000,${lat},${lon})[leisure=park];out;`);
        const parkData = await parkResponse.json();// Parse the response data into JSON

        // Map through the park data and create an array of park markers
        const locationMarkers = parkData.elements.map((element) => {
          return {
            position: [element.lat, element.lon], // Store the latitude and longitude of the park
            name: element.tags.name || 'Unnamed Park', // Store the name of the park, if it has one
            position: [element.lat, element.lon],
          };
        });

        // Push the park markers to the parkMarkers array
        parkMarkers.push(...locationMarkers);
      };

      // Update the state with the parkMarkers array
      setParks(parkMarkers);

      // Calculate the center of all park markers
      const totalLat = parkMarkers.reduce((sum, park) => sum + park.position[0], 0); // Sum all the latitude values
      const totalLon = parkMarkers.reduce((sum, park) => sum + park.position[1], 0); // Sum all the longitude values
      const avgLat = totalLat / parkMarkers.length; // Calculate the average latitude
      const avgLon = totalLon / parkMarkers.length; // Calculate the average longitude

      // Update the state with the center of the map
      setCenter([avgLat, avgLon]);
    } catch (error) {
      console.error(error)
    }
  }

  const handleLocationChange = (e) => {
    setLocation(e.target.value)
  }

  // This function is used to map through the parks array and create a Marker component for each park.
  const renderMarkers = () => {
    // Use the map() function to loop through the parks array and create a Marker component for each park
    return parks.map((park, index) => (
      <Marker
        key={index} // Set a unique key for each Marker component
        position={park.position} // Set the position of the Marker component based on the latitude and longitude of the park
        icon={L.icon({
          iconUrl: markerIcon, // Set the URL of the marker icon image
          iconSize: [25, 41], // Set the size of the marker icon image
          iconAnchor: [12, 41], // Set the anchor point of the marker icon
          popupAnchor: [1, -34], // Set the anchor point of the popup relative to the marker icon
          shadowUrl: markerShadow, // Set the URL of the marker shadow image
          shadowSize: [41, 41], // Set the size of the marker shadow image
          shadowAnchor: [12, 41], // Set the anchor point of the marker shadow
        })}
      >
        // Create a popup with the name of the park
        <Popup className='markerPopup'>{park.name}</Popup>
      </Marker>
    ))
  }


  useEffect(() => {
    if (mapRef.current) {
      setMap(mapRef.current);
    }
  }, [mapRef]);

  useEffect(() => {
    if (map) {
      map.flyTo(center);
    }
  }, [map, center]);

  return (
    <section className='main'>
      <div className='floatBox'>
        <h1 className='title'>Park Finder</h1>
        <form onSubmit={handleSubmit}>
          <div className='inputGroup'>
            <input
              placeholder='Enter your location'
              type="text"
              id="location"
              value={location}
              onChange={handleLocationChange}
              className='inputText' />
            <button type="submit" className='submitBtn'>Find Parks</button>
          </div>
        </form>
      </div>


      <MapContainer
        id="map"
        center={center} zoom={13}
        whenCreated={(map) => {
          mapRef.current = map
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {renderMarkers()}
      </MapContainer>

    </section>
  )
}

export default ParkFinderPage
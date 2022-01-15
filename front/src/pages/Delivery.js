import React, { useState, useContext, useEffect } from 'react';
import { FetchedList, ListOfItems } from '../components/List';
import {} from '../API';
import Map from '../components/Map';
import { useSocket } from '../context/socketProvider';

function DeliveryPage({ role, user, delivery }) {
	const socket = useSocket();
	const [position, setPosition] = useState({
		map: { lat: 0, lng: 0 },
		marker: {
			lat: 0,
			lng: 0,
		},
	});

	useEffect(() => {
		if (socket) {
			socket.on('new-carrier-position', ({ lat, lon: lng }) => {
				const newPos = { map: position.map, marker: { lat, lng } };

				if (
					(position.map.lat == 0 && position.map.lng == 0) ||
					Math.abs(lat - position.map.lat) + Math.abs(lng - position.map.lng) >
						0.001
				) {
					newPos.map = { lat, lng };
				}
				setPosition(newPos);
			});
		}
		return () => {
			if (socket) socket.off('new-carrier-position');
		};
	}, []);
	var welcomeText = 'Be free to track your delivery on the map';

	return (
		<>
			<div className="welcomeText">{welcomeText}</div>
			<Map position={position.map} markerPosition={position.marker} />
		</>
	);
}

export default DeliveryPage;

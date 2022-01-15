import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { useEffect, useRef, useState } from 'react';
import GoogleMapReact from 'google-map-react';
import { GOOGLE_KEY, GOOGLE_URL } from '../constants';
const Marker = (props) => {
	return (
		<div lat={props.lat} lng={props.lng}>
			<div
				style={{
					borderRadius: '50% 50% 50% 0',
					border: '10px solid #f00',
					width: '25px',
					height: '25px',
					marginBottom: '25px',
					transform: 'rotate(-45deg)',
					color: '#ffffff',
					backgroundColor: 'fff',
				}}
			>
				{' '}
			</div>
		</div>
	);
};
const Map = ({ position, markerPosition }) => {
	console.log(`position: ${position.lat} ${position.lng}`);
	console.log(`markerPosition: ${markerPosition.lat} ${markerPosition.lng}`);
	const { lat, lng } = position;
	const values = {
		center: position,
		zoom: 15,
	};
	return (
		<div style={{ height: '60vh', width: '60%' }}>
			<GoogleMapReact
				bootstrapURLKeys={{ key: GOOGLE_KEY }}
				center={values.center}
				defaultZoom={values.zoom}
			>
				<Marker
					lat={markerPosition.lat}
					lng={markerPosition.lng}
					text="Carrier Position"
				/>
			</GoogleMapReact>
		</div>
	);
};

export default Map;

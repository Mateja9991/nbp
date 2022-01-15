import React, { useState, useContext } from 'react';
import RestaurantsPage from './Restaurants';
import RestaurantMenuPage from './RestaurantMenu';
import InstancesPage from './Instances';
import { useSocket } from '../context/socketProvider';

function HomePage({ role, user, restaurant, setInstance, setRestaurant }) {
	const socket = useSocket();
	console.log('role ' + role);
	let Page,
		restId = restaurant;
	if (role == 'Customer') {
		Page = RestaurantsPage;
	} else if (role == 'Restaurant') {
		Page = RestaurantMenuPage;
		restId = user.id;
	}
	console.log('Page ' + Page);
	return (
		<Page
			user={user}
			role={role}
			restId={restId}
			restaurant={restaurant}
			setRestaurant={setRestaurant}
			setInstance={setInstance}
		></Page>
	);
}

export default HomePage;

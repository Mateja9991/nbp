import React, { useState, useContext, useEffect } from 'react';
import { FetchedList, ListOfItems } from '../components/List';
import {
	getInstanceOrders,
	getInstancePendingOrders,
} from '../API/Restaurants';
import {
	getRestaurantOrders,
	getCustomerOrders,
	getCarrierOrders,
	getCarrierCurrentDeliveries,
	markAsDelivered,
	getCarrierDeliveredDeliveries,
} from '../API';
import '../styles/Text.css';
import { useSocket } from '../context/socketProvider';

function OrdersPage({ role, user, orderSelected }) {
	const socket = useSocket();
	const [items, setItems] = useState([]);
	const [skip, setSkip] = useState(0);
	const [plus, setPlus] = useState(true);
	const limit = 2;

	console.log('ORDER PAGE');
	console.log('role: ' + role);
	const itemSelected = () => {
		console.log('item selected');
	};

	var getOrders;
	if (role === 'RestaurantInstance') {
		getOrders = getInstanceOrders;
	} else if (role === 'Restaurant') getOrders = getRestaurantOrders;
	else if (role === 'Customer') getOrders = getCustomerOrders;
	else getOrders = getCarrierDeliveredDeliveries;

	const updateItems = async () => {
		console.log(limit, skip);
		getOrders({ limit, skip })
			.then(({ data }) => {
				if (items != null)
					setItems(
						items.concat(data).map((item) => {
							item.name = `Order ${item.id}`;
							return item;
						})
					);
				else setItems(data);
				if (data.length < limit) setPlus(false);
			})
			.catch((err) => console.log(err));
	};
	console.log(`SKIPP ${skip}`);
	useEffect(() => {
		updateItems();
	}, [skip]);

	var welcomeText;
	if (items != null && items.length != 0) {
		if (role == 'Customer')
			welcomeText = 'Take a look at the orders you had made earlier';
		else welcomeText = 'Take a look at the orders you had earlier';
	} else welcomeText = "You haven't had any orders yet";

	return (
		<div>
			<div className="welcomeText">{welcomeText}</div>
			<ListOfItems itemSelected={orderSelected}>{items}</ListOfItems>
			<div className="plusIconWrapper">
				{plus ? (
					<i
						class="big plus circle icon"
						style={{ cursor: 'pointer' }}
						onClick={() => setSkip(skip + limit)}
					></i>
				) : (
					''
				)}
			</div>
		</div>
	);
	// return (
	// 	<FetchedList
	// 		fetchItems={getInstanceOrders}
	// 		itemSelected={() => {
	// 			console.log('item selected');
	// 		}}
	// 		user={user}
	// 	/>
	// );
}

export default OrdersPage;

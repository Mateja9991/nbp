import React, { useState, useContext, useEffect } from 'react';
import { FetchedList, ListOfItems } from '../components/List';
import { useSocket } from '../context/socketProvider';
import react from 'react';
import {
	getFoodFromOrder,
	createOrder,
	getPendingOrder,
	deleteFoodFromOrder,
	deleteFoodRelationFromOrder,
} from '../API/Orders';
function Basket({ restId }) {
	const socket = useSocket();
	const [items, setItems] = useState([]);
	const [orderId, setOrder] = useState(null);
	const delFood = async (id) => {
		deleteFoodRelationFromOrder(orderId, id)
			.then(({ data }) => {
				data = data.map((el) => {
					el.food.id = el.rel.id;
					el.food.date = el.rel.date;
					return { ...el.food };
				});
				setItems(data);
			})
			.catch((err) => console.log(err));
	};
	const button = { icon: `big delete icon`, onClick: delFood };
	const updateItems = async () => {
		if (orderId)
			getFoodFromOrder(orderId)
				.then(({ data }) => {
					data = data.map((el) => {
						el.food.id = el.rel.id;
						el.food.date = el.rel.date;
						return { ...el.food };
					});
					setItems(data);
				})
				.catch((err) => console.log(err));
	};
	const setCurrentOrder = async () => {
		getPendingOrder(restId)
			.then(({ data: { id: orderId } }) => {
				if (!orderId) {
					createOrder(restId)
						.then(({ data: { id: orderId } }) => {
							setOrder(orderId);
						})
						.catch((err) => console.log(err));
				} else {
					setOrder(orderId);
				}
			})
			.catch((err) => console.log(err));
	};
	useEffect(() => {
		setCurrentOrder();
		if (orderId) {
			updateItems();
		}
	}, [orderId]);
	var welcomeText;
	if (items != null && items.length != 0)
		welcomeText = 'See the items you added to your basket';
	else welcomeText = 'Your basket is empty, be free to add food in it';

	return (
		<>
			<div className="welcomeText">{welcomeText}</div>
			<ListOfItems
				button={button}
				itemSelected={() => {
					console.log('item selected!');
				}}
			>
				{items}
			</ListOfItems>
			<button
				className="positive ui button"
				onClick={() => {
					socket.emit('orderConfirmed', orderId);
				}}
			>
				{' '}
				Order{' '}
			</button>
		</>
	);
}

export default Basket;

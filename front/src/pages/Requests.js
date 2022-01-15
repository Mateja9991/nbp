import react, { useState, useEffect } from 'react';
import Request from './Request';
import { useSocket } from '../context/socketProvider';
import { getInstancePendingOrders, getCarrierPendingDeliveries } from '../API';
import { List } from 'semantic-ui-react';
function Requests({ setNewReq, role, orderSelected }) {
	const [requests, setRequests] = useState([]);
	const socket = useSocket();
	const callUpdate = () => {
		updateItems();
	};
	const deleteOrder = (orderId) => {
		console.log(orderId);
		setRequests(requests.filter((req) => req.id != orderId));
		console.log(requests);
	};
	var requestList;
	const fetchRequests =
		role == 'Carrier' ? getCarrierPendingDeliveries : getInstancePendingOrders;
	const roleLower = role.charAt(0).toLowerCase() + role.slice(1);

	const acceptOrder = (request) => {
		if (socket) {
			//paramteri???
			socket.emit(`${roleLower}AcceptedOrder`, request);
		}
	};

	const declineOrder = (request) => {
		if (socket) {
			//paramteri???
			socket.emit(`${roleLower}DeclinedOrder`, request);
			// updateItems();
		}
	};
	useEffect(() => {
		socket.off('order-deleted');
		socket.on('order-deleted', deleteOrder);
	}, [requests]);
	useEffect(() => {
		updateItems();
		if (socket) {
			if (role == 'RestaurantInstance') socket.on('new-order', callUpdate);
			else if (role == 'Carrier') socket.on('new-delivery', callUpdate);
			socket.on('order-deleted', deleteOrder);
		}
		return () => {
			if (socket) {
				socket.off('new-order', callUpdate);
				socket.off('order-deleted', deleteOrder);
				socket.off('new-delivery', callUpdate);
			}
		};
	}, []);
	const updateItems = () => {
		fetchRequests()
			.then(({ data }) => {
				console.log(data);
				setRequests(data);
			})
			.catch((err) => console.log(err));
	};

	var welcomeText;
	if (requests != null && requests.length != 0)
		welcomeText = `Take a look at the pending delivery requests`;
	else welcomeText = 'There are no pending delivery requests';

	return (
		<>
			<div className="welcomeText">{welcomeText}</div>
			<List style={{ margin: '5%' }}>
				{requests.map((req) => {
					req.name = `${role == 'Carrier' ? 'Delivery' : 'Order'} ${req.id}`;
					return (
						<List.Item key={req.id}>
							<Request
								reqId={req.id}
								acceptOrder={acceptOrder}
								declineOrder={declineOrder}
								orderSelected={orderSelected}
								{...req}
							></Request>
						</List.Item>
					);
				})}
			</List>
		</>
	);
}

export default Requests;

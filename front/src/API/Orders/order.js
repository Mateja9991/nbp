import { url } from '../../constants/constants';
import axios from 'axios';
import { token } from '../utils';
const createOrder = async (restId) =>
	axios.post(
		`${url}/orders/${restId}`,
		{},
		{
			headers: { Authorization: `Bearer ${token()}` },
		}
	);
const getOrderByID = (orderId) =>
	axios.get(`${url}/orders/${orderId} `, {
		headers: { Authorization: `Bearer ${token()}` },
	});
const getOrdersRestaurant = async (orderId) =>
	axios.get(`${url}/orders/${orderId}/restaurant`, {
		headers: { Authorization: `Bearer ${token()}` },
	});

const updateOrder = async (orderId) =>
	axios.patch(`${url}/orders/${orderId}`, {
		headers: { Authorization: `Bearer ${token()}` },
	});

const confirmOrder = async (orderId) =>
	axios.patch(`${url}/orders/${orderId}/confirm`, {
		headers: { Authorization: `Bearer ${token()}` },
	});

const deleteInstance = async (orderId) =>
	axios.delete(`${url}/${orderId}`, {
		headers: { Authorization: `Bearer ${token()}` },
	});

const addFoodToOrder = async (orderId, foodIds) =>
	axios.patch(
		`${url}/orders/${orderId}/add-food`,
		{
			foodIds,
		},
		{
			headers: { Authorization: `Bearer ${token()}` },
		}
	);

const deleteFoodFromOrder = async (orderId, foodIds) =>
	axios.patch(
		`${url}/orders/${orderId}/del-food`,
		{
			foodIds,
		},
		{
			headers: { Authorization: `Bearer ${token()}` },
		}
	);
const deleteFoodRelationFromOrder = async (orderId, relIds) =>
	axios.patch(
		`${url}/orders/${orderId}/del-food-rel`,
		{
			relIds,
		},
		{
			headers: { Authorization: `Bearer ${token()}` },
		}
	);
const getFoodFromOrder = async (restId) =>
	axios.get(`${url}/orders/${restId}/food`, {
		headers: { Authorization: `Bearer ${token()}` },
	});

const getPendingOrder = async (restId) =>
	axios.get(`${url}/orders/pending/${restId}`, {
		headers: { Authorization: `Bearer ${token()}` },
	});

const markAsDelivered = async (orderId) =>
	axios.patch(
		`${url}/orders/${orderId}/delivered`,
		{},
		{
			headers: { Authorization: `Bearer ${token()}` },
		}
	);

const markAsMade = async (orderId) =>
	axios.patch(
		`${url}/orders/${orderId}/mark-as-made`,
		{},
		{
			headers: { Authorization: `Bearer ${token()}` },
		}
	);
export {
	createOrder,
	getOrderByID,
	getOrdersRestaurant,
	updateOrder,
	confirmOrder,
	deleteInstance,
	addFoodToOrder,
	deleteFoodFromOrder,
	getFoodFromOrder,
	getPendingOrder,
	deleteFoodRelationFromOrder,
	markAsDelivered,
	markAsMade,
};

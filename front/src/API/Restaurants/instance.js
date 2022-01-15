import { url } from '../../constants/constants';
import axios from 'axios';
import { token } from '../utils';
const getRestaurantInstances = async ({
	limit = 15,
	skip = 0,
	sortBy = 'name',
	sortValue = 'ASC',
	...match
} = {}) =>
	axios.get(`${url}/restaurants/instances`, {
		headers: { Authorization: `Bearer ${token()}` },
		params: {
			limit,
			skip,
			sortBy,
			sortValue,
			...match,
		},
	});

const registerInstance = async (newInstance) =>
	axios.post(
		`${url}/instances`,
		{
			...newInstance,
		},
		{
			headers: { Authorization: `Bearer ${token()}` },
		}
	);

const getInstanceMenu = async () =>
	axios.get(`${url}/instances/menu'`, {
		headers: { Authorization: `Bearer ${token()}` },
	});

const getInstanceOrders = async ({ limit = 10, skip = 0 } = {}) =>
	axios.get(`${url}/instances/orders`, {
		headers: { Authorization: `Bearer ${token()}` },
		params: {
			limit,
			skip,
		},
	});

const getInstanceCurrentOrders = async ({ limit = 4, skip = 0 }) =>
	axios.get(`${url}/instances/current-orders`, {
		headers: { Authorization: `Bearer ${token()}` },
		params: {
			limit,
			skip,
		},
	});

const getInstancePendingOrders = async () =>
	axios.get(`${url}/instances/pending-orders`, {
		headers: { Authorization: `Bearer ${token()}` },
	});

const updateInstance = async (newInstance) =>
	axios.patch(
		`${url}/instances`,
		{
			...newInstance,
		},
		{
			headers: { Authorization: `Bearer ${token()}` },
		}
	);

const deleteInstanceById = async (instanceId) =>
	axios.delete(`${url}/instances/${instanceId}`, {
		headers: { Authorization: `Bearer ${token()}` },
	});

export {
	registerInstance,
	getInstanceOrders,
	getInstancePendingOrders,
	getInstanceMenu,
	getRestaurantInstances,
	getInstanceCurrentOrders,
	updateInstance,
	deleteInstanceById,
};

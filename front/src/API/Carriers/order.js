import { url } from '../../constants/constants';
import axios from 'axios';
import { token } from '../utils';

const getCarrierOrders = async ({
	limit = 10,
	skip = 0,
	sortBy = 'price',
	sortValue = 'ASC',
	...match
} = {}) => {
	axios.get(`${url}/restaurants/orders`, {
		headers: { Authorization: `Bearer ${token()}` },
		params: {
			limit,
			skip,
			sortBy,
			sortValue,
			...match,
		},
	});
};

const getCarrierPendingDeliveries = async () =>
	axios.get(`${url}/carriers/me/pending-deliveries`, {
		headers: { Authorization: `Bearer ${token()}` },
	});
const getCarrierDeliveredDeliveries = async ({ limit = 10, skip = 0 } = {}) =>
	axios.get(`${url}/carriers/me/delivered-deliveries`, {
		headers: { Authorization: `Bearer ${token()}` },
		params: {
			limit,
			skip,
		},
	});
const getCarrierCurrentDeliveries = async ({ limit = 4, skip = 0 }) =>
	axios.get(`${url}/carriers/me/current-deliveries`, {
		headers: { Authorization: `Bearer ${token()}` },
		params: {
			limit,
			skip,
		},
	});
export {
	getCarrierOrders,
	getCarrierCurrentDeliveries,
	getCarrierPendingDeliveries,
	getCarrierDeliveredDeliveries,
};

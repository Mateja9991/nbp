import { url } from '../../constants/constants';
import axios from 'axios';
import { token } from '../utils';
const getCustomerOrders = async ({ limit = 10, skip = 0 } = {}) =>
	axios.get(`${url}/customers/delivered-orders`, {
		headers: { Authorization: `Bearer ${token()}` },
		params: {
			limit,
			skip,
		},
	});
export { getCustomerOrders };

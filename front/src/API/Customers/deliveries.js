import { url } from '../../constants/constants';
import axios from 'axios';
import { token } from '../utils';

const getCustomerCurrentDeliveries = async ({ limit = 4, skip = 0 }) =>
	axios.get(`${url}/customers/current-deliveries`, {
		headers: { Authorization: `Bearer ${token()}` },
		params: {
			limit,
			skip,
		},
	});

export { getCustomerCurrentDeliveries };

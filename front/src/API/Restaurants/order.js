import { url } from '../../constants/constants';
import axios from 'axios';
import { token } from '../utils';

const addFoodToPendingOrder = async (restId, foodIds) =>
	axios.patch(
		`${url}/restaurants/${restId}/add-food-order`,
		{ foodIds },
		{
			headers: { Authorization: `Bearer ${token()}` },
		}
	);

const delFoodFromPendingOrder = async (restId, foodIds) =>
	axios.patch(
		`${url}/restaurants/${restId}/del-food-order`,
		{ foodIds },
		{
			headers: { Authorization: `Bearer ${token()}` },
		}
	);

export { addFoodToPendingOrder, delFoodFromPendingOrder };

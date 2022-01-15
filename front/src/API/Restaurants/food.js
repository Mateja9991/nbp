import { url } from '../../constants/constants';
import axios from 'axios';
import { token } from '../utils';
const getFoodFromMenu = async (
	id,
	{ limit = 15, skip = 0, sortBy = 'price', sortValue = 'ASC', ...match } = {}
) =>
	axios.get(`${url}/restaurants/${id}/food`, {
		headers: { Authorization: `Bearer ${token()}` },
		params: {
			limit,
			skip,
			sortBy,
			sortValue,
			...match,
		},
	});

const getAvailableFoodTypes = async (restId) =>
	axios.get(`${url}/restaurants/${restId}/food-types`, {
		headers: { Authorization: `Bearer ${token()}` },
	});

const getFoodByID = async (id) =>
	axios.get(`${url}/restaurants/food/${id}`, {
		headers: { Authorization: `Bearer ${token()}` },
	});

const addFoodToRestaurant = async (newFood) =>
	axios.post(
		`${url}/restaurants/me/food`,
		{
			...newFood,
		},
		{
			headers: { Authorization: `Bearer ${token()}` },
		}
	);

const updateRestaurantsFood = async (id, formData) =>
	axios.patch(`${url}/restaurants/food/${id}`, formData, {
		headers: { Authorization: `Bearer ${token()}` },
	});

const deleteRestaurantsFood = async (id) =>
	axios.delete(`${url}/restaurants/food/${id}`, {
		headers: { Authorization: `Bearer ${token()}` },
	});

export {
	addFoodToRestaurant,
	getFoodFromMenu,
	getAvailableFoodTypes,
	updateRestaurantsFood,
	deleteRestaurantsFood,
	getFoodByID,
};

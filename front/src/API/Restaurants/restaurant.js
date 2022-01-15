import { url } from '../../constants/constants';
import axios from 'axios';
import { token } from '../utils';

const getAllRestaurants = async ({
	limit = 2,
	skip = 0,
	sortBy = 'price',
	sortValue = 'ASC',
	...match
} = {}) =>
	axios.get(`${url}/restaurants/all`, {
		headers: { Authorization: `Bearer ${token()}` },
		params: {
			limit,
			skip,
			sortBy,
			sortValue,
			...match,
		},
	});
const getReviews = async (restId, { limit = 1, skip = 0 }) =>
	axios.get(`${url}/restaurants/${restId}/reviews`, {
		headers: { Authorization: `Bearer ${token()}` },
		params: {
			limit,
			skip,
		},
	});
const rateRestaurant = async (restId, { text, rating }) => {
	return axios.patch(
		`${url}/restaurants/${restId}/rate`,
		{ text, rating },
		{
			headers: { Authorization: `Bearer ${token()}` },
		}
	);
};
const searchRestaurant = async (
	name,
	{ limit = 2, skip = 0, sortBy = 'name', sortValue = 'ASC' } = {}
) =>
	axios.get(`${url}/restaurants/search/${name}`, {
		headers: { Authorization: `Bearer ${token()}` },
		params: {
			limit,
			skip,
			sortBy,
			sortValue,
		},
	});
const deleteRestaurant = async () =>
	axios.delete(`${url}/users/me`, {
		headers: { Authorization: `Bearer ${token()}` },
	});

const updateRestaurant = async (formData) =>
	axios.patch(`${url}/restaurants`, formData, {
		headers: {
			// 'content-type': 'multipart/form-data',
			Authorization: `Bearer ${token()}`,
		},
	});

const getRestaurantOrders = async ({ limit = 10, skip = 0 } = {}) =>
	axios.get(`${url}/restaurants/orders`, {
		headers: { Authorization: `Bearer ${token()}` },
		params: {
			limit,
			skip,
		},
	});

export {
	getAllRestaurants,
	getRestaurantOrders,
	updateRestaurant,
	rateRestaurant,
	searchRestaurant,
	getReviews,
};

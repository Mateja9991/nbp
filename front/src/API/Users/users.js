import { url } from '../../constants/constants';
import axios from 'axios';
import { token } from '../utils';

const loginAsUser = async (user) =>
	axios.post(url + '/users/login', user).catch((error) => {
		if (error.response) alert(error.response.data.error);
		else alert(error);
	});

const registerUser = async (role, user) =>
	axios.post(`${url}/${role}s`, user).catch((error) => {
		if (error.response) alert(error.response.data.error);
		else alert(error);
	});

const getUserByUsername = async (username) =>
	axios.get(`${url}/users/username/${username}`, {
		headers: { Authorization: `Bearer ${token()}` },
	});
const getUserById = async (id) =>
	axios.get(`${url}/users/${id}`, {
		headers: { Authorization: `Bearer ${token()}` },
	});

const getMessageHistoryWithUser = async (
	userId,
	{
		limit = 2,
		skip = 0,
		sortBy = 'createdAt',
		sortValue = 'ASC',
		...match
	} = {}
) =>
	axios.get(`${url}/users/chat/${userId}`, {
		headers: { Authorization: `Bearer ${token()}` },
		params: {
			limit,
			skip,
			sortBy,
			sortValue,
			...match,
		},
	});
const deleteCurrentUser = async () =>
	axios
		.delete(`${url}/users/me`, {
			headers: { Authorization: `Bearer ${token()}` },
		})
		.catch((error) => {
			if (error.response) alert(error.response.data.error);
			else alert(error);
		});

const updateCurrentUser = async (data) =>
	axios
		.patch(`${url}/users/me/`, data, {
			headers: { Authorization: `Bearer ${token()}` },
		})
		.catch((error) => {
			if (error.response) alert(error.response.data.error);
			else alert(error);
		});

export {
	loginAsUser,
	registerUser,
	deleteCurrentUser,
	updateCurrentUser,
	getUserByUsername,
	getMessageHistoryWithUser,
	getUserById,
};

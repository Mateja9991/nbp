const { UserRepository, UserRepositoryInstance } = require('./user.repo');
const RestaurantRepository = require('./restaurant.repo');
const CustomerRepository = require('./customer.repo');
const CarrierRepository = require('./carrier.repo');
const FoodRepository = require('./food.repo');
const RestaurantInstanceRepository = require('./instance.repo');
const OrderRepository = require('./order.repo');

module.exports = {
	UserRepository,
	UserRepositoryInstance,
	RestaurantRepository,
	CustomerRepository,
	CarrierRepository,
	RestaurantInstanceRepository,
	FoodRepository,
	OrderRepository,
};

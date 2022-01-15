const {
  OrderRepository,
  CustomerRepository,
  RestaurantRepository,
  RestaurantInstanceRepository,
  FoodRepository,
  CarrierRepository,
  UserRepositoryInstance: UserRepository,
} = require("../../db/repositories/index");
const { redisAsync } = require("../../db");

const foodToOrderAuth = async (req, res, next) => {
  try {
    let { foodIds } = req.body;
    if (!foodIds) next();
    if (!(foodIds instanceof Array)) foodIds = [foodIds];
    const { id: orderId } = req.order;
    const restaurant = await OrderRepository.getOrdersRestaurant(orderId);
    const { id: restId } = restaurant;
    req.foods = [];
    for (let foodId of foodIds) {
      const currentFood = await RestaurantRepository.checkMenuForFood(
        foodId,
        restId
      );
      console.log(currentFood);
      if (!currentFood) throw new Error("Food To Order Auth Failed.");
      req.foods.push(currentFood);
    }
    next();
  } catch (e) {
    next(e);
  }
};

const orderToInstanceAuth = async (req, res, next) => {
  try {
    const { id } = req.user;
    let { orderId } = req.params;
    if (!orderId) orderId = req.orderId;
    if (!(await RestaurantInstanceRepository.isInstancesOrder(id, orderId))) {
      throw new Error("Order To User Auth Failed.");
    }
    if (!req.order) req.order = await OrderRepository.getById(orderId);
    next();
  } catch (e) {
    next(e);
  }
};

const orderToCustomerAuth = async (req, res, next) => {
  try {
    const { id } = req.user;
    let { orderId } = req.params;
    if (!orderId) orderId = req.orderId;
    const roles = await UserRepository.getUserRole(id);
    let orders;
    if (!(await CustomerRepository.isCustomersOrder(id, orderId))) {
      throw new Error("Order To Customer Auth Failed.");
    }
    if (!req.order) req.order = await OrderRepository.getById(orderId);
    next();
  } catch (e) {
    next(e);
  }
};

const orderToUserAuth = async (req, res, next) => {
  try {
    const { id } = req.user;
    let { orderId } = req.params;
    if (!orderId) orderId = req.orderId;
    const roles = await UserRepository.getUserRole(id);
    let orders;
    if (roles.includes("Customer")) {
      if (await CustomerRepository.isCustomersOrder(id, orderId)) {
        if (!req.order) req.order = await OrderRepository.getById(orderId);
        return next();
      }
    } else if (roles.includes("RestaurantInstance")) {
      if (await RestaurantInstanceRepository.isInstancesOrder(id, orderId)) {
        if (!req.order) req.order = await OrderRepository.getById(orderId);
        return next();
      }
    } else if (roles.includes("Carrier")) {
      const deliveries = await redisAsync.lrangeAsync(
        `${id}:Deliveries`,
        0,
        -1
      );
      if (
        (await CarrierRepository.isCarriersDelivery(id, orderId)) ||
        deliveries.includes(orderId)
      ) {
        if (!req.order) req.order = await OrderRepository.getById(orderId);
        return next();
      }
    }
    throw new Error("Order To User Auth Failed.");
  } catch (e) {
    next(e);
  }
};

const orderToCarrier = async (req, res, next) => {
  try {
    const { id } = req.user;
    let { orderId } = req.params;
    if (!orderId) orderId = req.orderId;
    const deliveries = await redisAsync.lrangeAsync(`${id}:Deliveries`, 0, -1);
    if (
      !(await CarrierRepository.isCarriersDelivery(id, orderId)) &&
      !deliveries.includes(orderId)
    )
      throw new Error("Order To Carrier Auth Failed.");
    if (!req.order) req.order = await OrderRepository.getById(orderId);
    next();
  } catch (e) {
    next(e);
  }
};

module.exports = {
  orderToUserAuth,
  orderToCustomerAuth,
  foodToOrderAuth,
  orderToInstanceAuth,
  orderToCarrier,
};

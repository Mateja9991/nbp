const express = require("express");

const { jwtAuthMiddleware } = require("../middleware/auth/index");
const {
  registerCustomer,
  getAllCustomers,
  getCustomersCurrentDeliveries,
  getCustomersDeliveredOrders,
  getCustomerContacts,
} = require("../services/customer.service");

const router = new express.Router();

//ROUTES

router.post("/customers", registerCustomer);

router.get(
  "/customers/current-deliveries",
  jwtAuthMiddleware,
  getCustomersCurrentDeliveries
);

router.get(
  "/customers/delivered-orders",
  jwtAuthMiddleware,
  getCustomersDeliveredOrders
);

router.get("/customers/all", jwtAuthMiddleware, getAllCustomers);

router.get("/customers/contacts", jwtAuthMiddleware, getCustomerContacts);

module.exports = router;

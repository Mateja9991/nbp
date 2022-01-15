const express = require("express");

const { jwtAuthMiddleware } = require("../middleware/auth/index");
const {
  registerCarrier,
  getAllCarriers,
  getCurrentDeliveries,
  getPendingDeliveries,
  getDeliveredDeliveries,
  getCarrierContacts,
} = require("../services/carrier.service");

const router = new express.Router();

//ROUTES

router.post("/carriers", registerCarrier);

router.get(
  "/carriers/me/pending-deliveries",
  jwtAuthMiddleware,
  getPendingDeliveries
);

router.get(
  "/carriers/me/delivered-deliveries",
  jwtAuthMiddleware,
  getDeliveredDeliveries
);

router.get(
  "/carriers/me/current-deliveries",
  jwtAuthMiddleware,
  getCurrentDeliveries
);

router.get("/carriers/all", jwtAuthMiddleware, getAllCarriers);

router.get("/carriers/contacts", jwtAuthMiddleware, getCarrierContacts);

module.exports = router;

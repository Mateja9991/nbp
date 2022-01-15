const express = require('express');
const { errorHandler } = require('./utils');
const router = new express.Router();

router.use(function (req, res, next) {
	res.header('Access-Control-Allow-Headers', '*');
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Credentials', true);
	res.header(
		'Access-Control-Allow-Methods',
		'GET, POST, PATCH, DELETE, OPTIONS'
	);
	next();
});

router.use(require('./user.router'));
router.use(require('./carrier.router'));
router.use(require('./customer.router'));
router.use(require('./restaurant.router'));
router.use(require('./order.router'));
router.use(require('./instance.router'));

router.use(errorHandler);

module.exports = router;

const path = require('path');
const express = require('express');
const { PORT } = require('./constants/index');
//require('../utils').initializeEnvitonment();

const router = require('./routers');

const app = express();

const publicPath = path.join(__dirname, '../public/');

app.use(express.json());
app.use(router);
app.use(express.static(publicPath));

app.listen(PORT, () => {
	console.log(`Server is up on port: ${PORT}`);
});

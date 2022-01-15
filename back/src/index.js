const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const { initializeEnvironment } = require('./common/environment');
initializeEnvironment();

const app = express();
const server = http.createServer(app);

const Socket = require('./socket/socket');
Socket.initializeSocketServer(server);

const jsonParser = bodyParser.json();
// const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(jsonParser);
const router = require('./routers');
app.use(router);
app.use(express.json());
const publicPath = path.join(__dirname, '../public/');
app.use(express.static(publicPath));

const { PORT } = require('./constants/index');
server.listen(PORT, () => {
	console.log(`Server is up on port: ${PORT}`);
});

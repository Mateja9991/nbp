async function errorHandler(err, req, res, next) {
	try {
		console.log(err);
		if (res.statusCode < 400) res.status(400);
		return res.send({ error: err.message });
	} catch (err) {
		res.status(500).send({ error: 'Unknown Error.' });
	}
}
module.exports = {
	errorHandler,
};

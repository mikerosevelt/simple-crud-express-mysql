const advancedResults = (model) => async (req, res, next) => {
	let query;

	// Copy req.query
	const reqQuery = { ...req.query };

	const removeFields = ['page', 'limit'];
	removeFields.forEach((param) => delete reqQuery[param]);

	let queryStr = JSON.stringify(reqQuery);
	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	// Finding resource
	query = model.findall(JSON.parse(queryStr));

	// Pagination
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 25;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await model.countDocuments();

	query = query.skip(startIndex).limit(limit);

	// Executing query
	const results = await query;

	// Pagination Result
	const pagination = {};

	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}
	next();
};

module.exports = advancedResults;

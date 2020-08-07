const { validationResult } = require('express-validator');
const validate = (validations) => {
	return async (req, res, next) => {
		await Promise.all(validations.map((validation) => validation.run(req)));

		const errors = validationResult(req);
		if (errors.isEmpty()) {
			return next();
		}

		if (req.body.slug) {
			res.redirect('back');
			// res.render(`comics/edit`, {
			// 	layout: 'layouts/template',
			// 	comic: req.body,
			// 	errors: errors.array(),
			// });
		}

		res.render('comics/create', {
			layout: 'layouts/template',
			errors: errors.array(),
		});
	};
};

module.exports = validate;

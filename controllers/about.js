/**
 * @desc Index method
 * @route GET /about
 * @access Public
 */
exports.index = async (req, res, next) => {
	res.render('home/about', {
		layout: 'layouts/template',
		data: { title: 'About' },
	});
	// res.render('home/index', { layout: 'home/index' });
};

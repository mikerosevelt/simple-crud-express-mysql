/**
 * @desc Index method
 * @route GET /
 * @access Public
 */
exports.index = async (req, res, next) => {
	res.render('home/index', {
		layout: 'layouts/template',
		data: { title: 'Home' },
	});
	// res.render('home/index', { layout: 'home/index' });
};

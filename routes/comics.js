const express = require('express');
const router = express.Router();
// Controller
const {
	index,
	detail,
	create,
	save,
	edit,
	update,
	deleteComic,
} = require('../controllers/comics');
const { body } = require('express-validator');

// Midllerware
const validate = require('../middleware/validation');

router.route('/').get(index);
router
	.route('/save')
	.post(
		validate([
			body('title')
				.not()
				.trim()
				.escape()
				.isEmpty()
				.withMessage('Title is Required'),
			body('writer')
				.not()
				.trim()
				.escape()
				.isEmpty()
				.withMessage('Writer is Required'),
			body('publisher')
				.not()
				.trim()
				.escape()
				.isEmpty()
				.withMessage('Publisher is Required'),
		]),
		save
	);
router.route('/create').get(create);
router
	.route('/update')
	.post(
		validate([
			body('title')
				.not()
				.trim()
				.escape()
				.isEmpty()
				.withMessage('Title is Required'),
			body('writer')
				.not()
				.trim()
				.escape()
				.isEmpty()
				.withMessage('Writer is Required'),
			body('publisher')
				.not()
				.trim()
				.escape()
				.isEmpty()
				.withMessage('Publisher is Required'),
		]),
		update
	);
router.route('/edit/:slug').get(edit);
router.route('/:slug').get(detail).delete(deleteComic);

module.exports = router;

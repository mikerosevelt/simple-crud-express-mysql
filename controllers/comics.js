const createError = require('http-errors');
const asyncHandler = require('../middleware/async');
const Comic = require('../models').Comic;
const slugify = require('slugify');
const { unlink } = require('fs');
const hbs = require('hbs');
const preventOverwrite = require('../utils/anti-overwrite-file');
const { Op } = require('sequelize');

// @desc Index page
// @route GET /comics
exports.index = asyncHandler(async (req, res, next) => {
	// Pagination config
	const perPage = 2;
	const totalRows = await Comic.count();
	const totalpage = Math.ceil(totalRows / perPage);
	const page = parseInt(req.query.page) || 1;
	const start = (page - 1) * perPage;

	let comics;
	if (req.query.keyword) {
		comics = await Comic.findAll({
			where: {
				title: {
					[Op.like]: `%${req.query.keyword}%`,
				},
			},
			// offset: start,
			// limit: perPage,
		});
	} else {
		comics = await Comic.findAll({ offset: start, limit: perPage });
	}

	// Num links
	let links = [];
	for (let i = 1; i <= totalpage; i++) {
		if (i === page) {
			links += `<li class="page-item active"><a class="page-link" href="?page=${i}">${i}</a></li>`;
		} else {
			links += `<li class="page-item"><a class="page-link" href="?page=${i}">${i}</a></li>`;
		}
	}

	// Next link
	const nextLink =
		page < totalpage
			? `<li class="page-item"><a class="page-link" href="?page=${
					page + 1
			  }">&raquo;</a></li>`
			: '';

	// Prev Link
	const prevLink =
		page > 1
			? `<li class="page-item"><a class="page-link" href="?page=${
					page - 1
			  }">&laquo;</a></li>`
			: '';

	hbs.registerHelper('inc', function (value, options) {
		return parseInt(value) + 1 + perPage * (page - 1);
	});

	res.render('comics/index', {
		layout: 'layouts/template',
		data: {
			title: 'View All Comics',
			comics: comics,
			links: links,
			nextLink,
			prevLink,
		},
	});
});

// @desc Get comic detail
// @route Get /comics/:slug
// @param :slug = comic slug
exports.detail = asyncHandler(async (req, res, next) => {
	const comic = await Comic.findOne({
		where: {
			slug: req.params.slug,
		},
	});

	if (!comic) {
		req.flash(
			'errors',
			`<div class="alert alert-danger" role="alert">Comic not found</div>`
		);
		return res.redirect('/comics');
	}

	res.render('comics/detail', {
		layout: 'layouts/template',
		data: { title: 'Add New Comic', comic: comic.dataValues },
	});
});

// @desc Create comic
// @route GET /comics/create
exports.create = async (req, res, next) => {
	res.render('comics/create', {
		layout: 'layouts/template',
		data: { title: 'Add New Comic' },
	});
};

// @desc Save new comic data to database
// @route POST /comics
exports.save = asyncHandler(async (req, res, next) => {
	const comic = await Comic.findOne({
		where: {
			title: req.body.title,
		},
	});

	if (comic) {
		req.flash(
			'errors',
			`<div class="alert alert-danger" role="alert">Title already use</div>`
		);
		return res.redirect('/comics/create');
	}

	if (!req.files) {
		req.flash(
			'errors',
			`<div class="alert alert-danger" role="alert">Please upload an image</div>`
		);
		return res.redirect('/comics/create');
	}

	const file = req.files.cover;

	// Validation
	if (!file.mimetype.startsWith('image')) {
		req.flash(
			'errors',
			`<div class="alert alert-danger" role="alert">Please upload an image files</div>`
		);
		res.render('/comics/create', {
			layout: 'layouts/template',
		});
	}

	if (file.size > process.env.MAX_FILE_UPLOAD) {
		req.flash(
			'errors',
			`<div class="alert alert-danger" role="alert">Please upload an image file less than ${process.env.MAX_FILE_UPLOAD}</div>`
		);
		res.render('/comics/create', {
			layout: 'layouts/template',
		});
	}

	// Prevent overwriting file
	file.name = preventOverwrite(file.name);

	file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
		if (err) {
			console.log(err);
			return next(createError(500, `Problem with file upload`));
		}
	});
	// Insert data
	let data = {
		title: req.body.title,
		slug: slugify(req.body.title, { lower: true, unique: true }),
		writer: req.body.writer,
		publisher: req.body.publisher,
		cover: file.name || 'nopic.jpg',
	};
	await Comic.create(data);
	req.flash(
		'flash',
		`<div class="alert alert-success" role="alert">New comic has been added</div>`
	);
	res.redirect('/comics');
});

// @desc Edit comic
// @route GET /comics/edit/:slug
// @param :slug = comic slug
exports.edit = asyncHandler(async (req, res, next) => {
	const comic = await Comic.findOne({
		where: {
			slug: req.params.slug,
		},
	});

	if (!req.params) {
		req.flash(
			'flash',
			`<div class="alert alert-danger" role="alert">Something went wrong!</div>`
		);
		return res.redirect('/comics');
	}

	if (!comic) {
		req.flash(
			'flash',
			`<div class="alert alert-danger" role="alert">Comic not found!</div>`
		);
		return res.redirect('/comics');
	}

	res.render('comics/edit', { layout: 'layouts/template', comic: comic });
});

// @desc Update comic data
// @route POST /comics/update
exports.update = asyncHandler(async (req, res, next) => {
	const comicOld = await Comic.findOne({
		where: {
			slug: req.body.slug,
		},
	});
	let comic = await Comic.findOne({
		where: {
			title: req.body.title,
		},
	});
	if (comicOld.title !== req.body.title) {
		if (comic) {
			req.flash(
				'errors',
				`<div class="alert alert-danger" role="alert">Title already use</div>`
			);
			return res.redirect(`/comics/edit/${req.body.slug}`);
		}
	}
	let file = null;
	let filename = null;
	if (req.files) {
		file = req.files.cover;
		// Validation
		if (!file.mimetype.startsWith('image')) {
			req.flash(
				'errors',
				`<div class="alert alert-danger" role="alert">Please upload an image files</div>`
			);
			res.render('/comics/create', {
				layout: 'layouts/template',
			});
		}
		// Check file size
		if (file.size > process.env.MAX_FILE_UPLOAD) {
			req.flash(
				'errors',
				`<div class="alert alert-danger" role="alert">Please upload an image file less than ${process.env.MAX_FILE_UPLOAD}</div>`
			);
			res.render('/comics/create', {
				layout: 'layouts/template',
			});
		}

		// Prevent overwriting file
		file.name = preventOverwrite(file.name);
		// Check and delete image file if comic cover is not nopic.jpg
		if (comic.cover !== 'nopic.jpg') {
			unlink(`${process.env.FILE_UPLOAD_PATH}/${comic.cover}`, async (err) => {
				console.log(err);
			});
		}
		file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
			if (err) {
				console.log(err);
				return next(createError(500, `Problem with file upload`));
			}
		});
		filename = file.name;
	} else {
		filename = req.body.cover;
	}
	// Update data
	data = {
		title: req.body.title,
		slug: slugify(req.body.title, { lower: true, unique: true }),
		writer: req.body.writer,
		publisher: req.body.publisher,
		cover: filename,
	};
	await Comic.update(data, { where: { slug: req.body.slug } });
	req.flash(
		'flash',
		`<div class="alert alert-success" role="alert">Comic successfully updated!</div>`
	);
	return res.redirect('/comics/index');
});

// @desc Delete comic
// @route DELETE /comics/:slug
// @param :slug = comic slug
exports.deleteComic = asyncHandler(async (req, res, next) => {
	const comic = await Comic.findOne({
		where: {
			slug: req.params.slug,
		},
	});
	// Check if comic is exist
	if (!comic) {
		return next(createError(404, 'Comic not found'));
	}

	// Check and delete image file if comic cover is not nopic.jpg
	if (comic.cover !== 'nopic.jpg') {
		unlink(`${process.env.FILE_UPLOAD_PATH}/${comic.cover}`, async (err) => {
			console.log(err);
		});
	}
	// delete comic
	await comic.destroy();
	req.flash(
		'flash',
		`<div class="alert alert-success" role="alert">Comic has been deleted</div>`
	);
	res.redirect('/comics');
});

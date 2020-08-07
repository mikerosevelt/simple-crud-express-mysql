const createError = require('http-errors');
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('express-flash');
const models = require('./models');

// Routers
const home = require('./routes/home');
const about = require('./routes/about');
const comics = require('./routes/comics');

// Load env vars
dotenv.config({ path: './config/.env' });

const app = express();

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookie Parser
// app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}
// Handle Sessions
app.use(
	session({
		secret: 'secret',
		saveUninitialized: true,
		resave: true,
	})
);
// Flash message
app.use(flash());

// override with _method input hidden inside form
app.use(
	methodOverride(function (req, res) {
		if (req.body && typeof req.body === 'object' && '_method' in req.body) {
			// look in urlencoded POST bodies and delete it
			var method = req.body._method;
			delete req.body._method;
			return method;
		}
	})
);

// File upload
app.use(fileupload({ safeFileNames: true, preserveExtension: true }));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/', home);
app.use('/about', about);
app.use('/comics', comics);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

const PORT = process.env.PORT || 5000;

// Sync sequelize models
models.sequelize.sync().then(() => {
	const server = app.listen(
		PORT,
		console.log(
			`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
		)
	);

	// Handle promises rejections
	process.on('unhandledRejection', (err, promise) => {
		console.log(`Error: ${err.message}`);
		// Close server
		server.close(() => process.exit(1));
	});
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

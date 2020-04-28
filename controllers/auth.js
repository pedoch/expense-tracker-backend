const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed');
		error.statusCode = 422;
		error.data = errors.array();
		throw error;
	}
	const email = req.body.email;
	const name = req.body.name;
	const password = req.body.password;
	bcrypt
		.hash(password, 12)
		.then((hashedPassword) => {
			const user = new User({
				email: email,
				password: hashedPassword,
				name: name,
			});

			return user.save();
		})
		.then((result) => {
			res.status(201).json({
				message: 'User created',
				// userId: {name: result.name, email: result.email, _id: result._id}
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				error.statusCode = 500;
			}
			next(err);
		});
};

exports.login = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	let loadeduser;

	User.findOne({ email: email })
		.then((user) => {
			if (!user) {
				const error = new Error('User does nnot exist');
				error.statusCode = 401;
				throw error;
			}
			loadeduser = user;
			return bcrypt.compare(password, user.password);
		})
		.then((isEqual) => {
			if (!isEqual) {
				const error = new Error('Wrong password');
				error.statusCode = 401;
				throw error;
			}

			const token = jwt.sign(
				{
					email: loadeduser.email,
					userId: loadeduser._id.toString(),
				},
				'howilikesmart15window@Fartingharper75#seventy',
			);
			res.status(200).json({
				token: token,
				user: {
					email: loadeduser.email,
					name: loadeduser.name,
					transactions: loadeduser.transactions,
					_id: loadeduser._id,
				},
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				error.statusCode = 500;
			}
			next(err);
		});
};

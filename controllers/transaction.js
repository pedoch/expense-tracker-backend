const { validationResult } = require('express-validator');

const User = require('../models/user');

exports.createTransaction = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed');
		error.statusCode = 422;
		throw error;
	}

	let loadedUser;

	User.findById(req.userId)
		.then((user) => {
			if (!user) {
				const error = new Error('Could not find user.');
				error.statusCode = 404;
				throw error;
			}

			loadedUser = user;

			const amount = req.body.amount;
			const userId = req.userId;
			const text = req.body.text;

			const transaction = {
				amount: amount,
				userId: userId,
				text: text,
			};

			loadedUser.transactions.push(transaction);
			loadedUser.save();

			return res.status(201).json({
				message: 'Transaction created succefully',
				transaction: transaction,
			});
		})
		.catch((err) => {
			const error = new Error('Could not create transaction');
			error.statusCode = 500;
			throw error;
		});
};

exports.deleteTransaction = (req, res, next) => {
	const transactionId = req.params.transactionId;
	User.findById(req.userId)
		.then((user) => {
			if (!user) {
				const error = new Error('Could not find user.');
				error.statusCode = 404;
				throw error;
			}

			let trans = user.transactions.filter((transaction) => {
				if (transaction._id.toString() !== transactionId) return transaction;
			});

			user.transactions = trans;

			return user.save();
		})
		.then((result) => {
			res.status(200).json({ message: 'transaction deleted.' });
		})
		.catch((err) => {
			if (!err.statusCode) {
				error.statusCode = 500;
			}
			next(err);
		});
};

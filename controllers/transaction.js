const { validationResult } = require('express-validator');

const User = require('../models/user');
const Transaction = require('../models/transaction');

exports.getTransactions = (req, res, next) => {
	Transaction.find({ userId: req.params.userId })
		.then((transactions) => {
			res
				.status(200)
				.json({ message: 'Found transactions', transactions: transactions });
		})
		.catch((err) => {
			if (!err.statusCode) {
				error.statusCode = 500;
			}
			next(err);
		});
};

exports.createTransaction = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed');
		error.statusCode = 422;
		throw error;
	}

	const amount = req.body.amount;
	const text = req.body.text;
	const userId = req.userId;

	User.findById(userId)
		.then((user) => {
			if (!user) {
				const error = new Error('User not found');
				error.statusCode = 422;
				throw error;
			}
			const transaction = new Transaction({
				amount: amount,
				text: text,
				userId: userId,
			});

			transaction
				.save()
				.then((result) => {
					user.transactions = [result._id, ...user.transactions];
					return user.save();
				})
				.then((result) => {
					return User.findById(userId)
						.populate({
							path: 'transactions',
							populate: { path: 'transactions' },
						})
						.then((popUser) => {
							return res.status(201).json({
								message: 'Transaction created succefully',
								transactions: popUser.transactions,
							});
						})
						.catch((err) => {
							if (!err.statusCode) {
								err.statusCode = 500;
							}
							next(err);
						});
				})
				.catch((err) => {
					if (!err.statusCode) {
						err.statusCode = 500;
					}
					next(err);
				});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.deleteTransaction = (req, res, next) => {
	const transactionId = req.params.transactionId;

	let loadedUser;
	User.findById(req.userId)
		.populate({
			path: 'transactions',
			populate: { path: 'transactions' },
		})
		.then((user) => {
			if (!user) {
				const error = new Error('Could not find user.');
				error.statusCode = 404;
				throw error;
			}

			loadedUser = user;

			return (loadedUser.transactions = loadedUser.transactions.filter(
				(transaction) => {
					if (transaction._id.toString() !== transactionId) return transaction;
				},
			));
		})
		.then(() => {
			Transaction.findById(transactionId)
				.then((transaction) => {
					if (!transaction) {
						const error = new Error('Could not find transaction.');
						error.statusCode = 404;
						throw error;
					}
					if (transaction.userId.toString() !== req.userId) {
						const error = new Error('Not Authorized');
						error.statusCode = 403;
						throw error;
					}

					loadedUser.save();
					return Transaction.findByIdAndRemove(transactionId);
				})
				.then((result) => {
					return User.findById(req.userId)
						.populate({
							path: 'transactions',
							populate: { path: 'transactions' },
						})
						.then((popUser) => {
							return res.status(201).json({
								message: 'Transaction deleted',
								transactions: popUser.transactions,
							});
						})
						.catch((err) => {
							if (!err.statusCode) {
								err.statusCode = 500;
							}
							next(err);
						});
				})
				.catch((err) => {
					if (!err.statusCode) {
						err.statusCode = 500;
					}
					next(err);
				});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

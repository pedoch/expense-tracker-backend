const { validationResult } = require('express-validator');

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
	const userId = req.body.userId;
	const text = req.body.text;
	const transaction = new Transaction({
		amount: amount,
		userId: userId,
		text: text,
	});

	transaction
		.save()
		.then((result) => {
			res.status(201).json({
				message: 'Transaction created succefully',
				transaction: transaction,
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				error.statusCode = 500;
			}
			next(err);
		});
};

exports.deleteTransaction = (req, res, next) => {
	const transactionId = req.params.transactionId;
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
			return Transaction.findByIdAndRemove(transactionId);
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

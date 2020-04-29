const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const isAuth = require('../middleware/is-auth');

const transactionController = require('../controllers/transaction');

const router = express.Router();

router.put(
	'/create-transaction',
	isAuth,
	[body('amount').not().isEmpty(), body('text').not().isEmpty()],
	transactionController.createTransaction,
);

router.delete(
	'/delete-transaction/:transactionId',
	isAuth,
	transactionController.deleteTransaction,
);

module.exports = router;

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transaction');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});

// app.get('/', (req, res) => res.send('Working!!!'));

app.use('/auth', authRoutes);
app.use('/transaction', transactionRoutes);

mongoose
	.connect('mongodb+srv://deltanboi:cf7P8lO8rF0lQM8h@cluster0-bjxhf.mongodb.net/expense-tracker')
	.then((result) => {
		app.listen(process.env.PORT || 3000, function() {
			console.log('server running on port 3000', '');
		});
	})
	.catch((err) => console.log(err));

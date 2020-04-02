const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
	{
		amount: {
			type: Number,
			required: true
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true
		}
	},
	{
		timestamps: true
	}
);

module.exports = mongoose.model('Transaction', transactionSchema);

const mongoose = require("mongoose");

// Define the schema for the ClientPayment model
const clientPaymentSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        unique: true,
    },
    block: {
        type: Number,
        required: true,
        unique: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    checkingFromFunc: {
        type: Number,
        required: true,
    },
});

// Create the ClientPayment model
const ClientPayment = mongoose.model("ClientPayment", clientPaymentSchema);

module.exports = ClientPayment;

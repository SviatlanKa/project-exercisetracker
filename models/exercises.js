const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let exerciseSchema = new Schema({
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: Date,
    username: { type: String },
    userId: { type: String, ref: 'Users' },
}, {versionKey: false});

module.exports = mongoose.model('Exercises', exerciseSchema);
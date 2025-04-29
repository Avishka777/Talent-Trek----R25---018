const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobSchema = new Schema({
    title: { type: String, required: true },
    date: { type: String, required: true },
    link: { type: String, required: true },
    image: { type: String },
    description: { type: String }
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;

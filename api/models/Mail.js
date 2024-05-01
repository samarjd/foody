const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const MailSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true},
    message: { type: String, required: true, trim: true},
    type: { type: String, required: true, trim: true},
},
{
    timestamps: true,
}
);


const MailModel = model('Mail', MailSchema);
module.exports = MailModel;
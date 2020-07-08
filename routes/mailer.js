const mailer = require('nodemailer');
require('dotenv').config();

const transporter = mailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
        type: "login",
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

module.exports = transporter;
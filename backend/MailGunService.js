require('dotenv').config();
const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY
});

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Job Matcher <${process.env.MAILGUN_SENDER}>`,
      to: [to],
      subject,
      text,
      html
    });

    console.log("Email sent:", result);
    return result;
  } catch (error) {
    console.error("Mailgun error:", error.response?.body || error.message);
    throw error;
  }
};

module.exports = { sendEmail };
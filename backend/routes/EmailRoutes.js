const express = require("express");
const router = express.Router();
const { sendJobEmail } = require("../controllers/emailController");

router.post("/send", sendJobEmail);

module.exports = router;
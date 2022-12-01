const express = require("express");
const router = express.Router();

const contactsController = require("../../controllers/contacts/contacts");
const auth = require("../../middleware/auth");

router.get("/contacts/:userId", auth, contactsController.getContacts);

module.exports = router;

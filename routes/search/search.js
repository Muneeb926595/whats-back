const express = require("express");
const router = express.Router();

const searchController = require("../../controllers/search/search");
const auth = require("../../middleware/auth");

router.get("/search-users", auth, searchController.searchUsers);

module.exports = router;

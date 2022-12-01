const clientRoutes = require("./auth/user");
const contactsRoutes = require("./contacts/contacts");
const searchRoutes = require("./search/search");
const messageRoutes = require("./message/message");

module.exports = [].concat(
  clientRoutes,
  contactsRoutes,
  searchRoutes,
  messageRoutes
);

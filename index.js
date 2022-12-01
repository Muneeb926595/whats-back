const express = require("express");
const config = require("config");
require("express-async-errors");
const path = require("path");
const socketio = require("socket.io");

const errorController = require("./controllers/error");
const routes = require("./routes");
const { createNewMessage } = require("./controllers/message/message");
const {
  createNewContact,
  updateContactStatus,
} = require("./controllers/contacts/contacts");
const DBConnection = require("./startup/dbConnection");
const errors = require("./middleware/errors");
const http = require("http");

DBConnection();
const app = express();
require("./startup/prod")(app);
app.use(express.json());

app.use("/api/images", express.static(path.join(__dirname, "public/uploads")));
app.use(
  "/api/videos",
  express.static(path.join(__dirname, "public/uploads/videos"))
);
app.use("/api", routes);
app.use(errors);
app.use(errorController.get404);

const port = process.env.PORT || config.get("port");

var httpServer = http.createServer(app);
httpServer.listen(port, () => {
  console.log("[ Http server running at port ] ", port);
});

const io = socketio(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("join", (roomNo) => {
    socket.join(roomNo);
  });

  socket.on(
    "message",
    async ({ contactId, senderId, recieverId, message, read }) => {
      if (contactId) {
        const result = await createNewMessage(
          contactId,
          senderId,
          recieverId,
          message,
          read
        );
        io.sockets.in(contactId).emit("message", {
          contactId,
          senderId,
          recieverId,
          message,
          read,
          messageId: result._id,
        });
        updateContactStatus(contactId);
      } else {
        const { newContactCreated, newContactId, contactResult } =
          await createNewContact(senderId, recieverId);

        socket.join(newContactId);

        if (newContactCreated) {
          const result = await createNewMessage(
            newContactId,
            senderId,
            recieverId,
            message,
            read
          );
          io.sockets.to(recieverId).to(senderId).emit("new-contact", {
            _id: newContactId,
            senderId,
            contactResult,
            message,
          });
          io.sockets.in(newContactId).emit("message", {
            contactId: newContactId,
            senderId,
            recieverId,
            message,
            messageId: result._id,
          });
          updateContactStatus(newContactId);
        } else {
          const result = await createNewMessage(
            newContactId,
            senderId,
            recieverId,
            message,
            read
          );
          io.sockets.in(newContactId).emit("message", {
            contactId: newContactId,
            senderId,
            recieverId,
            message,
            messageId: result._id,
          });
          updateContactStatus(newContactId);
        }
      }
    }
  );

  socket.on("stream-inform-event", ({ hostId, hostName, guestId,isVideoCall }) => {
    io.sockets.in(guestId).emit("stream-inform-event", {
      hostId,
      hostName,
      isVideoCall
    });
  });

  socket.on("call-accepted", (hostId, guestId) => {
    socket.to(hostId).emit("call-accepted", hostId, guestId);
  });

  socket.on("candidate", (hostId, guestId, message) => {
    socket.to(guestId).emit("candidate", hostId, message);
  });

  socket.on("webrtc-offer", (hostId, guestId, message) => {
    socket.to(guestId).emit("webrtc-offer", hostId, message);
  });

  socket.on("webrtc-answer", (broadcasterId, watcherId, message) => {
    socket.to(broadcasterId).emit("webrtc-answer", watcherId, message);
  });
});

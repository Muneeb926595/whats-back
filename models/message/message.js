const mongoose = require("mongoose");
const { Schema } = mongoose;
const message = new Schema(
  {
    contactId: {
      type: Schema.Types.ObjectId,
      ref: "contact",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    message: {
      type: String,
    },
    read: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);
const Message = mongoose.model("message", message);
module.exports.Message = Message;

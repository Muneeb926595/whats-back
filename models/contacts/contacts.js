const mongoose = require("mongoose");
const { Schema } = mongoose;

const contact = new Schema(
  {
    participents: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    ],
    deletedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);
const Contact = mongoose.model("contact", contact);
module.exports.Contact = Contact;

const mongoose = require("mongoose");
const Jwt = require("jsonwebtoken");
const Joi = require("joi");
const config = require("config");

const { Schema } = mongoose;

const user = new Schema(
  {
    userName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    image: {
      type: String,
    },
    password: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

user.methods.getAuthToken = function () {
  return Jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    config.get("jwtPrivateKey")
  );
};
const User = mongoose.model("user", user);
const validateUser = (user) => {
  const schema = {
    userName: Joi.string().min(3).max(255).required(),
    email: Joi.string().min(4).max(255).required(),
    password: Joi.string().min(3).max(255),
  };
  return Joi.validate(user, schema);
};
module.exports.User = User;
module.exports.validateUser = validateUser;

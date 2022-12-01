const bycrypt = require("bcryptjs");
const mongoose = require("mongoose");
const fs = require("fs");

const { User, validateUser } = require("../../models/auth/user");
const utils = require("../../utils");

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    $or: [{ email: email }, { userName: email }],
  });
  if (!user) {
    return res.status(400).send("Email not found");
  }

  const isUserCorrect = await bycrypt.compare(password, user.password);

  if (!isUserCorrect) {
    return res.status(400).send("Password is invalid!");
  }
  const accessToken = user.getAuthToken();

  return res
    .status(200)
    .send({ _id: user._id, accessToken, userName: user.userName });
};
exports.createUser = async (req, res, next) => {
  const { error } = validateUser(req.body);
  if (error) {
    return res.status("400").send(error.details[0].message);
  }
  const { userName, email, password } = req.body;

  const checkUserName = await User.findOne({ userName: userName }).lean();
  const checkEmail = await User.findOne({ email: email }).lean();

  if (checkEmail) {
    return res.status("400").send("Email Already Exist");
  }
  if (checkUserName) {
    return res.status("400").send("User Name Already Exist");
  }

  const hashPass = await bycrypt.hash(password, 8);

  const client = new User({
    userName,
    email,
    password: hashPass,
  });

  const result = await client.save();
  const accessToken = client.getAuthToken();
  return res
    .status(200)
    .send({ _id: result._id, accessToken, userName: result.userName });
};

exports.socialLogin = async (req, res, next) => {
  const { email, userName, socialId, imageUrl } = req.body;
  const checkEmail = await User.findOne({
    email: email,
  });

  if (checkEmail) {
    if (!checkEmail.image) {
      const client = {
        image: imageUrl,
      };
      const updatedUser = await User.findByIdAndUpdate(checkEmail._id, client);
    }
    if (!checkEmail.socialId) {
      const client = {
        socialId,
      };
      const updatedUser = await User.findByIdAndUpdate(checkEmail._id, client);
    }
    const accessToken = checkEmail.getAuthToken();
    return res.status(200).send({
      _id: checkEmail._id,
      accessToken,
      userName: checkEmail.userName,
      image: imageUrl,
    });
  }

  const checkUserName = await User.findOne({ userName: userName }).lean();
  if (checkUserName) {
    return res.status("400").send("User Name Already Exists!");
  }

  const newclient = new User({
    userName,
    email,
    socialId,
    image: imageUrl,
  });
  if (!userName) {
    return res.status("400").send("UserName is Undefined!");
  }
  if (!email) {
    return res.status("400").send("Email is Undefined!");
  }

  const result = await newclient.save();
  const accessToken = newclient.getAuthToken();
  return res.status(200).send({
    _id: result._id,
    accessToken,
    userName: result.userName,
    image: result.image,
  });
};

exports.getUserById = async (req, res, next) => {
  const { userId } = req.params;
  const result = await User.findOne({ _id: mongoose.Types.ObjectId(userId) });
  return res.status(200).send(result);
};
exports.updateUserImage = async (req, res, next) => {
  const id = req.params.userId;
  const { image } = req.body;
  const client = {
    image,
  };
  const updatedUser = await User.findByIdAndUpdate(id, client);

  return res.status(200).send(updatedUser);
};

const { Contact } = require("../../models/contacts/contacts");
const mongoose = require("mongoose");

exports.getContacts = async (req, res, next) => {
  const { userId } = req.params;

  const chats = await Contact.aggregate([
    {
      $match: {
        $and: [
          { participents: { $in: [mongoose.Types.ObjectId(userId)] } },
          { deletedBy: { $nin: [mongoose.Types.ObjectId(userId)] } },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "participents",
        as: "participents",
      },
    },
    {
      $lookup: {
        from: "messages",
        localField: "_id",
        foreignField: "contactId",
        as: "lastMessage",
      },
    },
    {
      $addFields: {
        lastMessage: { $slice: ["$lastMessage", -1] },
      },
    },
    { $unwind: "$lastMessage" },
    { $sort: { createdAt: -1 } },
  ]);
  return res.status(200).send(chats);
};
exports.createNewContact = async (senderId, recieverId) => {
  const users = [senderId, recieverId];
  const checkUser = await Contact.findOne({
    $and: [
      { participents: { $size: 2 } },
      {
        participents: { $all: [senderId, recieverId] },
      },
    ],
  });
  let newContactCreated;
  let newContactId;
  if (checkUser) {
    newContactCreated = false;
    newContactId = checkUser._id;

    return { newContactCreated, newContactId };
  } else {
    const client = new Contact({
      participents: users,
    });

    const result = await client.save();
    const contactResult = await Contact.findOne({ _id: result._id }).populate(
      "participents",
      " _id fullName userName email image"
    );
    newContactId = result._id;
    newContactCreated = true;

    return { newContactCreated, newContactId, contactResult };
  }
};
exports.updateContactStatus = async (contactId) => {
  const newContactClient = {
    deletedBy: [],
  };

  const result = await Contact.findByIdAndUpdate(contactId, newContactClient);
};

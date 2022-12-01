const { Message } = require("../../models/message/message");
const { Contact } = require("../../models/contacts/contacts");
const { User } = require("../../models/auth/user");

exports.createNewMessage = async (
  contactId,
  senderId,
  recieverId,
  message,
  read
) => {
  let result;
  if (contactId) {
    const client = new Message({
      contactId,
      senderId,
      message,
      read,
    });

    result = await client.save();
  } else {
    const checkChatExist = await Contact.findOne({
      $and: [
        { participents: { $size: 2 } },
        {
          participents: { $all: [senderId, recieverId] },
        },
      ],
    });
    if (checkChatExist) {
      const client = new Message({
        contactId: checkChatExist._id,
        senderId,
        message,
        read,
      });

      result = await client.save();
    }
  }
  // const user = await User.find({ _id: recieverId });
  // const sender = await User.findOne({ _id: senderId });
  // const tokens = [];
  // user.map((user) => {
  //   if (user.token) tokens.push(user.token);
  // });
  // if (tokens.length > 0) {
  //   await pushNotifications(
  //     tokens,
  //     "New Message Recieved",
  //     message,
  //     sender.userName
  //   );
  //   const notification = new Notification({
  //     userId: recieverId,
  //     read: false,
  //     action: "Created New Message",
  //   });
  //   const notificationResult = await notification.save();
  // }
  return result;
};

exports.getUserChat = async (req, res, next) => {
  const { userId, participentId, page = 1, limit = 50 } = req.query;
  let checkUser = await Contact.findOne({
    $and: [
      { participents: { $size: 2 } },
      {
        participents: { $all: [userId, participentId] },
      },
    ],
  });

  if (!checkUser) {
    return res.status(200).send("Not Found");
  }

  let result = await Message.aggregate([
    {
      $match: {
        contactId: checkUser._id,
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        stage1: [{ $group: { _id: null, count: { $sum: 1 } } }],
        stage2: [
          {
            $skip: (page - 1) * limit,
          },
          { $limit: limit * 1 },
        ],
      },
    },
    {
      $unwind: {
        path: "$stage1",
      },
    },
    {
      $project: {
        count: "$stage1.count",
        data: "$stage2",
      },
    },
  ]);

  const totalPages = result[0] ? result[0].count : 0;
  result = result[0] ? result[0].data : [];

  return res.status(200).send({
    messages: result,
    totalPages: Math.ceil(totalPages / limit),
    currentPage: parseInt(page),
  });
};

exports.seenAllMessages = async (req, res, next) => {
  const { userId, contactId } = req.body;

  const result = await Message.updateMany(
    { contactId: contactId, senderId: { $ne: userId } },
    { read: true }
  );
  return res.status(200).send(result);
};

exports.readOneMessage = async (req, res, next) => {
  const { messageId } = req.body;
  const result = await Message.updateOne({ _id: messageId }, { read: true });
  return res.status(200).send(result);
};

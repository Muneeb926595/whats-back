const { User } = require("../../models/auth/user");

exports.searchUsers = async (req, res, next) => {
  const { usersPage = 1, usersLimit = 25, searchText, userId } = req.query;

  var Value_match = new RegExp(searchText, "i");

  let users = await User.aggregate([
    {
      $match: {
        $or: [{ userName: { $regex: Value_match } }],
      },
    },
    {
      $project: {
        userName: 1,
        email: 1,
        image: 1,
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        stage1: [{ $group: { _id: null, count: { $sum: 1 } } }],
        stage2: [
          {
            $skip: (usersPage - 1) * usersLimit,
          },
          { $limit: usersLimit * 1 },
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

  const usersCount = users[0] ? users[0].count : 0;
  users = users[0] ? users[0].data : [];

  return res.status(200).send({
    users: users,
    totalPages: Math.ceil(usersCount / usersLimit),
    currentPage: parseInt(usersPage),
  });
};

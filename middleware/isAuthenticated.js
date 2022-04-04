const jwt = require("jsonwebtoken");
const db = require("../models");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.sendStatus(401);
  }

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    const data = jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
      if (err) {
        return null;
      }

      return data;
    });

    if (data && data.user) {
      req.user = await db.User.findByPk(data.user.id, { include: db.Group });

      if (!req.user) {
        return res.sendStatus(401);
      }

      next();
    } else {
      res.sendStatus(401);
    }
  }
};

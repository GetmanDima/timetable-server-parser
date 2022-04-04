module.exports = (belongs) => {
  return async (req, res, next) => {
    if (belongs && req.user.groupId === null) {
      return res.sendStatus(403)
    }

    if (!belongs && req.user.groupId !== null) {
      return res.sendStatus(403)
    }

    next()
  }
}

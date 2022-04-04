module.exports = async (req, res, next) => {
  if (req.user.type !== 'leader') {
    return res.sendStatus(403)
  }

  next()
}
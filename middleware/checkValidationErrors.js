const {validationResult} = require("express-validator");

module.exports = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorsArray = errors.array()

    for (const error of errorsArray) {
      if (error.location === "params") {
        return res.sendStatus(404)
      }
    }

    return res.status(400).json({errors: errorsArray});
  } else {
    next()
  }
}
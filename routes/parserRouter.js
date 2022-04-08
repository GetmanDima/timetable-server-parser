const express = require("express");
const { body } = require("express-validator");
const checkValidationErrors = require("../middleware/checkValidationErrors");
const downloadFileByUrl = require("../middleware/downloadFileByUrl");
const MtuciController = require("../controllers/MtuciController");
const isAuthenticated = require("../middleware/isAuthenticated");
const isUserLeader = require("../middleware/isUserLeader");
const userBelongsToGroup = require("../middleware/userBelongsToGroup");

const router = express.Router();

router.post(
  "/mtuci",
  body("url").isString().notEmpty(),
  body("name").isString().notEmpty(),
  checkValidationErrors,
  downloadFileByUrl,
  MtuciController.parse
);

module.exports = router;

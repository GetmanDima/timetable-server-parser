const express = require("express");
const { body } = require("express-validator");
const checkValidationErrors = require("../middleware/checkValidationErrors");
const downloadFileByUrl = require("../middleware/downloadFileByUrl");
const MtuciController = require("../controllers/MtuciController");

const router = express.Router();

router.post(
  "/mtuci",
  body("group").isString().notEmpty(),
  body("url").isString().notEmpty(),
  checkValidationErrors,
  downloadFileByUrl,
  MtuciController.parse
);

module.exports = router;

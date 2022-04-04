const express = require("express");
const parserRouter = require("./parserRouter");

const router = express.Router();

router.use("/parsers", parserRouter);

module.exports = router;

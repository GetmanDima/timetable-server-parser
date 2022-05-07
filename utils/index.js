const fs = require("fs");
const moment = require("moment");

module.exports.timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports.writeLog = (logFilePath, data) => {
  fs.appendFile(
    logFilePath,
    `${moment().format("DD-MM-YYYY HH:mm:ss")}: ${data}\n`,
    function (err) {
      if (err) {
        console.log(err);
      }
    }
  );
};

var https = require("https");
var fs = require("fs");

module.exports = async (req, res, next) => {
  const dest =
    "uploads/" +
    Date.now().toString() +
    "--" +
    req.body.group +
    "--timetable--.xlsx";

  try {
    const file = fs.createWriteStream(dest);

    https
      .get(req.body.url, function (response) {
        response.pipe(file);
        file.on("finish", function () {
          req.dest = dest;
          file.close();
          next();
        });
      })
      .on("error", function (err) {
        fs.unlink(dest);
        res.sendStatus(500);
      });
  } catch (_) {
    res.sendStatus(500);
  }
};

var https = require("https");
var fs = require("fs");

module.exports = async (req, res, next) => {
  const dest =
    "uploads/" +
    Date.now().toString() +
    "--" +
    req.user.Group.name +
    "--timetable.xlsx";

  try {
    const files = fs.readdirSync("uploads/");

    for (let i = files.length - 1; i > 0; i--) {
      const start = files[i].indexOf("--");
      const end = files[i].lastIndexOf("--timetable");

      if (start !== -1 && end !== -1) {
        const groupName = files[i].slice(start + 2, end);

        if (groupName === req.user.Group.name) {
          const fileCreatedDate = new Date(parseInt(files[i].slice(0, start)));

          if (Date.now() - fileCreatedDate < 3600 * 1000) {
            req.dest = `uploads/${files[i]}`;
            return next();
          }
        }
      }
    }
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
        console.log(err);
        fs.unlink(dest, (e) => {
          console.log(e);
        });
        res.sendStatus(500);
      });
  } catch (_) {
    res.sendStatus(500);
  }
};

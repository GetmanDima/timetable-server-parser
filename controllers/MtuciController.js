const XLSX = require("xlsx");
const parser1 = require("../parsers/mtuci/parser1");
const parser2 = require("../parsers/mtuci/parser2");

class MtuciController {
  static async parse(req, res) {
    const group = req.body.group;
    const dest = req.dest;

    try {
      const wb = XLSX.readFile(dest);
      const ws = wb.SheetNames[0];
      const sheet = wb.Sheets[ws];

      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (data[1][0] && data[1][0].toLowerCase() === "пн") {
        res.json(parser2.run(wb, group));
      } else {
        res.json(parser1.run(wb, group));
      }
    } catch (_) {
      res.sendStatus(500);
    }
  }
}

module.exports = MtuciController;

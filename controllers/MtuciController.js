const XLSX = require("xlsx");
const { getParser } = require("../parsers/mtuci");
const {
  getOrCreateUniversity,
  getOrCreateGroup,
  sendParsedDataToDb,
} = require("../parserServer");

class MtuciController {
  static universityName = "МТУСИ";

  static async parse(req, res) {
    const groupName = req.body.name;
    const filePath = req.filePath;

    try {
      const wb = XLSX.readFile(filePath);
      const parser = getParser(wb);
      const parsedTimetableData = parser.run(groupName);

      const university = await getOrCreateUniversity(
        MtuciController.universityName
      );
      const group = await getOrCreateGroup(groupName, university);

      await sendParsedDataToDb(parsedTimetableData, group);

      res.json(parsedTimetableData);
    } catch (_) {
      res.sendStatus(500);
    }
  }
}

module.exports = MtuciController;

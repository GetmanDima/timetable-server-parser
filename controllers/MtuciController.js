const { Op } = require("sequelize");
const XLSX = require("xlsx");
const db = require("../models");
const timetable = require("../models/timetable");
const parser1 = require("../parsers/mtuci/parser1");
const parser2 = require("../parsers/mtuci/parser2");
const ParserServer = require("../ParserServer");

class MtuciController {
  static async getOrCreateUniversity(name) {
    let university = await db.University.findOne({
      where: { name },
      include: {
        model: db.Right,
        include: {
          model: db.Role,
          where: {
            name: "all",
          },
          required: true,
        },
        required: true,
      },
    });

    if (university) {
      return university;
    }

    const right = await db.Right.create();
    const role = await db.Role.findOne({ name: "all" });

    if (!role) {
      return res.sendStatus(500);
    }

    return await db.sequelize.transaction(async (t) => {
      await db.Role_Right.create(
        { rightId: right.id, roleId: role.id, action: "r" },
        { transaction: t }
      );
      return await db.University.create(
        {
          name: "МТУСИ",
          rightId: right.id,
        },
        { transaction: t }
      );
    });
  }

  static async getOrCreateGroup(university, name) {
    let group = await db.Group.findOne({
      where: {
        [Op.and]: {
          name,
          creationType: "parsed",
          universityId: university.id,
        },
      },
    });

    if (group) {
      return group;
    }

    const right = await db.Right.create({});
    const role = await db.Role.findOne({ name: "all" });

    return await db.sequelize.transaction(async (t) => {
      await db.Role_Right.create(
        { rightId: right.id, roleId: role.id, action: "r" },
        { transaction: t }
      );
      return await db.Group.create(
        {
          name,
          creationType: "parsed",
          universityId: university.id,
          rightId: right.id,
        },
        { transaction: t }
      );
    });
  }

  static async parse(req, res) {
    const groupName = req.body.name;
    const filePath = req.filePath;

    //try {
    const wb = XLSX.readFile(filePath);
    const ws = wb.SheetNames[0];
    const sheet = wb.Sheets[ws];

    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    let parsedTimetableData;

    if (data[1][0] && data[1][0].toLowerCase() === "пн") {
      parsedTimetableData = parser2.run(wb, groupName);
    } else if (data[3][0] && data[3][0].toLowerCase() === "пн") {
      parsedTimetableData = parser2.run(wb, groupName, 2);
    } else {
      parsedTimetableData = parser1.run(wb, groupName);
    }

    if (Object.keys(parsedTimetableData).length == 0) {
      return res.sendStatus(500);
    }

    const university = await MtuciController.getOrCreateUniversity("МТУСИ");
    const group = await MtuciController.getOrCreateGroup(university, groupName);

    const parserServer = new ParserServer(university, group);
    await parserServer.run(parsedTimetableData);

    return res.json(parsedTimetableData);
    // } catch (_) {
    //   res.sendStatus(500);
    // }
  }
}

module.exports = MtuciController;

const XLSX = require("xlsx");
const db = require("../models");
const parser1 = require("../parsers/mtuci/parser1");
const parser2 = require("../parsers/mtuci/parser2");

class MtuciController {
  static async createTimetable(groupId) {
    return await db.Timetable.create({
      name: "Main",
      groupId: groupId,
    });
  }

  static async createClassTimes(classTimes, groupId) {
    return await db.ClassTime.bulkCreate(
      classTimes.map((time) => {
        return {
          ...time,
          groupId: groupId,
        };
      })
    );
  }

  static async getOrCreateSubject(name) {
    let subject = await db.Subject.findOne({
      where: { name },
    });

    if (!subject) {
      subject = await db.Subject.create({
        name,
      });
    }

    return subject;
  }

  static async getOrCreateTeacher(name) {
    let teacher = await db.Teacher.findOne({
      where: { name },
    });

    if (!teacher) {
      teacher = await db.Teacher.create({
        name,
      });
    }

    return teacher;
  }

  static async createWeekTypeDays(
    weekDaysData,
    weekDay,
    weekType,
    classTimes,
    timetableId
  ) {
    const weekTypeDayData = weekDaysData[weekDay][weekType];

    for (let i = 0; i < weekTypeDayData.length; i++) {
      const timetableDayData = {
        weekDay,
        format: weekTypeDayData[i].format || "очно",
        subjectType: weekTypeDayData[i].subjectType,
        weekType: weekType,
        classTimeId: classTimes[i].id,
        timetableId: timetableId,
      };

      if (weekTypeDayData[i].subject) {
        let subject = await MtuciController.getOrCreateSubject(
          weekTypeDayData[i].subject
        );

        timetableDayData.subjectId = subject.id;
      }

      if (weekTypeDayData[i].teacher) {
        let teacher = await MtuciController.getOrCreateTeacher(
          weekTypeDayData[i].teacher
        );

        timetableDayData.teacherId = teacher.id;
      }

      await db.TimetableDay.create(timetableDayData);
    }
  }

  static createTimetableDays(weekDaysData, classTimes, timetableId) {
    for (const weekDay in weekDaysData) {
      for (const weekType in weekDaysData[weekDay]) {
        MtuciController.createWeekTypeDays(
          weekDaysData,
          weekDay,
          weekType,
          classTimes,
          timetableId
        );
      }
    }
  }

  static async parse(req, res) {
    const groupId = req.user.Group.id;
    const groupName = req.user.Group.name;
    const dest = req.dest;

    //try {
    const wb = XLSX.readFile(dest);
    const ws = wb.SheetNames[0];
    const sheet = wb.Sheets[ws];

    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    let parsedData;

    if (data[1][0] && data[1][0].toLowerCase() === "пн") {
      parsedData = parser2.run(wb, groupName);
    } else if (data[3][0] && data[3][0].toLowerCase() === "пн") {
      parsedData = parser2.run(wb, groupName, 2);
    } else {
      parsedData = parser1.run(wb, groupName);
    }

    const timetable = await MtuciController.createTimetable(groupId);

    const classTimes = await MtuciController.createClassTimes(
      parsedData.classTimes,
      groupId
    );

    const weekDaysData = parsedData.weekDays;

    MtuciController.createTimetableDays(weekDaysData, classTimes, timetable.id);

    res.json(parsedData);
    // } catch (_) {
    //   res.sendStatus(500);
    // }
  }
}

module.exports = MtuciController;

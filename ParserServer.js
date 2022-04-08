const db = require("./models");

class ParserServer {
  group = {};
  timetable = {};
  classTimes = [];

  constructor(university, group) {
    this.university = university;
    this.group = group;
  }

  async getOrCreateTimetable() {
    const timetable = await db.Timetable.findOne({ groupId: this.group.id });

    if (timetable) {
      this.timetable = timetable;
    } else {
      const right = await db.Right.create({});
      const role = await db.Role.findOne({ name: "all" });

      this.timetable = await db.sequelize.transaction(async (t) => {
        await db.Role_Right.create(
          { rightId: right.id, roleId: role.id, action: "r" },
          { transaction: t }
        );
        return await db.Timetable.create(
          {
            name: "Parsed",
            creationType: "parsed",
            groupId: this.group.id,
            rightId: right.id,
          },
          { transaction: t }
        );
      });
    }
  }

  async getOrCreateClassTimes(classTimes) {
    this.classTimes = await db.ClassTime.bulkCreate(
      classTimes.map((time) => {
        return {
          ...time,
          timetableId: this.timetable.id,
        };
      })
    );
  }

  async getOrCreateSubject(name) {
    let subject = await db.Subject.findOne({
      where: { name, timetableId: this.timetable.id },
    });

    if (!subject) {
      subject = await db.Subject.create({
        name,
        timetableId: this.timetable.id,
      });
    }

    return subject;
  }

  async getOrCreateTeacher(name) {
    let teacher = await db.Teacher.findOne({
      where: { name, timetableId: this.timetable.id },
    });

    if (!teacher) {
      teacher = await db.Teacher.create({
        name,
        timetableId: this.timetable.id,
      });
    }

    return teacher;
  }

  async createWeekTypeDays(weekDaysData, weekDay, weekType) {
    const weekTypeDayData = weekDaysData[weekDay][weekType];

    for (let i = 0; i < weekTypeDayData.length; i++) {
      const timetableDayData = {
        weekDay,
        room: weekTypeDayData[i].room,
        weekType: weekType,
        format: weekTypeDayData[i].format || "очно",
        classType: weekTypeDayData[i].classType,
        classTimeId: this.classTimes[i].id,
        timetableId: this.timetable.id,
      };

      if (weekTypeDayData[i].subject) {
        let subject = await this.getOrCreateSubject(weekTypeDayData[i].subject);

        timetableDayData.subjectId = subject.id;
      }

      if (weekTypeDayData[i].teacher) {
        let teacher = await this.getOrCreateTeacher(weekTypeDayData[i].teacher);

        timetableDayData.teacherId = teacher.id;
      }

      await db.TimetableDay.create(timetableDayData);
    }
  }

  async createTimetableDays(weekDaysData) {
    for (const weekDay in weekDaysData) {
      for (const weekType in weekDaysData[weekDay]) {
        this.createWeekTypeDays(weekDaysData, weekDay, weekType);
      }
    }
  }

  async deleteClassTimes() {
    await db.ClassTime.destroy({
      where: { timetableId: this.timetable.id },
    });
  }

  async deleteTimetableDays() {
    await db.TimetableDay.destroy({
      where: { timetableId: this.timetable.id },
    });
  }

  async run(parsedTimetableData) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await this.getOrCreateTimetable();
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await this.deleteTimetableDays();
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await this.deleteClassTimes();
    await this.getOrCreateClassTimes(parsedTimetableData.classTimes);

    const weekDaysData = parsedTimetableData.weekDays;

    await new Promise((resolve) => setTimeout(resolve, 10000));
    await this.createTimetableDays(weekDaysData);
  }
}

module.exports = ParserServer;

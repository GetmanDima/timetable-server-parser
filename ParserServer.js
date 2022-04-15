const db = require("./models");

class ParserServer {
  group = {};
  timetable = {};
  classTimes = [];

  constructor(university, group) {
    this.university = university;
    this.group = group;
  }

  async run(parsedTimetableData) {
    //await new Promise((resolve) => setTimeout(resolve, 5000));
    await this._getOrCreateTimetable();
    //await new Promise((resolve) => setTimeout(resolve, 5000));
    await this._deleteLessons();
    //await new Promise((resolve) => setTimeout(resolve, 5000));
    await this._deleteClassTimes();
    await this._getOrCreateClassTimes(parsedTimetableData.classTimes);

    const weekDaysWithLessons = parsedTimetableData.weekDaysWithLessons;

    //await new Promise((resolve) => setTimeout(resolve, 5000));
    await this._createLessons(weekDaysWithLessons);
  }

  async _getOrCreateTimetable() {
    const timetable = await db.Timetable.findOne({
      where: { groupId: this.group.id },
    });

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
            name: `Parsed ${this.group.name}`,
            creationType: "parsed",
            groupId: this.group.id,
            rightId: right.id,
          },
          { transaction: t }
        );
      });
    }
  }

  async _deleteLessons() {
    await db.TimetableLesson.destroy({
      where: { timetableId: this.timetable.id },
    });
  }

  async _deleteClassTimes() {
    await db.ClassTime.destroy({
      where: { timetableId: this.timetable.id },
    });
  }

  async _getOrCreateClassTimes(classTimes) {
    this.classTimes = await db.ClassTime.bulkCreate(
      classTimes.map((time) => {
        return {
          ...time,
          timetableId: this.timetable.id,
        };
      })
    );
  }

  async _createLessons(weekDaysWithLessons) {
    for (const weekDay in weekDaysWithLessons) {
      for (const weekType in weekDaysWithLessons[weekDay]) {
        this._createWeekTypeLessons(weekDaysWithLessons, weekDay, weekType);
      }
    }
  }

  async _createWeekTypeLessons(weekDaysWithLessons, weekDay, weekType) {
    const weekTypeLessons = weekDaysWithLessons[weekDay][weekType];

    for (let i = 0; i < weekTypeLessons.length; i++) {
      const lesson = {
        weekDay,
        room: weekTypeLessons[i].room,
        weekType: weekType,
        format: weekTypeLessons[i].format || "очно",
        classType: weekTypeLessons[i].classType,
        classTimeId: this.classTimes[i].id,
        timetableId: this.timetable.id,
      };

      if (weekTypeLessons[i].subject) {
        let subject = await this._getOrCreateSubject(
          weekTypeLessons[i].subject
        );

        lesson.subjectId = subject.id;
      }

      if (weekTypeLessons[i].teacher) {
        let teacher = await this._getOrCreateTeacher(
          weekTypeLessons[i].teacher
        );

        lesson.teacherId = teacher.id;
      }

      await db.TimetableLesson.create(lesson);
    }
  }

  async _getOrCreateSubject(name) {
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

  async _getOrCreateTeacher(name) {
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
}

module.exports = ParserServer;

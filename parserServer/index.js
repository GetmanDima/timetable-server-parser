const { Op } = require("sequelize");
const db = require("../models");

module.exports.sendParsedDataToDb = async (parsedTimetableData, group) => {
  try {
    const timetable = await getOrCreateTimetable(group);

    if (!timetable) {
      return false;
    }

    await deleteLessons(timetable);
    await deleteClassTimes(timetable);
    await deleteWeekTypes(timetable);

    const classTimes = await createClassTimes(
      parsedTimetableData.classTimes,
      timetable
    );

    const weekDaysWithLessons = parsedTimetableData.weekDaysWithLessons;

    await createLessons(weekDaysWithLessons, classTimes, timetable);
  } catch (e) {
    console.log(e);
    return false;
  }
};

module.exports.getOrCreateUniversity = async (name) => {
  const university = await db.University.findOne({
    where: {
      name,
      rightId: {
        [Op.in]: db.Sequelize.literal('(SELECT "rightId" FROM "ParsedData")'),
      },
    },
    include: {
      model: db.Right,
      include: [
        {
          model: db.Role,
          where: {
            name: "all",
          },
          required: true,
        },
      ],
      required: true,
    },
  });

  if (university) {
    return university;
  }

  const right = await db.Right.create();
  await db.ParsedData.create({ rightId: right.id });
  const role = await db.Role.findOne({ name: "all" });

  if (!role) {
    return null;
  }

  return await db.sequelize.transaction(async (t) => {
    await db.Role_Right.create(
      { rightId: right.id, roleId: role.id, action: "r" },
      { transaction: t }
    );
    return await db.University.create(
      {
        name,
        rightId: right.id,
      },
      { transaction: t }
    );
  });
};

module.exports.getOrCreateGroup = async (name, university) => {
  const group = await db.Group.findOne({
    where: {
      [Op.and]: {
        name,
        universityId: university.id,
        rightId: {
          [Op.in]: db.Sequelize.literal('(SELECT "rightId" FROM "ParsedData")'),
        },
      },
    },
  });

  if (group) {
    return group;
  }

  const right = await db.Right.create({});
  await db.ParsedData.create({ rightId: right.id });
  const role = await db.Role.findOne({ name: "all" });

  if (!role) {
    return null;
  }

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
};

const getOrCreateTimetable = async (group) => {
  const timetable = await db.Timetable.findOne({
    where: {
      groupId: group.id,
      rightId: {
        [Op.in]: db.Sequelize.literal('(SELECT "rightId" FROM "ParsedData")'),
      },
    },
  });

  if (timetable) {
    return timetable;
  } else {
    const right = await db.Right.create({});
    await db.ParsedData.create({ rightId: right.id });
    const role = await db.Role.findOne({ name: "all" });

    return await db.sequelize.transaction(async (t) => {
      await db.Role_Right.create(
        { rightId: right.id, roleId: role.id, action: "r" },
        { transaction: t }
      );
      return await db.Timetable.create(
        {
          name: `Parsed ${group.name}`,
          creationType: "parsed",
          groupId: group.id,
          rightId: right.id,
        },
        { transaction: t }
      );
    });
  }
};

const deleteLessons = async (timetable) => {
  await db.TimetableLesson.destroy({
    where: { timetableId: timetable.id },
  });
};

const deleteClassTimes = async (timetable) => {
  await db.ClassTime.destroy({
    where: { timetableId: timetable.id },
  });
};

const deleteWeekTypes = async (timetable) => {
  await db.WeekType.destroy({
    where: { timetableId: timetable.id },
  });
};

const createClassTimes = async (classTimes, timetable) => {
  return await db.ClassTime.bulkCreate(
    classTimes.map((time) => {
      return {
        ...time,
        timetableId: timetable.id,
      };
    })
  );
};

const getOrCreateSubject = async (name, timetable) => {
  let subject = await db.Subject.findOne({
    where: { name, timetableId: timetable.id },
  });

  if (!subject) {
    subject = await db.Subject.create({
      name,
      timetableId: timetable.id,
    });
  }

  return subject;
};

const getOrCreateTeacher = async (name, timetable) => {
  let teacher = await db.Teacher.findOne({
    where: { name, timetableId: timetable.id },
  });

  if (!teacher) {
    teacher = await db.Teacher.create({
      name,
      timetableId: timetable.id,
    });
  }

  return teacher;
};

const getOrCreateWeekType = async (name, timetable) => {
  let weekType = await db.WeekType.findOne({
    where: { name, timetableId: timetable.id },
  });

  if (!weekType) {
    weekType = await db.WeekType.create({
      name,
      timetableId: timetable.id,
    });
  }

  return weekType;
};

const createLessons = async (weekDaysWithLessons, classTimes, timetable) => {
  for (const weekDay in weekDaysWithLessons) {
    for (const weekTypeName in weekDaysWithLessons[weekDay]) {
      const weekType = await getOrCreateWeekType(weekTypeName, timetable);
      await createWeekTypeLessons(
        weekDaysWithLessons,
        weekDay,
        weekType,
        classTimes,
        timetable
      );
    }
  }
};

const createWeekTypeLessons = async (
  weekDaysWithLessons,
  weekDay,
  weekType,
  classTimes,
  timetable
) => {
  const weekTypeLessons = weekDaysWithLessons[weekDay][weekType.name];

  for (let i = 0; i < weekTypeLessons.length; i++) {
    const lesson = {
      weekDay,
      room: weekTypeLessons[i].room,
      format: weekTypeLessons[i].format,
      classType: weekTypeLessons[i].classType,
      weekTypeId: weekType.id,
      classTimeId: classTimes[i].id,
      timetableId: timetable.id,
    };

    if (weekTypeLessons[i].subject) {
      let subject = await getOrCreateSubject(
        weekTypeLessons[i].subject,
        timetable
      );

      lesson.subjectId = subject.id;
    }

    if (weekTypeLessons[i].teacher) {
      let teacher = await getOrCreateTeacher(
        weekTypeLessons[i].teacher,
        timetable
      );

      lesson.teacherId = teacher.id;
    }

    await db.TimetableLesson.create(lesson);
  }
};

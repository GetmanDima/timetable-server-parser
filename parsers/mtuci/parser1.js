const XLSX = require("xlsx");
const { translateGroupString, removeUnnecessaryChars } = require("./utils");

module.exports.run = (wb, groupName) => {
  const sheet = wb.Sheets[getGroupSheetName(groupName, wb)];

  if (!sheet) {
    return null;
  }

  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const timetable = {};

  timetable["classTimes"] = getClassTimes(data);

  const weekDaysWithLessons = {};
  weekDaysWithLessons["monday"] = getDay(13, 17, data);
  weekDaysWithLessons["tuesday"] = getDay(19, 23, data);
  weekDaysWithLessons["wednesday"] = getDay(25, 29, data);
  weekDaysWithLessons["thursday"] = getDay(31, 35, data);
  weekDaysWithLessons["friday"] = getDay(37, 41, data);
  weekDaysWithLessons["saturday"] = getDay(43, 47, data);

  timetable["weekDaysWithLessons"] = weekDaysWithLessons;

  return timetable;
};

module.exports.findGroups = (wb) => {
  const groups = [];
  const sheetNames = wb.SheetNames;

  for (let i = 0; i <= sheetNames.length; i++) {
    const sheetName = sheetNames[i];

    if (sheetName) {
      const ruSheetName = translateGroupString(sheetName);

      groups.push(ruSheetName);
    }
  }

  return groups;
};

const getGroupSheetName = (groupName, wb) => {
  const sheetNames = wb.SheetNames;

  for (let i = 0; i <= sheetNames.length; i++) {
    const sheetName = sheetNames[i];

    if (sheetName) {
      const ruSheetName = translateGroupString(sheetName);

      if (ruSheetName.indexOf(groupName) !== -1) {
        return sheetName;
      }
    }
  }

  return "";
};

const getRoom = (str) => {
  let room = "";
  let roomStartIndex = str.toLowerCase().indexOf("ауд.");

  if (roomStartIndex === -1) {
    roomStartIndex =
      str.indexOf("А-") === -1 ? str.indexOf("Л-") : str.indexOf("А-");

    if (roomStartIndex !== -1) {
      room = str.slice(roomStartIndex).trim().split(" ")[0];
    }
  } else {
    room = str
      .slice(roomStartIndex + 4)
      .trim()
      .split(" ")[0]
      .split("\r")[0]
      .split("\n")[0]
      .trim();
  }

  room = removeUnnecessaryChars(room);

  return room;
};

const getSubject = (str) => {
  let subject = removeUnnecessaryChars(str.split("\n")[0]);

  const subjectEndIndexes = [
    subject.toLowerCase().indexOf(" ауд."),
    subject.toLowerCase().indexOf(" ("),
    subject.toLowerCase().indexOf(" а-"),
    subject.toLowerCase().indexOf(" л-"),
  ];

  subject = subjectEndIndexes
    .filter((i) => i !== -1)
    .reduce((str, i) => {
      return str.slice(0, i + 1);
    }, subject);

  return removeUnnecessaryChars(subject).trim();
};

const getTeacher = (str) => {
  return removeUnnecessaryChars(str);
};

const getClassType = (str) => {
  return removeUnnecessaryChars(str);
};

const getWeekTypeDay = (
  data,
  startRow,
  endRow,
  classTypeColumn,
  teacherColumn,
  subjectColumn,
  formatColumn
) => {
  const day = [];

  for (let i = startRow; i <= endRow; i++) {
    if (!data[i]) {
      continue;
    }

    let classType = data[i][classTypeColumn];
    let teacher = data[i][teacherColumn];
    const subjectStr = data[i][subjectColumn];
    const format = data[i][formatColumn] ? data[i][formatColumn] : "";

    if (subjectStr) {
      const room = getRoom(subjectStr);
      const subject = getSubject(subjectStr);

      if (teacher) {
        teacher = getTeacher(teacher);
      } else {
        teacher = "";
      }

      if (classType) {
        classType = getClassType(classType);
      } else {
        classType = "";
      }

      day.push({
        room,
        format,
        classType,
        subject,
        teacher,
      });
    } else {
      day.push({});
    }
  }

  return day;
};

const getDay = (startRow, endRow, data) => {
  const highWeek = getWeekTypeDay(data, startRow, endRow, 4, 5, 6, 3);
  const lowWeek = getWeekTypeDay(data, startRow, endRow, 9, 8, 7, 10);

  return { high: highWeek, low: lowWeek };
};

const getClassTimes = (data) => {
  const classTimes = [];

  for (let i = 13; i < 18; i++) {
    if (data[i]) {
      const number = i - 12;
      const time = data[i][2].split("-");
      const startTime = time[0];
      const endTime = time[1];
      classTimes.push({ number, startTime, endTime });
    }
  }

  return classTimes;
};

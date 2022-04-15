const XLSX = require("xlsx");
const translateGroupString = require("./common").translateGroupString;

const getGroupSheetName = (group, wb) => {
  const sheetNames = wb.SheetNames;

  for (let i = 0; i <= sheetNames.length; i++) {
    const sheetName = sheetNames[i];

    if (sheetName) {
      const ruSheetName = translateGroupString(sheetName);

      if (ruSheetName.indexOf(group) !== -1) {
        return group;
      }
    }
  }

  return "";
};

const getWeekTypeDay = (
  startRow,
  endRow,
  classTypeColumn,
  teacherColumn,
  subjectColumn,
  data
) => {
  const day = [];

  for (let i = startRow; i <= endRow; i++) {
    const classType = data[i][classTypeColumn];
    let teacher = data[i][teacherColumn];
    const subject = data[i][subjectColumn];

    if (subject) {
      let room;
      let roomStartIndex = subject.indexOf("Ауд.");

      if (roomStartIndex === -1) {
        room = subject.split(" ").slice(-1)[0];
      } else {
        room = subject.slice(roomStartIndex).split(" ").slice(-1)[0];
      }

      if (teacher) {
        teacher = teacher.trim().replace("\n/", "");
      }

      day.push({
        room: room.trim().replace("\n/", ""),
        classType: classType.trim().replace("\n/", ""),
        subject: subject.split("\n")[0].trim().replace("\n/", ""),
        teacher: teacher || "",
      });
    } else {
      day.push({});
    }
  }

  return day;
};

const getDay = (startRow, endRow, data) => {
  const highWeek = getWeekTypeDay(startRow, endRow, 4, 5, 6, data);
  const lowWeek = getWeekTypeDay(startRow, endRow, 9, 8, 7, data);

  return { high: highWeek, low: lowWeek };
};

const getClassTimes = (data) => {
  const classTimes = [];

  for (let i = 13; i < 18; i++) {
    const number = i - 12;
    const time = data[i][2].split("-");
    const startTime = time[0];
    const endTime = time[1];
    classTimes.push({ number, startTime, endTime });
  }

  return classTimes;
};

module.exports.run = (wb, group) => {
  const ws = getGroupSheetName(group, wb);

  if (ws === "") {
    console.log("group not found");
    return {};
  }

  const sheet = wb.Sheets[ws];

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

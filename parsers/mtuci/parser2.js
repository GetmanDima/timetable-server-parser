const XLSX = require("xlsx");
const translateGroupString = require("./common").translateGroupString;

const getColumnCount = (data) => {
  return data.reduce((max, row) => (row.length > max ? row.length : max), 0);
};

const getGroupColumn = (group, data) => {
  const columnCount = getColumnCount(data);

  for (let i = 0; i <= columnCount; i++) {
    const groupString = data[0][i];

    if (groupString) {
      const ruGroupString = translateGroupString(groupString);

      if (ruGroupString.indexOf(group) !== -1) {
        return i;
      }
    }
  }

  return -1;
};

const getClassTimes = (timeColumn, data, offset = 0) => {
  const classTimes = [];

  for (let i = offset + 1; i < 10 + offset; i++) {
    if (i % 2 !== 0) {
      const number = data[i][timeColumn - 1];
      const time = data[i][timeColumn].split("-");
      const startTime = time[0];
      const endTime = time[1];
      classTimes.push({ number, startTime, endTime });
    }
  }

  return classTimes;
};

const removeUnnecessaryChars = (str) => {
  return str.trim().replace("\n/", "");
};

const getclassType = (str) => {
  const classTypes = ["пр", "лек", "лаб"];

  let classType = "";

  for (let i = 0; i < classTypes.length; i++) {
    if (str.toLowerCase().indexOf(classTypes[i]) !== -1) {
      classType = classTypes[i];
      break;
    }
  }

  return classType;
};

const getTeacher = (str) => {
  const classTypes = ["пр", "лек", "лаб"];
  let teacher = "";

  if (str.trim().split(" ").length > 1) {
    teacher = removeUnnecessaryChars(
      str.replace(new RegExp(classTypes.join("|"), "i"), "")
    );
  }

  return teacher;
};

const getRoom = (str) => {
  let room = "";
  let roomStartIndex = str.indexOf("Ауд.");

  if (roomStartIndex === -1) {
    roomStartIndex =
      str.indexOf("А-") === -1 ? str.indexOf("Л-") : str.indexOf("А-");
    room =
      roomStartIndex === -1 ? "" : str.slice(roomStartIndex + 2).split("\n")[0];
  } else {
    room = str.slice(roomStartIndex + 4).split("\n")[0];
  }

  room = removeUnnecessaryChars(room);

  return room;
};

const getWeekDay = (groupColumn, startRow, endRow, data) => {
  const day = {
    high: [],
    low: [],
  };

  for (let i = startRow; i <= endRow; i++) {
    const value = data[i][groupColumn];
    let universityClass = {};

    if (value) {
      const subject = removeUnnecessaryChars(value.split("\n")[0]);
      const classType = getclassType(value.split("\n")[1]);
      const teacher = getTeacher(value.split("\n")[1]);
      const room = getRoom(value);

      universityClass = {
        room,
        classType,
        subject,
        teacher,
      };
    }

    if (i % 2 === startRow % 2) {
      day["high"].push(universityClass);
    } else {
      day["low"].push(universityClass);
    }
  }

  return day;
};

module.exports.run = (wb, group, offset = 0) => {
  let data = [];
  let groupColumn = -1;

  for (let i = 0; i < wb.SheetNames.length; i++) {
    const ws = wb.SheetNames[i];
    const sheet = wb.Sheets[ws];

    data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    groupColumn = getGroupColumn(group, data);

    if (groupColumn !== -1) {
      break;
    }
  }

  if (groupColumn === -1) {
    console.log("group not found");
    return {};
  }

  const timetable = {};

  timetable["classTimes"] = getClassTimes(2, data, offset);

  const weekDays = {};
  weekDays["monday"] = getWeekDay(groupColumn, 1 + offset, 10 + offset, data);
  weekDays["tuesday"] = getWeekDay(groupColumn, 12 + offset, 21 + offset, data);
  weekDays["wednesday"] = getWeekDay(
    groupColumn,
    23 + offset,
    32 + offset,
    data
  );
  weekDays["thursday"] = getWeekDay(
    groupColumn,
    34 + offset,
    43 + offset,
    data
  );
  weekDays["friday"] = getWeekDay(groupColumn, 45 + offset, 54 + offset, data);
  weekDays["saturday"] = getWeekDay(
    groupColumn,
    56 + offset,
    65 + offset,
    data
  );

  timetable["weekDays"] = weekDays;

  return timetable;
};

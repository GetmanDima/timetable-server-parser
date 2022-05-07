const XLSX = require("xlsx");
const { translateGroupString, removeUnnecessaryChars } = require("./utils");

module.exports.run = (
  wb,
  groupName,
  rowOffset = 0,
  columnOffset = 0,
  groupRow = 0
) => {
  let data = [];
  let groupColumn = -1;

  for (let i = 0; i < wb.SheetNames.length; i++) {
    const ws = wb.SheetNames[i];
    const sheet = wb.Sheets[ws];

    data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    groupColumn = getGroupColumn(groupName, data, groupRow) + columnOffset;

    if (groupColumn !== -1) {
      break;
    }
  }

  if (groupColumn === -1) {
    console.log("group not found");
    return {};
  }

  const timetable = {};

  timetable["classTimes"] = getClassTimes(2, data, rowOffset);

  const weekDaysWithLessons = {};

  weekDaysWithLessons["monday"] = getWeekDay(
    groupColumn,
    1 + rowOffset,
    10 + rowOffset,
    data
  );
  weekDaysWithLessons["tuesday"] = getWeekDay(
    groupColumn,
    12 + rowOffset,
    21 + rowOffset,
    data
  );
  weekDaysWithLessons["wednesday"] = getWeekDay(
    groupColumn,
    23 + rowOffset,
    32 + rowOffset,
    data
  );
  weekDaysWithLessons["thursday"] = getWeekDay(
    groupColumn,
    34 + rowOffset,
    43 + rowOffset,
    data
  );
  weekDaysWithLessons["friday"] = getWeekDay(
    groupColumn,
    45 + rowOffset,
    54 + rowOffset,
    data
  );
  weekDaysWithLessons["saturday"] = getWeekDay(
    groupColumn,
    56 + rowOffset,
    65 + rowOffset,
    data
  );

  timetable["weekDaysWithLessons"] = weekDaysWithLessons;

  return timetable;
};

module.exports.findGroups = (wb, groupRow) => {
  const groups = [];
  let data = [];

  for (let i = 0; i < wb.SheetNames.length; i++) {
    const ws = wb.SheetNames[i];
    const sheet = wb.Sheets[ws];

    data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const columnCount = getColumnCount(data);

    for (let i = 0; i <= columnCount; i++) {
      const groupString = data[groupRow][i];

      if (
        groupString &&
        typeof groupString === "string" &&
        groupString.toLowerCase() !== "время" &&
        groupString.toLowerCase() !== "день недели" &&
        groupString.toLowerCase() !== "№ пары"
      ) {
        const ruGroupString = translateGroupString(groupString);
        groups.push(ruGroupString);
      }
    }
  }

  return groups;
};

const getColumnCount = (data) => {
  return data.reduce((max, row) => (row.length > max ? row.length : max), 0);
};

const getGroupColumn = (groupName, data, groupRow = 0) => {
  const columnCount = getColumnCount(data);

  for (let i = 0; i <= columnCount; i++) {
    const groupString = data[groupRow][i];

    if (groupString) {
      const ruGroupString = translateGroupString(groupString);

      if (ruGroupString.indexOf(groupName) !== -1) {
        return i;
      }
    }
  }

  return -1;
};

const getClassTimes = (timeColumn, data, offset = 0) => {
  const classTimes = [];

  for (let i = offset + 1; i < 10 + offset; i++) {
    if ((i + offset) % 2 !== 0) {
      const number = data[i][timeColumn - 1];
      const time = data[i][timeColumn].split("-");
      const startTime = time[0];
      const endTime = time[1];
      classTimes.push({ number, startTime, endTime });
    }
  }

  return classTimes;
};

const getSubject = (str) => {
  let subject = removeUnnecessaryChars(str.split("\n")[0]);

  const subjectEndIndexes = [subject.lastIndexOf(" ауд.")];

  subject = subjectEndIndexes
    .filter((i) => i !== -1)
    .reduce((str, i) => {
      return str.slice(0, i + 1);
    }, subject);

  return removeUnnecessaryChars(subject).trim();
};

const getClassType = (str) => {
  if (!str) {
    return "";
  }

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
  if (!str) {
    return "";
  }

  let teacher = "";

  const strParts = str.split("\n");

  for (let i = 1; i < strParts.length; i++) {
    teacher = strParts[i].trim();

    if (
      teacher.toLowerCase() !== "лек" &&
      teacher.toLowerCase() !== "лаб" &&
      teacher.toLowerCase() !== "пр" &&
      teacher.toLowerCase() !== "лек." &&
      teacher.toLowerCase() !== "лаб." &&
      teacher.toLowerCase() !== "пр."
    ) {
      break;
    }
  }

  if (
    teacher.toLowerCase().startsWith("лек.") ||
    teacher.toLowerCase().startsWith("лаб.")
  ) {
    teacher = teacher.slice(4);
  }

  if (teacher.toLowerCase().startsWith("пр.")) {
    teacher = teacher.slice(3);
  }

  //if (teacher.split(" ").length > 1) {
  let teacherEndIndexes;

  do {
    teacherEndIndexes = [
      teacher.indexOf(". "),
      teacher.toLowerCase().indexOf(".пр"),
      teacher.toLowerCase().indexOf(".лаб"),
      teacher.toLowerCase().indexOf(".лек"),
      teacher.toLowerCase().indexOf(" пр."),
      teacher.toLowerCase().indexOf(" лаб."),
      teacher.toLowerCase().indexOf(" лек."),
      teacher.toLowerCase().indexOf("пр\n"),
      teacher.toLowerCase().indexOf("лаб\n"),
      teacher.toLowerCase().indexOf("лек\n"),
      teacher.toLowerCase().indexOf(" ауд."),
      teacher.indexOf("("),
      teacher.indexOf(","),
    ].filter((i) => i !== -1);

    teacher = teacherEndIndexes.reduce((str, i) => {
      return teacher.slice(0, i);
    }, teacher);
  } while (teacherEndIndexes.length > 0);

  if (
    teacher.toLowerCase() === "ауд" ||
    teacher.toLowerCase() === "лек" ||
    teacher.toLowerCase() === "лаб" ||
    teacher.toLowerCase() === "пр"
  ) {
    return "";
  }

  if (teacher.length > 0 && !teacher.endsWith(".")) {
    teacher += ".";
  }

  return removeUnnecessaryChars(teacher);
};

const getRoom = (str) => {
  let room = "";
  let roomStartIndex = str.toLowerCase().indexOf("ауд.");

  if (roomStartIndex === -1) {
    roomStartIndex =
      str.indexOf("А-") === -1 ? str.indexOf("Л-") : str.indexOf("А-");
    room =
      roomStartIndex === -1 ? "" : str.slice(roomStartIndex + 2).split("\n")[0];
  } else {
    room = str
      .slice(roomStartIndex + 4)
      .trim()
      .split(" ")[0]
      .split("\n")[0];
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
    const rowData = data[i];
    let value;

    if (rowData) {
      value = rowData[groupColumn];
    }

    let lesson = {};

    if (value && typeof value === "string") {
      const subject = getSubject(value.split("\n")[0]);
      const classType = getClassType(value.split("\n")[1]);
      const teacher = getTeacher(value);
      const room = getRoom(value);

      lesson = {
        room,
        format: "очно?",
        classType,
        subject,
        teacher,
      };
    }

    if (i % 2 === startRow % 2) {
      day["high"].push(lesson);
    } else {
      day["low"].push(lesson);
    }
  }

  return day;
};

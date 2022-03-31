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

const getTimes = (timeColumn, data, offset = 0) => {
  const times = [];

  for (let i = offset + 1; i < 10 + offset; i++) {
    if (i % 2 !== 0) {
      const time = data[i][timeColumn].split("-");
      const timeFrom = time[0];
      const timeTo = time[1];
      times.push({ timeFrom, timeTo });
    }
  }

  return times;
};

const removeUnnecessaryChars = (str) => {
  return str.trim().replace("\n/", "");
};

const getSubjectType = (str) => {
  const subjectTypes = ["пр", "лек", "лаб"];

  let subjectType = "";

  for (let i = 0; i < subjectTypes.length; i++) {
    if (str.toLowerCase().indexOf(subjectTypes[i]) !== -1) {
      subjectType = subjectTypes[i];
      break;
    }
  }

  return subjectType;
};

const getTeacher = (str) => {
  const subjectTypes = ["пр", "лек", "лаб"];
  let teacher = "";

  if (str.trim().split(" ").length > 1) {
    teacher = removeUnnecessaryChars(
      str.replace(new RegExp(subjectTypes.join("|"), "i"), "")
    );
  }

  return teacher;
};

const getAud = (str) => {
  let aud = "";
  let audStartIndex = str.indexOf("Ауд.");

  if (audStartIndex === -1) {
    audStartIndex =
      str.indexOf("А-") === -1 ? str.indexOf("Л-") : str.indexOf("А-");
    aud =
      audStartIndex === -1 ? "" : str.slice(audStartIndex + 2).split("\n")[0];
  } else {
    aud = str.slice(audStartIndex + 4).split("\n")[0];
  }

  aud = removeUnnecessaryChars(aud);

  return aud;
};

const getWeekDay = (groupColumn, startRow, endRow, data) => {
  const day = {
    topWeek: [],
    lowWeek: [],
  };

  for (let i = startRow; i <= endRow; i++) {
    const value = data[i][groupColumn];
    let classTime = {};

    if (value) {
      const subject = removeUnnecessaryChars(value.split("\n")[0]);
      const subjectType = getSubjectType(value.split("\n")[1]);
      const teacher = getTeacher(value.split("\n")[1]);
      const aud = getAud(value);

      classTime = {
        aud,
        subjectType,
        subject,
        teacher,
      };
    }

    if (i % 2 === startRow % 2) {
      day["topWeek"].push(classTime);
    } else {
      day["lowWeek"].push(classTime);
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

  timetable["times"] = getTimes(2, data, offset);
  timetable["monday"] = getWeekDay(groupColumn, 1 + offset, 10 + offset, data);
  timetable["tuesday"] = getWeekDay(
    groupColumn,
    12 + offset,
    21 + offset,
    data
  );
  timetable["wednesday"] = getWeekDay(
    groupColumn,
    23 + offset,
    32 + offset,
    data
  );
  timetable["thursday"] = getWeekDay(
    groupColumn,
    34 + offset,
    43 + offset,
    data
  );
  timetable["friday"] = getWeekDay(groupColumn, 45 + offset, 54 + offset, data);
  timetable["saturday"] = getWeekDay(
    groupColumn,
    56 + offset,
    65 + offset,
    data
  );

  return timetable;
};

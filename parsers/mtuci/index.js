const XLSX = require("xlsx");
const parser1 = require("./parser1");
const parser2 = require("./parser2");

module.exports.getParser = (wb) => {
  const ws = wb.SheetNames[0];
  const sheet = wb.Sheets[ws];

  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  if (
    data[1] &&
    data[12] &&
    data[1][3] === "ПОНЕДЕЛЬНИК" &&
    data[12][0] === "ВТОРНИК"
  ) {
    console.log("parser2. type 1");

    return {
      run: (groupName) => parser2.run(wb, groupName, 1, 1),
      findGroups: () => parser2.findGroups(wb, 0),
    };
  } else if (
    data[1] &&
    data[12] &&
    data[1][0] === "ПОНЕДЕЛЬНИК" &&
    data[12][0] === "ВТОРНИК"
  ) {
    console.log("parser2. type 2");

    return {
      run: (groupName) => parser2.run(wb, groupName, 1, 1),
      findGroups: () => parser2.findGroups(wb, 0),
    };
  } else if (data[23] && data[23][0] === "ВТОРНИК") {
    console.log("parser 2. type 3");

    return {
      run: (groupName) => parser2.run(wb, groupName, 12, 3, 10),
      findGroups: () => parser2.findGroups(wb, 10),
    };
  } else if (data[1][0] && data[1][0].toLowerCase() === "пн") {
    console.log("parser2. type 4");

    return {
      run: (groupName) => parser2.run(wb, groupName),
      findGroups: () => parser2.findGroups(wb, 0),
    };
  } else if (data[3][0] && data[3][0].toLowerCase() === "пн") {
    console.log("parser 2. type 5");

    return {
      run: (groupName) => parser2.run(wb, groupName, 2),
      findGroups: () => parser2.findGroups(wb, 0),
    };
  } else if (data[13] && data[13][0] === "ПН") {
    console.log("parser 1. type 1");

    return {
      run: (groupName) => parser1.run(wb, groupName),
      findGroups: () => parser1.findGroups(wb),
    };
  } else {
    return null;
  }
};

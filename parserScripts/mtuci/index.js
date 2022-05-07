const HTMLParser = require("node-html-parser");
const https = require("https");
const XLSX = require("xlsx");
const fs = require("fs");
const { timeout, writeLog } = require("../../utils");
const { getParser } = require("../../parsers/mtuci");
const {
  sendParsedDataToDb,
  getOrCreateUniversity,
  getOrCreateGroup,
} = require("../../parserServer");

const universityName = "МТУСИ";
const url = "https://mtuci.ru";
const timetableUrl = "https://mtuci.ru/time-table/";
const linkCount = 72;

const errorFilePath = "./logs/mtuci/script/errors.log";
const warningFilePath = "./logs/mtuci/script/warnings.log";
const timetableUploadPath = "./uploads/mtuci/script";
const timetableParsedPath = "./parsedData/mtuci";

module.exports.run = async (start, end) => {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const createAnswer = await new Promise((resolve) => {
    readline.question("Create parsed data? ", (answer) => {
      resolve(answer);
    });
  });

  if (
    createAnswer.toLowerCase() === "y" ||
    createAnswer.toLowerCase() === "yes"
  ) {
    console.log("Remove old");
    await removeParsedData();
    console.log("Create");
    await createParsedData();
  }

  const serverAnswer = await new Promise((resolve) => {
    readline.question("Send parsed data to server? ", (answer) => {
      resolve(answer);
    });
  });

  if (
    serverAnswer.toLowerCase() === "y" ||
    serverAnswer.toLowerCase() === "yes"
  ) {
    console.log("Run sending");
    await getParsedDataAndSendToDb(start, end);
  }
};

const getParsedDataAndSendToDb = async (start, end) => {
  const files = fs
    .readdirSync(timetableParsedPath, "utf8")
    .filter((fileName) => {
      return fileName.endsWith(".json");
    });

  start = start ? start : 0;
  end = end ? end : files.length;

  const university = await getOrCreateUniversity(universityName);

  for (let i = start; i < end; i++) {
    try {
      const fileData = fs.readFileSync(`${timetableParsedPath}/${files[i]}`);
      const data = JSON.parse(fileData);

      console.log(data.group);
      console.log("processing...");

      const group = await getOrCreateGroup(data.group, university);

      await sendParsedDataToDb(data.timetable, group);

      console.log("finished");
    } catch (e) {
      console.log(e);
      writeLog(errorFilePath, `${timetableParsedPath}/${files[i]} ${e}`);
    }
  }
};

const fetchData = (url) => {
  return new Promise((resolve, reject) => {
    const req = https.request(url, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve(data);
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.end();
  });
};

const fetchDataToFile = (url, filePath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);

    const req = https.request(url, (res) => {
      res.pipe(file);
      file.on("finish", function () {
        file.close();
        resolve();
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.end();
  });
};

const getLinks = (html) => {
  const root = HTMLParser.parse(html);
  const linkElements = root.querySelectorAll(
    ".content>div>.content>div ul>li>h4>a"
  );
  const links = linkElements.map((element) => element.getAttribute("href"));
  const xlsLinks = links.filter(
    (link) => link.endsWith("xls") || link.endsWith("xlsx")
  );
  console.log(xlsLinks.length);
  return xlsLinks;
};

const relativeToAbsoluteLinks = (links, url) => {
  return links.map((link) => url + link);
};

const makePrettyGroupName = (groupName) => {
  let prettyGroupName = groupName;
  const groupStartIndex = prettyGroupName.toLowerCase().indexOf("группа");

  if (groupStartIndex !== -1) {
    prettyGroupName = prettyGroupName.slice(groupStartIndex + 6);
  }

  const groupEndIndex = prettyGroupName.indexOf("«");

  if (groupEndIndex !== -1) {
    prettyGroupName = prettyGroupName.slice(0, groupEndIndex);
  }

  prettyGroupName = prettyGroupName.replace("+", "").trim();

  return prettyGroupName;
};

const runParserForGroups = (groups, runParser, iteration) => {
  groups.forEach((group) => {
    const parsedTimetableData = runParser(group);
    const prettyGroupName = makePrettyGroupName(group);

    const timetableWithGroup = {
      university: universityName,
      group: prettyGroupName,
      timetable: parsedTimetableData,
    };

    fs.writeFile(
      `${timetableParsedPath}/${iteration}_${group
        .replace(/\r\n/g, "")
        .replace(/\n/g, "")}.json`,
      JSON.stringify(timetableWithGroup),
      (e) => {
        if (e) {
          console.log(e);
        }
      }
    );
  });
};

const removeParsedData = async () => {
  const files = fs
    .readdirSync(timetableParsedPath, "utf8")
    .filter((fileName) => {
      return fileName.endsWith(".json");
    });

  for (let i = 0; i < files.length; i++) {
    fs.unlink(`${timetableParsedPath}/${files[i]}`, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Removed: ${timetableParsedPath}/${files[i]}`);
      }
    });
  }
};

const createParsedData = async () => {
  try {
    const html = await fetchData(timetableUrl);
    const links = getLinks(html);
    absoluteLinks = relativeToAbsoluteLinks(links, url);
  } catch (e) {
    console.log("Error when get links from page");
    console.log(e);
    writeLog(errorFilePath, `Error when get links from page ${e}`);
    return;
  }

  slicedLinks = absoluteLinks.slice(0, linkCount);

  for (let i = 0; i < slicedLinks.length; i++) {
    console.log("#" + i);

    const link = absoluteLinks[i];
    const linkFileName = link.split("/").slice(-1)[0];
    const filePath = `${timetableUploadPath}/${i}_${linkFileName}`;

    try {
      console.log(link);
      console.log(filePath);

      const files = fs.readdirSync(timetableUploadPath);

      if (!files.find((fileName) => fileName === `${i}_${linkFileName}`)) {
        console.log("download");
        await timeout(5000);
        await fetchDataToFile(link, filePath);
      }

      const wb = XLSX.readFile(filePath);

      const parser = getParser(wb);

      if (parser === null) {
        console.log("no parser");
        writeLog(warningFilePath, `${link} ${filePath} no parser for file`);
      } else {
        const groups = parser.findGroups();
        runParserForGroups(groups, parser.run, i);
      }
    } catch (e) {
      console.log(e);
      writeLog(errorFilePath, `${link} ${filePath} ${e}`);
    }
  }
};

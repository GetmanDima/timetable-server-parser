module.exports.translateGroupString = (groupString) => {
  const equalEnSymbols = "ABEKMOPCTX";
  const equalRuSymbols = "АВЕКМОРСТХ";

  return groupString
    .split("")
    .map((ch) => {
      let index = equalEnSymbols.indexOf(ch);
      return index === -1 ? ch : equalRuSymbols[index];
    })
    .join("");
};

module.exports.removeUnnecessaryChars = (str) => {
  return str
    .trim()
    .replace(/\n/g, "")
    .replace(/\r/g, "")
    .replace(/\r\n/g, "")
    .replace(/\\/g, "")
    .replace(/\//g, "");
};

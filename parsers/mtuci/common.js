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

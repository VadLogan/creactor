/*define entity functions*/
const createDefiner = (arg, alias, wholeDescription) =>
  arg === alias || arg === wholeDescription;

const isComponent = arg => createDefiner(arg, "-c", "component");
const isContainer = arg => createDefiner(arg, "-cr", "container");
const isPage = arg => createDefiner(arg, "-p", "page");
const isVersion = arg => arg === "-v";
const isLetterBig = arg => /^[A-Z]/.test(arg);

module.exports = {
  isComponent,
  isContainer,
  isPage,
  isVersion,
  isLetterBig
};

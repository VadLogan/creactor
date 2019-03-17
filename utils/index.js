const kebabCase = require("lodash/kebabCase");
const { markupAvailableComponents } = require("../config/constants");

/*define entity functions*/
const createDefiner = (arg, alias, wholeDescription) =>
  arg === alias || arg === wholeDescription;

const isComponent = arg => createDefiner(arg, "-c", "component");
const isContainer = arg => createDefiner(arg, "-cr", "container");
const isPage = arg => createDefiner(arg, "-p", "page");
const isPureComponent = arg => createDefiner(arg, "-pr", "pure");
const isSub = arg => createDefiner(arg, "-sub", "sub-components");
const isVersion = arg => arg === "-v";
const isLetterBig = arg => /^[A-Z]/.test(arg);

const withPrefix = (component, prefix, useComa = false) => {
  const componentToKebab = kebabCase(component);
  const coma = useComa ? "." : "";
  return prefix
    ? `${coma}${prefix}-${componentToKebab}`
    : `${coma}${componentToKebab}`;
};

const recognizeComponent = component => {
  return markupAvailableComponents.some(tag => component.toLowerCase() === tag)
    ? component.toLowerCase()
    : "div";
};

module.exports = {
  isComponent,
  isContainer,
  isPage,
  isVersion,
  isLetterBig,
  isPureComponent,
  withPrefix,
  recognizeComponent,
  isSub
};

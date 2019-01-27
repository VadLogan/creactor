#!/usr/bin/env node

/**
 * Module dependencies.
 */

const fs = require("fs");
const util = require("util");
const path = require("path");
const {
  pureFunctional,
  reactNode,
  reactPureNode,
  styles,
  componentIndex,
  containerIndex,
  createSelectors,
  createActions,
  createReducer,
  createSaga,
  createIndexSaga
} = require("./templates");

const [, , ...args] = process.argv;

const DEFAULT_FOLDER = "src";

/* main folders names */
const APP_COMPONENTS_FOLDER = "components";
const APP_CONTAINERS_FOLDER = "containers";
const APP_PAGES_FOLDER = "pages";

/* files extension */
const COMPONENT_FILE_EXTENSION = "jsx";
const EXECUTE_FILE_EXTENSION = "js";
const STYLES_FILE_EXTENSION = "scss";
/*define entity functions*/
const isComponent = arg => arg === "-c" || arg === "component";
const isContainer = arg => arg === "-cr" || arg === "container";
const isPage = arg => arg === "-p" || arg === "page";
const isLetterBig = arg => /^[A-Z]/.test(arg);

const appendFile = util.promisify(fs.appendFile);
const mkDir = util.promisify(fs.mkdir);

/*entity creators*/
const createDir = folderName =>
  mkDir(path.join(DEFAULT_FOLDER, folderName), {
    recursive: true
  });

const createComponent = async arg => {
  const componentsPath = path.join(DEFAULT_FOLDER, APP_COMPONENTS_FOLDER, arg);
  try {
    await createDir(path.join(APP_COMPONENTS_FOLDER, arg));

    await appendFile(
      `${componentsPath}/${arg}.${COMPONENT_FILE_EXTENSION}`,
      pureFunctional(arg)
    );

    await appendFile(
      `${componentsPath}/index.${EXECUTE_FILE_EXTENSION}`,
      componentIndex(arg)
    );

    await appendFile(
      `${componentsPath}/styles.${STYLES_FILE_EXTENSION}`,
      styles(arg)
    );

    console.log(`Component ${arg} was successfully created`);
  } catch (err) {
    console.log("createComponent", err);
  }
};

const createEntity = async (arg, is = "container") => {
  const execFolder =
    is === "container" ? APP_CONTAINERS_FOLDER : APP_PAGES_FOLDER;
  const containersPath = path.join(DEFAULT_FOLDER, execFolder, arg);
  const sagasPath = path.join(containersPath, "/sagas");

  try {
    await createDir(path.join(execFolder, arg));
    await createDir(path.join(execFolder, arg, "/sagas"));

    await appendFile(
      `${containersPath}/${arg}.${COMPONENT_FILE_EXTENSION}`,
      reactNode(arg)
    );

    await appendFile(
      `${containersPath}/index.${EXECUTE_FILE_EXTENSION}`,
      containerIndex(arg)
    );

    await appendFile(
      `${containersPath}/actions.${EXECUTE_FILE_EXTENSION}`,
      createActions()
    );

    await appendFile(
      `${containersPath}/selectors.${EXECUTE_FILE_EXTENSION}`,
      createSelectors(arg)
    );

    await appendFile(
      `${containersPath}/reducer.${EXECUTE_FILE_EXTENSION}`,
      createReducer(arg)
    );

    await appendFile(
      `${sagasPath}/index.${EXECUTE_FILE_EXTENSION}`,
      createIndexSaga()
    );

    await appendFile(
      `${sagasPath}/saga${arg}.${EXECUTE_FILE_EXTENSION}`,
      createSaga()
    );

    await appendFile(
      `${containersPath}/styles.${STYLES_FILE_EXTENSION}`,
      styles(arg)
    );

    console.log(`Container ${arg} was successfully created`);
  } catch (error) {
    console.error("Container", error);
  }
};

/*line Executer*/
const lineExecuter = (arr, ind, execFunc, option) => {
  for (let i = ind + 1; i < arr.length; i += 1) {
    if (isLetterBig(arr[i][0])) {
      execFunc(arr[i], option);
    } else {
      break;
    }
  }
};

/*process executer*/
args.forEach((arg, ind) => {
  if (isComponent(arg)) {
    lineExecuter(args, ind, createComponent);
  } else if (isContainer(arg)) {
    lineExecuter(args, ind, createEntity);
  } else if (isPage(arg)) {
    lineExecuter(args, ind, createEntity, "page");
  }
});

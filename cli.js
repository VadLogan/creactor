#!/usr/bin/env node

/**
 * Module dependencies.
 */

const fs = require("fs");
const fsPromises = fs.promises;
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

/*entity creators*/
const createDir = folderName => {
  fs.mkdir(
    path.resolve(__dirname, `./${folderName}`),
    { recursive: true },
    err => {
      if (err) throw err;
    }
  );
};

const createComponent = async arg => {
  const componentsPath = `${APP_COMPONENTS_FOLDER}/${arg}`;
  createDir(componentsPath);
  try {
    await fsPromises.appendFile(
      `${componentsPath}/${arg}.${COMPONENT_FILE_EXTENSION}`,
      pureFunctional(arg)
    );

    await fsPromises.appendFile(
      `${componentsPath}/index.${EXECUTE_FILE_EXTENSION}`,
      componentIndex(arg)
    );

    await fsPromises.appendFile(
      `${componentsPath}/styles.${STYLES_FILE_EXTENSION}`,
      styles(arg)
    );

    console.log(`Component ${arg} was successfully created`);
  } catch (err) {
    console.log(err);
  }

  /* fs.writeFile(
    `${componentsPath}/${arg}.${COMPONENT_FILE_EXTENSION}`,
    pureFunctional(arg),
    err => {
      if (err) throw err;
      fs.writeFile(
        `${componentsPath}/index.${EXECUTE_FILE_EXTENSION}`,
        componentIndex(arg),
        err => {
          if (err) throw err;
          fs.writeFile(
            `${componentsPath}/styles.${STYLES_FILE_EXTENSION}`,
            styles(arg),
            err => {
              if (err) throw err;
              console.log(`Component ${arg} was successfully created`);
            }
          );
        }
      );
    }
  );*/
};

const createContainer = async arg => {
  const containersPath = `${APP_CONTAINERS_FOLDER}/${arg}`;
  const sagasPath = `${containersPath}/sagas`;
  createDir(containersPath);
  createDir(sagasPath);
  try {
    await fsPromises.appendFile(
      `${containersPath}/${arg}.${COMPONENT_FILE_EXTENSION}`,
      reactNode(arg)
    );

    await fsPromises.appendFile(
      `${containersPath}/index.${EXECUTE_FILE_EXTENSION}`,
      containerIndex(arg)
    );

    await fsPromises.appendFile(
      `${containersPath}/actions.${EXECUTE_FILE_EXTENSION}`,
      createActions()
    );

    await fsPromises.appendFile(
      `${containersPath}/selectors.${EXECUTE_FILE_EXTENSION}`,
      createSelectors(arg)
    );

    await fsPromises.appendFile(
      `${containersPath}/reducer.${EXECUTE_FILE_EXTENSION}`,
      createReducer(arg)
    );

    await fsPromises.appendFile(
      `${sagasPath}/index.${EXECUTE_FILE_EXTENSION}`,
      createIndexSaga()
    );

    await fsPromises.appendFile(
      `${sagasPath}/saga${arg}.${EXECUTE_FILE_EXTENSION}`,
      createSaga()
    );

    await fsPromises.appendFile(
      `${containersPath}/styles.${STYLES_FILE_EXTENSION}`,
      styles(arg)
    );

    console.log(`Container ${arg} was successfully created`);
  } catch (error) {
    console.error(error);
  }
};

/*line Executer*/
const lineExecuter = (arr, ind, execFunc) => {
  for (let i = ind + 1; i < arr.length; i += 1) {
    if (isLetterBig(arr[i][0])) {
      execFunc(arr[i]);
    } else {
      break;
    }
  }
};

/*process executer*/
args.forEach((arg, ind) => {
  if (isComponent(arg)) {
    createDir(APP_COMPONENTS_FOLDER);
    lineExecuter(args, ind, createComponent);
  } else if (isContainer(arg)) {
    createDir(APP_CONTAINERS_FOLDER);
    lineExecuter(args, ind, createContainer);
  } else if (isPage(arg)) {
    createDir(APP_PAGES_FOLDER);
    lineExecuter(args, ind, createContainer);
  }
});

//fs.writeFileSync(`${arg}.js`, 'import React from "react"');

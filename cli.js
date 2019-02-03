#!/usr/bin/env node

/*
 * Module dependencies.
 */

const fs = require("fs");
const util = require("util");
const path = require("path");
const readline = require("readline");
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
  createIndexSaga,
  testDefaultFileName,
  subComponentsIndex
} = require("./templates");
const {
  isComponent,
  isContainer,
  isPage,
  isVersion,
  isLetterBig,
  isPureComponent,
  isSub
} = require("./utils");
const getConfig = require("./config");

const [, , ...args] = process.argv;

const appendFile = util.promisify(fs.appendFile);
const mkDir = util.promisify(fs.mkdir);

const promAccess = path => {
  return new Promise(res => {
    fs.access(path, fs.constants.F_OK, err => {
      err ? res(false) : res(true);
    });
  });
};

const checkArray = checkElement =>
  [isComponent, isContainer, isPage, isVersion, isSub].some(check =>
    check(checkElement)
  );

/*line Executer*/
const defineSubComponents = (arr, ind) => {
  const newArray = [];
  let i = ind;
  while (!checkArray(arr[i]) && arr.length !== i - 1 && arr[i]) {
    newArray.push(arr[i]);
    i += 1;
  }
  return newArray;
};
const lineExecuter = (arr, ind, execFunc, option) => {
  for (let i = ind + 1; i < arr.length; i += 1) {
    if (isLetterBig(arr[i][0])) {
      execFunc(arr[i], {
        ...option,
        isPure:
          isPureComponent(arr[i + 1]) ||
          (i !== ind + 1 && isPureComponent(arr[i - 1])),
        subComponents: isSub(arr[i + 1]) && defineSubComponents(arr, i + 2)
      });
    } else if (checkArray(arr[i])) {
      break;
    }
  }
};

const isExistExec = async (path, componentName, fn) => {
  try {
    const isExist = await promAccess(path);
    if (isExist) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question(`${componentName} already exist continue? Y|N: `, answer => {
        if (answer === "Y") {
          fn();
        }
        rl.close();
      });
    } else {
      fn();
    }
  } catch (err) {
    console.log("isExistExec", err);
  }
};

const createDir = folderName =>
  mkDir(folderName, {
    recursive: true
  });

/*process executer*/
(async function executeProcess() {
  try {
    const {
      DEFAULT_FOLDER,
      APP_COMPONENTS_FOLDER,
      APP_CONTAINERS_FOLDER,
      APP_PAGES_FOLDER,
      COMPONENT_FILE_EXTENSION,
      EXECUTE_FILE_EXTENSION,
      STYLES_FILE_EXTENSION,
      APP_STYLES_PREFIX,
      APP_TEST_CONFIG
    } = await getConfig();
    /*entity creators*/

    const createComponent = async (arg, subPath = "") => {
      const componentsPath =
        subPath || path.join(DEFAULT_FOLDER, APP_COMPONENTS_FOLDER, arg);

      isExistExec(componentsPath, arg, async () => {
        try {
          await createDir(componentsPath);

          await appendFile(
            `${componentsPath}/${arg}.${COMPONENT_FILE_EXTENSION}`,
            pureFunctional(arg, APP_STYLES_PREFIX)
          );

          await appendFile(
            `${componentsPath}/index.${EXECUTE_FILE_EXTENSION}`,
            componentIndex(arg)
          );

          await appendFile(
            `${componentsPath}/styles.${STYLES_FILE_EXTENSION}`,
            styles(arg, APP_STYLES_PREFIX)
          );

          if (APP_TEST_CONFIG) {
            const { testFolderName, testFileName, coverage } = APP_TEST_CONFIG;
            if (coverage.includes(APP_COMPONENTS_FOLDER)) {
              await createDir(path.join(componentsPath, testFolderName));

              await appendFile(
                path.join(
                  componentsPath,
                  testFolderName,
                  `${arg}.${testFileName}`
                ),
                testDefaultFileName(arg)
              );
            }
          }

          console.log(`Component ${arg} was successfully created`);
        } catch (err) {
          console.log("createComponent", err);
        }
      });
    };

    const createEntity = async (
      arg,
      { is = "container", isPure, subComponents = false }
    ) => {
      const { execFolder, entityName } =
        is === "container"
          ? {
              execFolder: APP_CONTAINERS_FOLDER,
              entityName: "Container"
            }
          : {
              execFolder: APP_PAGES_FOLDER,
              entityName: "Page"
            };

      const containersPath = path.join(DEFAULT_FOLDER, execFolder, arg);

      isExistExec(containersPath, arg, async () => {
        const sagasPath = path.join(containersPath, "/sagas");

        try {
          await createDir(containersPath);
          if (isPure) {
            await appendFile(
              `${containersPath}/${arg}.${COMPONENT_FILE_EXTENSION}`,
              reactPureNode(arg, APP_STYLES_PREFIX)
            );
            await appendFile(
              `${containersPath}/index.${EXECUTE_FILE_EXTENSION}`,
              componentIndex(arg)
            );
          } else {
            await createDir(path.join(containersPath, "/sagas"));
            await appendFile(
              `${containersPath}/${arg}.${COMPONENT_FILE_EXTENSION}`,
              reactNode(arg, APP_STYLES_PREFIX)
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
              `${containersPath}/index.${EXECUTE_FILE_EXTENSION}`,
              containerIndex(arg)
            );
          }

          await appendFile(
            `${containersPath}/styles.${STYLES_FILE_EXTENSION}`,
            styles(arg, APP_STYLES_PREFIX)
          );

          if (Array.isArray(subComponents)) {
            await createDir(path.join(containersPath, "components"));

            subComponents.forEach(component =>
              createComponent(
                component,
                path.join(containersPath, "components", component)
              )
            );

            await appendFile(
              path.join(
                containersPath,
                "components",
                `index.${EXECUTE_FILE_EXTENSION}`
              ),
              subComponentsIndex(subComponents)
            );
          }

          if (APP_TEST_CONFIG) {
            const { testFolderName, testFileName, coverage } = APP_TEST_CONFIG;
            if (coverage.includes(execFolder)) {
              await createDir(path.join(containersPath, testFolderName));

              await appendFile(
                path.join(
                  containersPath,
                  testFolderName,
                  `/${arg}.${testFileName}`
                ),
                testDefaultFileName(arg)
              );
            }
          }

          console.log(`${entityName} ${arg} was successfully created`);
        } catch (error) {
          console.error(entityName, error);
        }
      });
    };

    const getVersion = () => {
      const { version } = require("./package.json");
      console.log(version);
    };

    for (let i = 0; i < args.length; i += 1) {
      const arg = args[i];
      if (isSub(arg)) {
        break;
      } else if (isComponent(arg)) {
        lineExecuter(args, i, createComponent);
      } else if (isContainer(arg)) {
        lineExecuter(args, i, createEntity);
      } else if (isPage(arg)) {
        lineExecuter(args, i, createEntity, {
          is: "page"
        });
      } else if (isVersion(arg)) {
        getVersion();
      }
    }
  } catch (err) {
    console.error(err);
  }
})();

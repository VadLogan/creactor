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
  testDefaultFileName
} = require("./templates");
const {
  isComponent,
  isContainer,
  isPage,
  isVersion,
  isLetterBig
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

const PURE_COMPONENT = "-pr";
const checksArray = [isComponent, isContainer, isPage, isVersion];
/*line Executer*/
const lineExecuter = (arr, ind, execFunc, option) => {
  for (let i = ind + 1; i < arr.length; i += 1) {
    if (isLetterBig(arr[i][0])) {
      execFunc(arr[i], {
        ...option,
        isPure:
          arr[i + 1] === PURE_COMPONENT ||
          (i !== ind + 1 && arr[i - 1] === PURE_COMPONENT)
      });
    } else if (checksArray.some(check => check(arr[i]))) {
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
    const createDir = folderName =>
      mkDir(path.join(DEFAULT_FOLDER, folderName), {
        recursive: true
      });

    const createComponent = async arg => {
      const componentsPath = path.join(
        DEFAULT_FOLDER,
        APP_COMPONENTS_FOLDER,
        arg
      );

      isExistExec(componentsPath, arg, async () => {
        try {
          await createDir(path.join(APP_COMPONENTS_FOLDER, arg));
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
              await createDir(
                path.join(APP_COMPONENTS_FOLDER, arg, testFolderName)
              );

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

    const createEntity = async (arg, { is = "container", isPure }) => {
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
          await createDir(path.join(execFolder, arg));
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
            await createDir(path.join(execFolder, arg, "/sagas"));
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

          if (APP_TEST_CONFIG) {
            const { testFolderName, testFileName, coverage } = APP_TEST_CONFIG;
            if (coverage.includes(execFolder)) {
              await createDir(path.join(execFolder, arg, testFolderName));

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

    args.forEach((arg, ind) => {
      if (isComponent(arg)) {
        lineExecuter(args, ind, createComponent);
      } else if (isContainer(arg)) {
        lineExecuter(args, ind, createEntity);
      } else if (isPage(arg)) {
        lineExecuter(args, ind, createEntity, {
          is: "page"
        });
      } else if (isVersion(arg)) {
        getVersion();
      }
    });
  } catch (err) {
    console.error(err);
  }
})();

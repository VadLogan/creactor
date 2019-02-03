const fs = require("fs");
const { DEFAULT_CREACTOR_CONFIG_FILE_NAME } = require("./constants");

module.exports = () => {
  const stream = fs.createReadStream(
    `${process.cwd()}/${DEFAULT_CREACTOR_CONFIG_FILE_NAME}`,
    "utf-8"
  );
  return new Promise(res => {
    stream.on("data", configFromJSON => {
      const config = JSON.parse(configFromJSON);
      res({
        DEFAULT_FOLDER: config.entryPoint || "src",
        APP_COMPONENTS_FOLDER: config.appComponentsFolder || "components",
        APP_CONTAINERS_FOLDER: config.appContainersFolder || "containers",
        APP_PAGES_FOLDER: config.appPagesFolder || "pages",
        COMPONENT_FILE_EXTENSION: config.componentFileExtension || "jsx",
        EXECUTE_FILE_EXTENSION: config.executeFileExtension || "js",
        STYLES_FILE_EXTENSION: config.styleFileExtension || "scss",
        APP_STYLES_PREFIX: config.appStylesPrefix || false,
        APP_TEST_CONFIG: config.tests || false
      });
    });

    stream.on("error", () => {
      console.log(
        "creactor config didn't detect, creactor will use default config"
      );
      res({
        DEFAULT_FOLDER: "src",
        APP_COMPONENTS_FOLDER: "components",
        APP_CONTAINERS_FOLDER: "containers",
        APP_PAGES_FOLDER: "pages",
        COMPONENT_FILE_EXTENSION: "jsx",
        EXECUTE_FILE_EXTENSION: "js",
        STYLES_FILE_EXTENSION: "scss",
        APP_STYLES_PREFIX: false,
        APP_TEST_CONFIG: false
      });
    });
  });
};

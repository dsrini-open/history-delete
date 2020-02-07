import _ from "lodash";
import * as storage from "utils/storage";
import initialStorage from "./initialStorage.json";

export const merge = async () => {
  const output = {};
  const extStorage = await storage.getAll();

  _.merge(output, initialStorage, extStorage);
  output.version = initialStorage.version;
  output.menuCfg = initialStorage.menuCfg;

  await storage.set(output);
};

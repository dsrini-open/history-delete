import browser from "webextension-polyfill";
import _ from "lodash";
import initialStorage from "./initialStorage.json";

let syncArea;
const getStorageArea = async area => {
  if (typeof syncArea === "undefined") {
    try {
      await browser.storage.sync.get("somevar");
      syncArea = true;
    } catch (e) {
      syncArea = false;
    }
  }

  return syncArea ? area : "local";
};

export const load = async (area = "sync") => {
  area = await getStorageArea(area);
  // eslint-disable-next-line no-use-before-define
  return factory.set(initialStorage, area);
};
// eslint-disable-next-line no-unused-vars
export const init = async (area = "sync") => {
  area = await getStorageArea(area);
};

export const getAll = async (area = "sync") => {
  area = await getStorageArea(area);
  // eslint-disable-next-line no-use-before-define
  return factory.get(_.keys(initialStorage), area);
};

export const get = async (keys = null, area = "sync") => {
  area = await getStorageArea(area);
  return browser.storage[area].get(keys);
};

export const set = async (obj, area = "sync") => {
  area = await getStorageArea(area);
  return browser.storage[area].set(obj);
};

export const remove = async (keys, area = "sync") => {
  area = await getStorageArea(area);
  return browser.storage[area].remove(keys);
};

export const clear = async (area = "sync") => {
  area = await getStorageArea(area);
  return browser.storage[area].clear();
};

export const factory = {
  get,
  getAll,
  set
};

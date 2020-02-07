import * as storage from "utils/storage";
import _ from "lodash";

export const getDataFromStorage = async key => {
  const data = await storage.get(key);
  return data[key];
};

export const isInStorageList = async (key, data) => {
  const storeData = await getDataFromStorage(key);
  return _.includes(storeData, data);
};

export const addToStorageList = async (key, data) => {
  let storeData = await getDataFromStorage(key);
  const setData = new Set(storeData);
  setData.add(data);
  storeData = Array.from(setData).sort();
  await storage.set({ [key]: storeData });
};

export const removeFromStorageList = async (key, data) => {
  if (await isInStorageList(key, data)) {
    const storeData = await getDataFromStorage(key);
    _.pull(storeData, data);
    await storage.set({ [key]: storeData });
  }
};

import storage from 'utils/storage';
import _ from 'lodash';

async function getDataFromStorage(key) {
  let data =  await storage.get(key);
  return data[key];
}

async function isInStorageList(key, data) {
  let storeData  = await getDataFromStorage(key);
  return _.includes(storeData, data);
}

async function addToStorageList(key, data) {
  let storeData  = await getDataFromStorage(key);
  let setData = new Set(storeData);
  setData.add(data);
  storeData = Array.from(setData).sort();
  await storage.set({ [key] : storeData });
}

async function removeFromStorageList(key, data) {
  if(await isInStorageList(key, data)) {
    let storeData  = await getDataFromStorage(key);
    _.pull(storeData, data);
    await storage.set({ [key] : storeData });
  }
}

module.exports = {
  getDataFromStorage,
  addToStorageList,
  removeFromStorageList,
  isInStorageList
};

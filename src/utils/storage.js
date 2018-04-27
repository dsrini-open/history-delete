import browser from 'webextension-polyfill';
import initialStorage from './initialStorage.json';
import _ from 'lodash';

let syncArea;
async function getStorageArea(area) {
  if (typeof syncArea === 'undefined') {
    try {
      await browser.storage.sync.get('somevar');
      syncArea = true;
    } catch (e) {
      syncArea = false;
    }
  }

  return syncArea ? area : 'local';
}

async function load(area = 'sync'){
  area = await getStorageArea(area);
  return await set(initialStorage, area);
}

async function init(area = 'sync') {
  area = await getStorageArea(area);
  await load(area);
  return;
}

async function getAll(area = 'sync') {
  area = await getStorageArea(area);
  return get(_.keys(initialStorage), area);
}

async function get(keys = null, area = 'sync') {
  area = await getStorageArea(area);
  return browser.storage[area].get(keys);
}

async function set(obj, area = 'sync') {
  area = await getStorageArea(area);
  return browser.storage[area].set(obj);
}

async function remove(keys, area = 'sync') {
  area = await getStorageArea(area);
  return browser.storage[area].remove(keys);
}

async function clear(area = 'sync') {
  area = await getStorageArea(area);
  return browser.storage[area].clear();
}

module.exports = {
  init,
  getAll,
  get,
  set,
  remove,
  clear
};

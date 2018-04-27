import browser from 'webextension-polyfill';

import storage from 'utils/storage';
import history from 'utils/history';
import {showNotification,getMessage} from 'utils/common';
import {getDataFromStorage, addToStorageList, removeFromStorageList} from  'utils/data';

async function onPopupClick(id, site) {
  let key, data;
  switch(id){
    case "aw":
      await removeFromStorageList("blackList", site);
      await addToStorageList("whiteList", site);
      break;
    case "rw":
      await removeFromStorageList("whiteList", site);
      break;
    case "ab":
      await removeFromStorageList("whiteList", site);
      await addToStorageList("blackList", site);
      break;
    case "rb":
      await removeFromStorageList("blackList", site);
      break;
    case "rhc":
      await history.remove(site);
      break;
    case "rhb":
      data = await getDataFromStorage("blackList");
      await history.removeAll(data);
      break;
    case "rha":
      data = await getDataFromStorage("whiteList");
      await history.ignoreAll(data);
      break;
    default:
      throw(getMessage("error_actionType"));
      break;
  }

  await showNotification('notif_' + id);

}

async function onMessage(request) {
  switch(request.sender) {
    case "action":
      onPopupClick(request.id, request.site);
      break;
    case "settings":
      configureListeners();
      break;
    default:
      throw(getMessage("error_actionType"));
      break;
  }
}

function onTRemove(tabId, removeInfo) {
  if(!removeInfo.isWindowClosing) {
    return;
  }
  if(configureListeners())
    onPopupClick("rhb");
}

function setBrowserAction() {
  browser.browserAction.setTitle({title: getMessage('extensionName')});
  browser.browserAction.setPopup({popup: '/src/action/action.html'});
}

async function configureListeners() {
  const options = await getDataFromStorage("rhbInt");
  const remList = browser.tabs.onRemoved;

  if(options == false) {
    if(remList.hasListener(onTRemove))
      remList.removeListener(onTRemove);
  } else {
    if(!remList.hasListener(onTRemove))
      remList.addListener(onTRemove);
  }

  return options;
}

function addListeners() {
  browser.runtime.onMessage.addListener(onMessage);

  configureListeners();
}

async function onLoad() {
  await storage.init('sync');
  await setBrowserAction();
  addListeners();
}

document.addEventListener('DOMContentLoaded', onLoad);

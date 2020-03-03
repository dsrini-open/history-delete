import browser from "webextension-polyfill";

import * as install from "utils/install";
import * as storage from "utils/storage";
import * as history from "utils/history";
import * as alarm from "utils/alarm";
import { showNotification, getMessage } from "utils/common";
import {
  getDataFromStorage,
  addToStorageList,
  removeFromStorageList
} from "utils/data";

export const onPopupClick = async (id, site) => {
  let data;
  switch (id) {
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
      throw getMessage("error_actionType");
  }

  await showNotification(`notif_${id}`);
};

export const onMessage = async request => {
  switch (request.sender) {
    case "action":
      factory.onPopupClick(request.id, request.site);
      break;
    case "settings":
      factory.configureListeners();
      break;
    default:
      throw getMessage("error_actionType");
    // break;
  }
};

export const onExtInstall = async details => {
  switch (details.reason) {
    case "install":
    case "update":
    case "browser_update":
      await install.merge();
      break;
    default:
      /* not to do anything */
      break;
  }
};

export const onTRemove = async (tabId, removeInfo) => {
  if (!removeInfo.isWindowClosing) {
    return;
  }
  const actionVals = await storage.get("rhbInt");
  if (actionVals.rhbInt) await factory.onPopupClick("rhb");
};

export const onAlarm = async alarmInfo => {
  switch (alarmInfo.name) {
    case "rhaInt":
      await factory.onPopupClick("rha");
      break;
    default:
      break;
  }
};

const addOrRemoveListener = (removeCond, event, callback) => {
  const hasListener = event.hasListener(callback);
  if (removeCond) {
    if (hasListener) event.removeListener(callback);
  } else if (!hasListener) event.addListener(callback);
  return { hasListener };
};

export const configureListeners = async () => {
  const actions = await storage.get(["rhbInt", "rhaInt"]);

  addOrRemoveListener(
    actions.rhbInt === false,
    browser.tabs.onRemoved,
    factory.onTRemove
  );

  const name = "rhaInt";

  if (actions.rhaInt) {
    const alarmHours = await getDataFromStorage("alarmInt");
    const delayInMinutes = alarmHours * 60;
    const periodInMinutes = delayInMinutes;
    await alarm.clear(name);
    await alarm.create(name, {
      delayInMinutes,
      periodInMinutes
    });
  } else await alarm.clear(name);

  addOrRemoveListener(
    actions.rhaInt === false,
    browser.alarms.onAlarm,
    factory.onAlarm
  );
};

const setBrowserAction = () => {
  browser.browserAction.setTitle({ title: getMessage("extensionName") });
  browser.browserAction.setPopup({ popup: "/src/action/action.html" });
};

export const onLoad = async () => {
  await setBrowserAction();

  factory.configureListeners();
};

export const addListeners = () => {
  browser.runtime.onMessage.addListener(factory.onMessage);
  browser.runtime.onInstalled.addListener(factory.onExtInstall);
};

export const factory = {
  onMessage,
  onTRemove,
  onAlarm,
  onExtInstall,
  onPopupClick,
  configureListeners,
  addListeners
};

factory.addListeners();

document.addEventListener("DOMContentLoaded", onLoad);

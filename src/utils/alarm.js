import browser from "webextension-polyfill";
import { showNotification } from "utils/common";

export const create = async (name, cfg) => {
  showNotification(`notif_alarm_create_${name}`);
  return browser.alarms.create(name, cfg);
};

export const clear = async name => {
  const cleared = await browser.alarms.clear(name);
  if (cleared) showNotification(`notif_alarm_clear_${name}`);
  return cleared;
};

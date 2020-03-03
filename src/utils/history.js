import browser from "webextension-polyfill";
import { isUrlInDomains } from "utils/common";

export const search = (domain = "") => {
  return browser.history.search({
    text: domain,
    startTime: 0,
    maxResults: 2147483647
  });
};

export const remove = async domain => {
  // eslint-disable-next-line no-use-before-define
  const results = await factory.search(domain);
  const removes = [];
  results.forEach(result => {
    removes.push(browser.history.deleteUrl({ url: result.url }));
  });
  await Promise.all(removes);
};

export const removeAll = async domains => {
  const removes = [];
  domains.forEach(domain =>
    // eslint-disable-next-line no-use-before-define
    removes.push(factory.remove(domain))
  );
  await Promise.all(removes);
};

export const ignoreAll = async domains => {
  if (!Array.isArray(domains)) return;
  if (domains.length == 0) return clear();
  // eslint-disable-next-line no-use-before-define
  const results = await factory.search();

  if (!(Array.isArray(results) && results.length)) return;
  const removes = [];
  results.forEach(result => {
    if (!isUrlInDomains(result.url, domains)) {
      removes.push(browser.history.deleteUrl({ url: result.url }));
    }
  });
  await Promise.all(removes);
};

const clear = async () => {
  return browser.history.deleteAll();
};

export const factory = {
  clear,
  search,
  remove
};

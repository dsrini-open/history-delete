import browser from 'webextension-polyfill';
import {isUrlInDomains} from './common';

function search(domain = "") {
  return browser.history.search({
    text: domain,
    startTime: 0,
    maxResults: 2147483647
  });
}

async function remove(domain) {
  let results = await search(domain);
  for (let k in results) {
    await browser.history.deleteUrl({ url: results[k].url });
  }
}

async function removeAll(domains) {
  for(let domain of domains){
    await remove(domain);
  }
}

async function ignoreAll(domains) {
  let results = await search();
  for (let k in results){
    if(!isUrlInDomains(results[k].url, domains)) {
      await browser.history.deleteUrl({ url: results[k].url });
    }
  }
}

module.exports = {
  search,
  remove,
  removeAll,
  ignoreAll
};

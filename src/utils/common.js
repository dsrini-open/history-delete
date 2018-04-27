import browser from 'webextension-polyfill';
import urlParser from 'psl';
import _ from 'lodash';

const getMessage = browser.i18n.getMessage;

function showNotification(messageId) {
  return browser.notifications.create('cbd-notification', {
    type: 'basic',
    title: getMessage('extensionName'),
    message: getMessage(messageId),
    iconUrl: '/src/assets/icon-32.png'
  });
}

async function openPage(page) {
  const tab = await getActiveTab();
  let pageUrl;
  switch(page){
    case "settings":
      pageUrl = browser.extension.getURL("/src/settings/settings.html");
      break;
    default:
      throw(getMessage('error_pageType'));
  }
  await createTab(pageUrl ,tab.index + 1);
  window.close();
}

function createTab(pageUrl) {
  const props = {url: pageUrl, active: true};
  return browser.tabs.create(props);
}

async function getActiveTab() {
  const [tab] = await browser.tabs.query({
    lastFocusedWindow: true,
    active: true
  });
  return tab;
}

function getHost(url) {
  var a = document.createElement('a');
  a.href = url;
  return a.hostname;
}

function getRealSubdomain(parsedSubdomain = '') {
  if(parsedSubdomain != null) {
    let arrDomains = parsedSubdomain.split('.');
    if(arrDomains[0].indexOf('www') > -1)
      arrDomains.splice(0,1);
    parsedSubdomain = arrDomains.join('.');
  }

  return parsedSubdomain;
}

function getDomainHost(url){
  let host = getHost(url);
  let domain = host;

  if(urlParser.isValid(domain)) {
    let parsedUrl = urlParser.parse(domain);
    let subdomain = getRealSubdomain(parsedUrl.subdomain);

    domain = parsedUrl.domain;
    if(subdomain == null) {
      host = domain;
    } else {
      if(subdomain.length > 0)
        subdomain = subdomain.concat('.') ;
      host = subdomain.concat(parsedUrl.domain);
    }
  }

  return {domain, host};
}

function isUrlInDomains(url, domains){
  let urlDomain = getDomainHost(url).domain;
  let result = _.find(domains, (domain) => {
    return domain.indexOf(urlDomain) > -1;
  });

  return result ? true : false;
}

module.exports = {
  getMessage,
  showNotification,
  openPage,
  createTab,
  getActiveTab,
  getDomainHost,
  isUrlInDomains
};

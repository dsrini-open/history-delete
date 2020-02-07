import browser from "webextension-polyfill";
import urlParser from "psl";
import _ from "lodash";

export const { getMessage } = browser.i18n;

export const showNotification = messageId => {
  return browser.notifications.create("cbd-notification", {
    type: "basic",
    title: factory.getMessage("extensionName"),
    message: factory.getMessage(messageId),
    iconUrl: "/src/assets/icon-32.png"
  });
};

export const openPage = async page => {
  const tab = await factory.getActiveTab();
  let pageUrl;
  switch (page) {
    case "settings":
      pageUrl = browser.runtime.getURL("/src/settings/settings.html");
      break;
    default:
      throw getMessage("error_pageType");
  }
  await factory.createTab(pageUrl, tab.index + 1);
  window.close();
};

export const createTab = pageUrl => {
  const props = { url: pageUrl, active: true };
  return browser.tabs.create(props);
};

export const getActiveTab = async () => {
  const [tab] = await browser.tabs.query({
    lastFocusedWindow: true,
    active: true
  });
  return tab;
};

const getHost = url => {
  const a = document.createElement("a");
  a.href = url;
  return a.hostname;
};

const getRealSubdomain = (parsedSubdomain = "") => {
  let realSubdomain = parsedSubdomain;
  if (parsedSubdomain != null) {
    const arrDomains = parsedSubdomain.split(".");
    if (arrDomains[0].indexOf("www") > -1) arrDomains.splice(0, 1);
    realSubdomain = arrDomains.join(".");
  }

  return realSubdomain;
};

export const getDomainHost = url => {
  let host = getHost(url);
  let domain = host;

  if (urlParser.isValid(domain)) {
    const parsedUrl = urlParser.parse(domain);
    let subdomain = getRealSubdomain(parsedUrl.subdomain);

    domain = parsedUrl.domain;
    if (subdomain == null) {
      host = domain;
    } else {
      if (subdomain.length > 0) subdomain = subdomain.concat(".");
      host = subdomain.concat(parsedUrl.domain);
    }
  }

  return { domain, host };
};

export const isUrlInDomains = (url, domains) => {
  const urlDomain = getDomainHost(url).domain;
  const result = _.find(domains, domain => {
    return domain.indexOf(urlDomain) > -1;
  });

  return !!result;
};

export const factory = {
  createTab,
  getActiveTab,
  getMessage
};

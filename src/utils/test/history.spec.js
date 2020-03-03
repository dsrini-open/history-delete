import * as fns from "utils/history";
import * as commonFns from "utils/common";

let sandbox;

describe("utils.history", function() {
  before(() => {
    global.hooks.before();
  });

  after(() => {
    global.hooks.after();
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    chrome.history.deleteUrl.resetHistory();
    chrome.history.deleteAll.resetHistory();
    sandbox.restore();
  });

  it("search", () => {
    chrome.history.search.withArgs(sinon.match.any).yields(true);
    fns.search("google");
    expect(chrome.history.search, "search history").to.have.been.calledOnceWith(
      {
        text: "google",
        startTime: 0,
        maxResults: 2147483647
      }
    );
  });

  it("clear", () => {
    chrome.history.deleteAll.withArgs(sinon.match.any).yields(true);
    fns.factory.clear();
    expect(chrome.history.deleteAll, "clear history").to.have.been.calledOnce;
    expect(chrome.history.deleteUrl, "clear history deleteUrl not called").to
      .not.have.been.called;
  });

  it("remove", async () => {
    const urls = [{ url: "search.google.com" }, { url: "test.google.com" }];
    chrome.history.search.yields(urls);
    chrome.history.deleteUrl.yields(true);

    await fns.remove("google.com");

    expect(chrome.history.deleteUrl, "remove history").to.have.been.calledTwice;
    expect(chrome.history.deleteUrl, "remove history").to.have.been.calledWith(
      urls[0]
    );
    expect(chrome.history.deleteUrl, "remove history").to.have.been.calledWith(
      urls[1]
    );
  });

  it("removeAll", async () => {
    const urls = ["google.com", "site.com"];
    sandbox.stub(fns.factory, "remove");

    await fns.removeAll(urls);

    expect(fns.factory.remove, "remove All history").to.have.been.calledTwice;
    urls.forEach(url =>
      expect(
        fns.factory.remove,
        `remove history${url}`
      ).to.have.been.calledWith(url)
    );
  });


  it("ignoreAll urls", async () => {
    const urls = ["google.com", "site.com"];
    const siteUrls = [
      "some.google.com",
      "new.test.com",
      "varioussites.com",
      "me.site.com",
      "test.mine.come"
    ];
    const urlObjs = siteUrls.map(eachUrl => ({
      url: eachUrl
    }));
    sandbox.stub(commonFns, "isUrlInDomains");
    const hist_fns = require("utils/history");
    sandbox.stub(hist_fns.factory, "search");
    hist_fns.factory.search.returns(urlObjs);
    commonFns.isUrlInDomains.withArgs(siteUrls[0], urls).returns(true);
    commonFns.isUrlInDomains.withArgs(siteUrls[1], urls).returns(false);
    commonFns.isUrlInDomains.withArgs(siteUrls[2], urls).returns(false);
    commonFns.isUrlInDomains.withArgs(siteUrls[3], urls).returns(true);
    commonFns.isUrlInDomains.withArgs(siteUrls[4], urls).returns(false);

    chrome.history.deleteUrl.resolves(true);
    await fns.ignoreAll(urls);
    expect(chrome.history.deleteUrl, "ignoreAll history").to.have.been
      .calledThrice;
    expect(chrome.history.deleteAll, "ignoreAll deleteAll not called").to.not
      .have.been.called;
  });

  it("ignoreAll all", () => {
    const hist_fns = require("utils/history");
    sandbox.stub(hist_fns.factory, "clear");
    hist_fns.factory.clear.yields(true);

    expect(hist_fns.ignoreAll([]), "calling").to.eventually.become(undefined);
    expect(chrome.history.deleteAll, "ignoreAll deleteAll called").to.have.been
      .calledOnce;
    expect(
      chrome.history.deleteUrl.callCount,
      "ignoreAll deleteUrl not called"
    ).to.equal(0);
  });
});

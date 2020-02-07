import * as fns from "utils/common";

let sandbox;

describe("utils.common", function() {
  before(() => {
    global.hooks.before();
  });

  after(() => {
    global.hooks.after();
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(chrome.i18n, "getMessage");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("getMessage", async () => {
    chrome.i18n.getMessage.withArgs("some.message").resolves("someval");
    //const testval = await chrome.i18n.getMessage("some.message");
    //console.log(JSON.stringify(testval));
    const retVal = await fns.getMessage("some.message");
    expect(retVal).to.equal("someval");
    expect(chrome.i18n.getMessage).to.have.been.calledWithExactly("some.message");
  });

  it("showNotification", async () => {
    sandbox.stub(fns.factory, "getMessage");
    fns.factory.getMessage.withArgs("extensionName").returns("historyDelete");
    fns.factory.getMessage.withArgs("notify.1").returns("notify1");
    chrome.notifications.create.yields(true);

    await fns.showNotification("notify.1");

    expect(chrome.notifications.create).to.have.been.calledOnceWith(
      "cbd-notification",
      {
        type: "basic",
        title: "historyDelete",
        message: "notify1",
        iconUrl: "/src/assets/icon-32.png"
      }
    );
  });

  it("getActiveTab", () => {
    chrome.tabs.query.yields([{ name: "tab_1" }, { name: "tab_2" }]);
    return expect(fns.getActiveTab()).to.eventually.become({ name: "tab_1" });
  });

  it("openPage", async () => {
    const errorMessage = "Error page type";
    const tab = { index: 0, name: "tab_1" }, respUrl = "mine.page";
    const retValue = "true";

    chrome.i18n.getMessage.withArgs("error_pageType").returns(errorMessage);
    chrome.tabs.query.yields([tab]);
    expect(fns.openPage()).to.be.rejectedWith(errorMessage);

    //stubs
    chrome.runtime.getURL.withArgs("/src/settings/settings.html").returns(respUrl);
    chrome.tabs.create.yields(retValue);
    const closeSpy = sandbox.spy();
    window.close = closeSpy;
    const createTabStub = sandbox.stub(fns.factory, "createTab");
    createTabStub.returns(retValue);

    await fns.openPage("settings");

    expect(chrome.runtime.getURL, "runtime URL").to.have.been.calledOnce;
    expect(createTabStub, "createTabStub").to.have.been.calledOnceWithExactly(
      respUrl,
      tab.index + 1
    );
    expect(closeSpy, "window close called").to.have.been.calledOnce;
  });

  it("getDomainHost", () => {
    let url = fns.getDomainHost("http://www.test.google.com/whatapage");

    expect(url, "TWO KEYS").to.contain.all.keys(["domain", "host"]);
    expect(url.domain, "DOMAIN 1").to.equal("google.com");
    expect(url.host, "HOST 1").to.equal("test.google.com");

    url = fns.getDomainHost(
      "http://www.first.second.thrid.google.com/whatapage"
    );

    expect(url).to.contain.all.keys(["domain", "host"]);
    expect(url.domain).to.equal("google.com");
    expect(url.host).to.equal("first.second.thrid.google.com");

    url = fns.getDomainHost("https://somedomain.test.google.com/whatapage");

    expect(url).to.contain.all.keys(["domain", "host"]);
    expect(url.domain).to.equal("google.com");
    expect(url.host).to.equal("somedomain.test.google.com");
  });

  it("isUrlInDomains", () => {
    let chk = fns.isUrlInDomains("http://some.com/test", ["some.com"]);
    expect(chk, "equal 1").to.equal(true);
    chk = fns.isUrlInDomains("http://some2.com/test", [
      "some.com",
      "some2.com"
    ]);
    expect(chk, "equal 2").to.equal(true);
    chk = fns.isUrlInDomains("http://some3.com/test", ["some.com"]);
    expect(chk, "false 1").to.equal(false);
  });

  it("createTab", () => {
    const pageUrl = "some";

    chrome.tabs.create.yields("true");

    fns.createTab(pageUrl);
    expect(chrome.tabs.create, "tabs create").to.have.been.calledOnceWith({
      url: pageUrl,
      active: true
    });
  });
});

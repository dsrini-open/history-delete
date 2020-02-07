import * as background from "background";
import * as storage from "utils/storage";
import * as history from "utils/history";
import * as common from "utils/common";
import * as data from "utils/data";
import * as install from "utils/install";
import * as alarm from "utils/alarm";

let sandbox;

describe("background", function() {
  before(() => {
    global.hooks.before();
  });

  after(() => {
    global.hooks.after();
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(data, "getDataFromStorage");
    sandbox.stub(data, "addToStorageList");
    sandbox.stub(data, "removeFromStorageList");
    sandbox.stub(common, "showNotification");
    sandbox.stub(common, "getMessage");
    sandbox.stub(history, "remove");
    sandbox.stub(history, "removeAll");
    sandbox.stub(history, "ignoreAll");
    sandbox.stub(storage, "init");
    sandbox.stub(storage, "get");
    sandbox.stub(alarm, "create");
    sandbox.stub(alarm, "clear");

    data.removeFromStorageList.returns(true);
    data.addToStorageList.returns(true);
    data.getDataFromStorage.returns(true);
    common.showNotification.returns(true);
    common.getMessage.returns(true);
    history.remove.returns(true);
    history.removeAll.returns(true);
    history.ignoreAll.returns(true);
    storage.init.returns(true);
    alarm.create.returns(true);
    alarm.clear.returns(true);
  });

  afterEach(() => {
    chrome.browserAction.setTitle.reset();
    chrome.browserAction.setPopup.reset();
    chrome.tabs.onRemoved.removeListeners();
    sandbox.restore();
  });

  it("onPopupClick", async () => {
    const site = "google.com";

    await background.onPopupClick("aw", site);
    expect(data.removeFromStorageList).to.have.been.calledOnceWithExactly(
      "blackList",
      site
    );
    expect(data.addToStorageList).to.have.been.calledOnceWithExactly(
      "whiteList",
      site
    );
    expect(common.showNotification).to.have.been.calledOnceWithExactly(
      "notif_aw"
    );

    sandbox.reset();

    await background.onPopupClick("rw", site);
    expect(data.removeFromStorageList).to.have.been.calledOnceWithExactly(
      "whiteList",
      site
    );
    expect(common.showNotification).to.have.been.calledOnceWithExactly(
      "notif_rw"
    );

    sandbox.reset();

    await background.onPopupClick("ab", site);
    expect(data.removeFromStorageList).to.have.been.calledOnceWithExactly(
      "whiteList",
      site
    );
    expect(data.addToStorageList).to.have.been.calledOnceWithExactly(
      "blackList",
      site
    );
    expect(common.showNotification).to.have.been.calledOnceWithExactly(
      "notif_ab"
    );

    sandbox.reset();

    await background.onPopupClick("rb", site);
    expect(data.removeFromStorageList).to.have.been.calledOnceWithExactly(
      "blackList",
      site
    );
    expect(common.showNotification).to.have.been.calledOnceWithExactly(
      "notif_rb"
    );

    sandbox.reset();

    await background.onPopupClick("rhc", site);
    expect(history.remove).to.have.been.calledOnceWithExactly(site);
    expect(common.showNotification).to.have.been.calledOnceWithExactly(
      "notif_rhc"
    );

    sandbox.reset();

    const blSitesVisited = [
      "google.com",
      "visited.googel.com",
      "tested.google.com"
    ];
    data.getDataFromStorage.withArgs("blackList").returns(blSitesVisited);

    await background.onPopupClick("rhb", site);
    expect(data.getDataFromStorage).to.have.been.calledOnceWithExactly(
      "blackList"
    );
    expect(history.removeAll).to.have.been.calledOnceWithExactly(
      blSitesVisited
    );
    expect(common.showNotification).to.have.been.calledOnceWithExactly(
      "notif_rhb"
    );

    sandbox.reset();

    const wlSitesVisited = [
      "google.com",
      "visited.googel.com",
      "tested.google.com"
    ];
    data.getDataFromStorage.withArgs("whiteList").returns(wlSitesVisited);

    await background.onPopupClick("rha", site);
    expect(data.getDataFromStorage).to.have.been.calledOnceWithExactly(
      "whiteList"
    );
    expect(history.ignoreAll).to.have.been.calledOnceWithExactly(
      wlSitesVisited
    );
    expect(common.showNotification).to.have.been.calledOnceWithExactly(
      "notif_rha"
    );

    sandbox.reset();

    const error = "internal error";
    common.getMessage.withArgs("error_actionType").returns(error);
    try {
      await background.onPopupClick("xxx", site);
    } catch (e) {
      expect(e).to.equal(error);
    }
    expect(common.getMessage).to.have.been.calledOnceWithExactly(
      "error_actionType"
    );

    sandbox.reset();
  });

  it("onMessage", async () => {
    sandbox.stub(background.factory, "onPopupClick");

    background.factory.onPopupClick.returns("true");
    await background.onMessage({
      id: "test_id",
      sender: "action",
      site: "google.com"
    });

    expect(background.factory.onPopupClick).to.have.been.calledOnceWithExactly(
      "test_id",
      "google.com"
    );
    background.factory.onPopupClick.restore();
    sandbox.stub(background.factory, "configureListeners");

    background.factory.configureListeners.returns("true");
    await background.onMessage({
      sender: "settings"
    });

    expect(background.factory.configureListeners).to.have.been.calledOnce;
    background.factory.configureListeners.restore();

    const error = "internal error";
    common.getMessage.withArgs("error_actionType").returns(error);
    try {
      await background.onMessage({ sender: "xxx" });
    } catch (e) {
      expect(e).to.equal(error);
    }
    expect(common.getMessage).to.have.been.calledOnceWithExactly(
      "error_actionType"
    );
  });

  it("onTRemove", async () => {
    sandbox.stub(background.factory, "onPopupClick");

    background.factory.onPopupClick.withArgs(sinon.match.any).returns("some");
    storage.get.withArgs("rhbInt").returns({ rhbInt: false });

    await background.onTRemove("x1234", { isWindowClosing: false });

    expect(background.factory.onPopupClick).to.not.have.been.called;
    expect(storage.get).to.not.have.been.called;

    await background.onTRemove("x1234", { isWindowClosing: true });

    expect(background.factory.onPopupClick).to.not.have.been.called;
    expect(storage.get).to.have.been.calledWithExactly("rhbInt");

    storage.get.withArgs("rhbInt").returns({ rhbInt: true });
    await background.onTRemove("x1234", { isWindowClosing: true });

    expect(storage.get).to.have.been.calledWithExactly("rhbInt");
    expect(storage.get).to.have.been.calledTwice;
    expect(background.factory.onPopupClick).to.have.been.calledOnceWithExactly(
      "rhb"
    );

    background.factory.onPopupClick.restore();
  });

  it("onExtInstall", async () => {
    const install_types = ["install", "update", "browser_update"];

    sandbox.stub(install, "merge");
    install.merge.returns(true);
    for (const type of install_types) {
      await background.onExtInstall({
        reason: type
      });

      expect(install.merge).to.have.been.calledOnce;
      sandbox.reset();
    }

    await background.onExtInstall({
      reason: ""
    });
    expect(install.merge).to.not.have.been.called;
  });

  it("onAlarm", async () => {
    sandbox.stub(background.factory, "onPopupClick");
    background.factory.onPopupClick.returns("true");
    const install_types = ["install", "update", "browser_update"];

    await background.onAlarm("some");

    expect(background.factory.onPopupClick).to.not.have.been.called;

    await background.onAlarm({ name: "rhaInt" });

    expect(background.factory.onPopupClick).to.have.been.calledOnceWithExactly(
      "rha"
    );
    background.factory.onPopupClick.restore();
  });

  it("onLoad", async () => {
    sandbox.stub(background.factory, "configureListeners");

    chrome.browserAction.setTitle.withArgs(sinon.match.any).returns();
    chrome.browserAction.setPopup.withArgs(sinon.match.any).returns();
    common.getMessage.withArgs("extensionName").returns("history_delete");
    background.factory.configureListeners.returns();

    await background.onLoad();

    expect(background.factory.configureListeners).to.have.been.calledOnce;
    expect(chrome.browserAction.setTitle).to.have.been.calledOnceWith({
      title: "history_delete"
    });
    expect(chrome.browserAction.setPopup).to.have.been.calledOnceWith({
      popup: "/src/action/action.html"
    });

    background.factory.configureListeners.restore();
  });

  it("configureListeners", async () => {
    const keys = ["rhbInt", "rhaInt"];
    storage.get.withArgs(keys).returns({ rhbInt: true, rhaInt: false });
    await chrome.alarms.onAlarm.addListener(background.factory.onAlarm);
    chrome.alarms.onAlarm.addListener.resetHistory();

    await background.configureListeners();

    expect(storage.get).to.have.been.calledOnceWithExactly(keys);
    expect(
      chrome.tabs.onRemoved.addListener
    ).to.have.been.calledOnceWithExactly(background.factory.onTRemove);
    expect(chrome.tabs.onRemoved.removeListener).to.not.have.been.calledWith(
      background.factory.onTRemove
    );
    expect(
      chrome.alarms.onAlarm.removeListener
    ).to.have.been.calledOnceWithExactly(background.factory.onAlarm);
    expect(chrome.alarms.onAlarm.addListener).to.not.have.been.calledWith(
      background.factory.onAlarm
    );
    expect(alarm.clear).to.have.been.calledOnceWithExactly("rhaInt");
    expect(alarm.create).to.not.have.been.called;

    storage.get.reset();
    chrome.alarms.onAlarm.removeListener.resetHistory();
    chrome.alarms.onAlarm.addListener.resetHistory();
    chrome.tabs.onRemoved.removeListener.resetHistory();
    chrome.tabs.onRemoved.addListener.resetHistory();
    alarm.clear.resetHistory();

    storage.get.withArgs(keys).returns({ rhbInt: false, rhaInt: true });
    data.getDataFromStorage.withArgs("alarmInt").returns(3);
    await chrome.tabs.onRemoved.addListener(background.factory.onTRemove);
    chrome.tabs.onRemoved.addListener.resetHistory();

    await background.configureListeners();

    expect(storage.get).to.have.been.calledOnceWithExactly(keys);
    expect(
      chrome.tabs.onRemoved.removeListener
    ).to.have.been.calledOnceWithExactly(background.factory.onTRemove);
    expect(chrome.tabs.onRemoved.addListener).to.not.have.been.calledWith(
      background.factory.onTRemove
    );
    expect(
      chrome.alarms.onAlarm.addListener
    ).to.have.been.calledOnceWithExactly(background.factory.onAlarm);
    expect(chrome.alarms.onAlarm.removeListener).to.not.have.been.calledWith(
      background.factory.onAlarm
    );
    expect(alarm.clear).to.have.been.calledOnceWithExactly("rhaInt");
    expect(alarm.create).to.have.been.calledOnceWithExactly("rhaInt", {
      delayInMinutes: 1 / 60,
      periodInMinutes: 180
    });

    storage.get.reset();
  });

  it("addListeners", () => {
    chrome.runtime.onMessage.addListener.resetHistory();
    chrome.runtime.onInstalled.addListener.resetHistory();

    background.factory.addListeners();
    expect(chrome.runtime.onMessage.addListener).to.have.been.calledOnce;
    expect(chrome.runtime.onInstalled.addListener).to.have.been.calledOnce;
    /*
    expect(
      chrome.runtime.onMessage.addListener
    ).to.have.been.calledOnceWithExactly(background.factory.onMessage);
    expect(
      chrome.runtime.onInstalled.addListener
    ).to.have.been.calledOnceWithExactly(background.factory.onExtInstall);
    */
  });
});

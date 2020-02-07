import * as fns from "utils/storage";
import initialStorage from "../initialStorage.json";

let sandbox;

describe("utils.storage", function() {
  before(() => {
    global.hooks.before();
  });

  after(() => {
    global.hooks.after();
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    chrome.storage.sync.get.withArgs("somevar").yields("Value");
  });

  afterEach(() => {
    chrome.storage.sync.get.reset();
    chrome.storage.local.get.reset();
    chrome.storage.sync.set.reset();
    chrome.storage.local.set.reset();
    sandbox.restore();
  });

  it("load", async () => {
    sandbox.stub(fns.factory, "set");
    fns.factory.set.returns(true);

    await fns.load();
    expect(fns.factory.set, "load set").to.have.been.calledOnceWith(
      initialStorage, "sync"
    );
  });

  it("getAll", () => {
    const dummy = { key: "value" },
      response = { version: 2, whiteList: [], blackList: [] };
    const keys = [
      "version",
      "whiteList",
      "blackList",
      "menuCfg",
      "rhbInt",
      "rhaInt",
      "alarmInt",
      "popupMenus"
    ];
    chrome.storage.sync.get.withArgs(keys).yields(response);
    chrome.storage.sync.get.withArgs(sinon.match.any).yields(dummy);

    expect(fns.getAll(), "sync getAll").to.eventually.become(response);
  });

  it("get", () => {
    chrome.storage.sync.get.withArgs("test_key_1").yields("test_val");
    expect(fns.get("test_key_1"), "sync get").to.eventually.become("test_val");

    chrome.storage.local.get.withArgs("test_key_1").yields("test_val");
    expect(fns.get("test_key_1", "local"), "local get").to.eventually.become(
      "test_val"
    );
  });

  it("set", async () => {
    const setArg = { key: "some" };
    chrome.storage.sync.set.withArgs(setArg).yields(setArg);

    let retVal = await fns.set(setArg);

    expect(retVal, "set return").to.deep.equal(setArg);
    expect(chrome.storage.sync.set, "set sync").to.have.been.calledOnceWith(
      setArg
    );

    chrome.storage.local.set.yields(setArg);
    retVal = await fns.set(setArg, "local");
    return expect(chrome.storage.local.set, "set local").to.have.been.calledOnceWith(
      setArg
    );
  });

  it("remove", async () => {
    const removeArg = ["key_1", "key_2"];
    chrome.storage.sync.remove.withArgs(removeArg).yields(true);
    let retVal = await fns.remove(removeArg);
    expect(retVal, "remove return").to.equal(true);
    expect(
      chrome.storage.sync.remove,
      "remove sync"
    ).to.have.been.calledOnceWith(removeArg);

    chrome.storage.local.remove.withArgs(removeArg).yields(true);
    retVal = await fns.remove(removeArg, "local");
    expect(
      chrome.storage.local.remove,
      "remove local"
    ).to.have.been.calledOnceWith(removeArg);
  });

  it("clear", async () => {
    chrome.storage.sync.clear.yields(true);
    await fns.clear();
    expect(chrome.storage.sync.clear, "clear sync").to.have.been.calledOnce;

    chrome.storage.local.clear.yields(true);
    await fns.clear("local");
    expect(chrome.storage.local.clear, "clear local").to.have.been.calledOnce;
  });

  it("init", async () => {
    const response = "getResponses";
    sandbox.stub(fns.factory, "get");
    sandbox.stub(fns.factory, "set");
    sandbox.stub(fns.factory, "getAll");

    fns.factory.get.withArgs(sinon.match.any).returns(response);
    fns.factory.set.withArgs(sinon.match.any).returns(true);
    fns.factory.getAll.withArgs(sinon.match.any).returns({});

    await fns.init();

    expect(fns.factory.set).to.not.have.been.called;
    expect(fns.factory.get).to.not.have.been.called;
  });

  it("get exc", async () => {
    //remove cache and try reloading file.
    delete require.cache[require.resolve("utils/storage")];

    const excFns = require("utils/storage");
    const getArg = "test_key_3";
    const getVal = "local_test_val";

    chrome.runtime.lastError = { message: "sync error" };

    chrome.storage.sync.get.withArgs("somevar").yields(getVal);
    chrome.storage.local.get.withArgs(getArg).yields(getVal);

    let ret;
    try {
      ret = await excFns.get(getArg);
    } catch (E) {}
    expect(chrome.storage.local.get, "get local").to.have.been.calledWith(
      getArg
    );
  });
});

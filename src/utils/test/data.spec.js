import * as storage from 'utils/storage';

let sandbox, fns;

describe("utils.data", function() {
  before(() => {
    global.hooks.before();
  });

  after(() => {
    global.hooks.after();
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(storage, "get");
    sandbox.stub(storage, "set");
    fns = require("utils/data");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("getDataFromStorage", async () => {
    const key = "test_key";
    const retVal = {
      [key]: "test_value"
    };
    storage.get.withArgs(sinon.match.string).returns(retVal);
    let retObj = await fns.getDataFromStorage(key);
    expect(retObj).to.equal(retVal[key]);
    expect(storage.get).to.have.been.calledOnceWithExactly(key);
  });

  it("isInStorageList", async () => {
    const key = "test_list";
    const retVal = {
      [key]: ["google.com", "some.com", "test.com"]
    };
    storage.get.withArgs(sinon.match.string).returns(retVal);
    let retObj = await fns.isInStorageList(key, "some.com");
    expect(retObj).to.equal(true);

    retObj = await fns.isInStorageList(key, "MYSITE.com");
    expect(retObj).to.equal(false);
  });

  it("addToStorageList", async () => {
    const key = "test_list";
    const retVal = {
      [key]: ["google.com", "some.com", "test.com"]
    };
    storage.get.withArgs(sinon.match.string).returns(retVal);
    storage.set.withArgs(sinon.match.object);

    let retObj = await fns.addToStorageList(key, "mine.com");
    expect(storage.set).to.have.been.calledOnceWithExactly({
      [key]: ["google.com", "mine.com", "some.com", "test.com"]
    });
  });

  it("removeFromStorageList", async () => {
    const key = "test_list";
    const retVal = {
      [key]: ["google.com", "some.com", "test.com"]
    };
    storage.get.withArgs(sinon.match.string).returns(retVal);
    storage.set.withArgs(sinon.match.object);

    let retObj = await fns.removeFromStorageList(key, "test.com");
    expect(storage.set).to.have.been.calledOnceWithExactly({
      [key]: ["google.com", "some.com"]
    });
  });
});

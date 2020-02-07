import * as fns from "utils/alarm";
import * as common from "utils/common";

let sandbox;

describe("utils.alarm", function() {
  before(() => {
    global.hooks.before();
  });

  after(() => {
    global.hooks.after();
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(common, "showNotification");

    common.showNotification.withArgs(sinon.match.any).returns(true);
  });

  afterEach(() => {
    chrome.alarms.create.reset();
    chrome.alarms.clear.reset();
    sandbox.restore();
  });

  it("create", async () => {
    const response = true;
    chrome.alarms.create
      .withArgs(sinon.match.any, sinon.match.any)
      .returns(response);
    const name = "dummy",
      cfg = {
        delayInMinutes: 1,
        periodInMinutes: 1 * 60
      };
    await fns.create(name, cfg);
    expect(chrome.alarms.create, "alarm create").to.have.been.calledWith(
      name,
      cfg
    );
    expect(common.showNotification).to.have.been.calledOnceWith("notif_alarm_create_" + name);
  });

  it("clear", () => {
    const name = "dummy",
      response = true;
    chrome.alarms.clear.withArgs(name).yields(response);
    expect(fns.clear(name), "alarm clear").to.eventually.become(response);
    expect(chrome.alarms.clear, "alarm clear args").to.have.been.calledWith(name);
    expect(common.showNotification).to.have.been.calledOnceWith("notif_alarm_clear_" + name);
  });
});

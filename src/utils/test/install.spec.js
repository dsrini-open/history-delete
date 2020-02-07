import * as fns from "utils/install";
import * as storage from "utils/storage";

import initialStorage from "../initialStorage.json";

let sandbox;

describe("utils.install", function() {
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
    sandbox.restore();
  });

  it("merge", async () => {
    try {
      const response_arr = [
        {},
        { version: "dummy", menuCfg: "some" },
        { blackList: ["google.com"], whiteList: "some.com" },
        { rhbInt: true, rhaInt: true, alarmInt: 6, popupMenus: [] }
      ];
      const other_keys = [
        "blackList",
        "whiteList",
        "rhbInt",
        "rhaInt",
        "popupMenus"
      ];
      let args, count;

      for(let response in response_arr) {
        chrome.storage.sync.get.yields(response);
        chrome.storage.sync.set.yields(response);

        await fns.merge();

        count = chrome.storage.sync.set.callCount;
        args = chrome.storage.sync.set.args[count - 1][0];

        expect(args.version, "version").to.equal(initialStorage.version);
        expect(args.menuCfg, "menuCfg").to.deep.equal(initialStorage.menuCfg);
        other_keys.forEach(key => {
          if (response[key])
            expect(args[key], "other key" + key).to.equal(response[key]);
        });
        expect(chrome.storage.sync.get, "storage get").to.have.been.calledWith([
          "version",
          "whiteList",
          "blackList",
          "menuCfg",
          "rhbInt",
          "rhaInt",
          "alarmInt",
          "popupMenus"
        ]);

      }

      expect(chrome.storage.sync.set.callCount, "call count").to.equal(response_arr.length);

    } catch (E) {
      console.log(E);
      assert.fail("Some error");
    }
  });
});

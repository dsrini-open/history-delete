import { mount, shallowMount, createLocalVue } from "@vue/test-utils";
import * as storage from "utils/storage";
import * as common from "utils/common";
import * as data from "utils/data";

import vuetify from "test/vuetify_config";

import Action from "src/action/Action.vue";

let sandbox,
  options = {
    methods: {
      getMessage: () => {},
      openPage: () => {},
      getTitle: id => {},
      clickPopup: id => {}
    }
  };
const localVue = createLocalVue();

describe("Action", function() {
  before(() => {
    global.hooks.before();
  });

  after(() => {
    global.hooks.after();
  });

  beforeEach(() => {
    options.vuetify = vuetify;
    options.localVue = localVue;

    sandbox = sinon.createSandbox();
    //options = sandbox.stub();
    sandbox.stub(options, "methods");
    sandbox.stub(options.methods, "getMessage");
    sandbox.stub(options.methods, "openPage");
    sandbox.stub(options.methods, "getTitle");
    sandbox.stub(options.methods, "clickPopup");

    sandbox.stub(storage, "get");
    sandbox.stub(data, "isInStorageList");
    sandbox.stub(common, "getMessage");
    sandbox.stub(common, "getActiveTab");
    sandbox.stub(common, "getDomainHost");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("getTitle", () => {
    common.getMessage.withArgs("some").returns("test");
    Action.methods.getTitle("some");

    expect(common.getMessage, "getMessage").to.have.been.calledOnceWith(
      "popup_some"
    );
  });

  it("clickPopup", async () => {
    const activeTab = { url: "http://www.test.google.com" };
    storage.get
      .withArgs(["popupMenus"])
      .returns({ popupMenus: ["aw", "rha", "ab", "rhb", "rhc"] });
    common.getMessage.withArgs("extensionName").returns("History Delete");
    common.getActiveTab.returns(activeTab);
    common.getDomainHost
      .withArgs(activeTab.url)
      .returns({ domain: "google.com", host: "test.google.com" });

    chrome.runtime.sendMessage.returns("true");
    const windowCloStub = sandbox.stub().returns(true);
    const windowStub = { close: windowCloStub };

    const newOptions = {
      methods: {
        getMessage: sandbox.stub(),
        openPage: sandbox.stub(),
        getTitle: sandbox.stub()
      },
      data: function() {
        return {
          domainHost: { host: "google.com", domain: "nocalled.com" },
          rgHostDom: { value: "host" }
        };
      }
    };

    const wrapper = shallowMount(Action, newOptions);
    const vm = wrapper.vm;
    vm.clickPopup("some", windowStub);

    expect(
      chrome.runtime.sendMessage,
      "sendMessage"
    ).to.have.been.calledOnceWith({
      id: "some",
      sender: "action",
      site: "google.com"
    });
    expect(windowCloStub).to.have.been.calledOnce;
  });

  it("load", async () => {
    const testSteps = [
      {
        retDH: { domain: "google.com", host: "test.google.com" },
        activeTab: { url: "http://www.test.google.com" },
        inWhiteList: { domain: false, host: false },
        inBlackList: { domain: false, host: false }
      },
      {
        retDH: { domain: "google.com", host: "test.google.com" },
        activeTab: { url: "http://www.test.google.com" },
        inWhiteList: { domain: true, host: false },
        inBlackList: { domain: false, host: false }
      },
      {
        retDH: { domain: "google.com", host: "google.com" },
        activeTab: { url: "http://www.google.com" },
        inWhiteList: { domain: false, host: true },
        inBlackList: { domain: false, host: false }
      },
      {
        retDH: { domain: "google.com", host: "test.google.com" },
        activeTab: { url: "http://www.test.google.com" },
        inWhiteList: { domain: false, host: false },
        inBlackList: { domain: true, host: false }
      },
      {
        retDH: { domain: "google.com", host: "test.google.com" },
        activeTab: { url: "http://www.test.google.com" },
        inWhiteList: { domain: false, host: false },
        inBlackList: { domain: false, host: true }
      },
      {
        retDH: {},
        activeTab: { url: "http://" },
        inWhiteList: { domain: false, host: false },
        inBlackList: { domain: false, host: false }
      }
    ];

    let retDH, wrapper, vm, buttons, button;

    for (let eachTestStep of testSteps) {
      retDH = eachTestStep.retDH;
      storage.get
        .withArgs(["popupMenus"])
        .returns({ popupMenus: ["aw", "rha", "ab", "rhb", "rhc"] });
      common.getMessage.withArgs("extensionName").returns("History Delete");
      common.getActiveTab.returns(eachTestStep.activeTab);
      common.getDomainHost.withArgs(eachTestStep.activeTab.url).returns(retDH);
      options.methods.getMessage
        .withArgs("extensionName")
        .returns("History Delete");
      options.methods.getTitle.withArgs("rghd_host").returns("Host");
      options.methods.getTitle.withArgs("rghd_dom").returns("Domain");
      options.methods.getTitle.withArgs("aw").returns("Add to Whitelist");
      options.methods.getTitle.withArgs("ab").returns("Add to Blacklist");
      options.methods.getTitle.withArgs("rb").returns("Remove from Blacklist");
      options.methods.getTitle.withArgs("rw").returns("Remove from Whitelist");
      options.methods.getTitle
        .withArgs("rha")
        .returns("Remove all but whitelist");
      options.methods.getTitle.withArgs("rhb").returns("Remove all blacklist");
      common.getMessage
        .withArgs("rhc", retDH.host)
        .returns("Remove for test.google.com");
      data.isInStorageList
        .withArgs("whiteList", retDH.domain)
        .returns(eachTestStep.inWhiteList.domain);
      data.isInStorageList
        .withArgs("whiteList", retDH.host)
        .returns(eachTestStep.inWhiteList.host);
      data.isInStorageList
        .withArgs("blackList", retDH.domain)
        .returns(eachTestStep.inBlackList.domain);
      data.isInStorageList
        .withArgs("blackList", retDH.host)
        .returns(eachTestStep.inBlackList.host);

      wrapper = mount(Action, options);
      vm = wrapper.vm;

      buttons = wrapper.findAll("div[role='listitem']");
      button = buttons.at(0);
      await button.trigger("click");
      expect(options.methods.clickPopup).to.have.been.calledOnceWithExactly(
        "aw"
      );
      options.methods.clickPopup.reset();

      button = buttons.at(3);
      await button.trigger("click");
      expect(options.methods.clickPopup).to.have.been.calledOnceWithExactly(
        "rb"
      );
      options.methods.clickPopup.reset();
    }
  }).timeout(15000);
});

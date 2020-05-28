import { shallowMount, mount, createLocalVue } from "@vue/test-utils";
import * as storage from "utils/storage";
import * as common from "utils/common";
import vuetify from "test/vuetify_config";

import initialStorage from "utils/initialStorage.json";

import Settings from "src/settings/Settings.vue";

let sandbox,
  options = {
    methods: {
      getMessage: () => {}
    }
  },
  wrapper,
  vm;
const storageVals = initialStorage;
storageVals.whiteList = ["googel.com", "google2.com", "test.com"];
storageVals.blackList = ["some.com", "variable.test.com"];
const localVue = createLocalVue();

describe("Settings", function() {
  before(() => {
    global.hooks.before();
  });

  after(() => {
    global.hooks.after();
  });

  beforeEach(() => {
    //const vuetify = require("test/vuetify_config").default;
    options.vuetify = vuetify;
    options.localVue = localVue;

    sandbox = sinon.createSandbox();
    //options = sandbox.stub();
    sandbox.stub(options, "methods");
    sandbox.stub(options.methods, "getMessage");

    sandbox.stub(storage, "getAll");
    sandbox.stub(storage, "set");
    sandbox.stub(common, "getMessage");
    sandbox.stub(common, "getActiveTab");
    sandbox.stub(common, "getDomainHost");
    storage.getAll.returns(storageVals);
    storage.set.returns(true);
    common.getMessage.withArgs("options_title_ext").returns("History Delete");
    common.getMessage.withArgs("options_menu_header").returns("Settings");
    common.getMessage.withArgs("options_action_header").returns("Actions");
    common.getMessage.withArgs("options_misc_header").returns("Misc");
    common.getMessage.withArgs("options_title_wl").returns("Whitelists");
    common.getMessage.withArgs("options_table_header1").returns("Host");
    common.getMessage.withArgs("options_table_header2").returns("Delete");
    common.getMessage.withArgs("options_title_bl").returns("Blacklists");

    common.getMessage
      .withArgs("options_warn_removeEntry")
      .returns("Are you sure to remove entry?");
    common.getMessage.withArgs("options_menu_bl").returns("Enable blacklist");
    common.getMessage.withArgs("options_menu_wl").returns("Enable Whitelist");
    common.getMessage
      .withArgs("options_menu_cw")
      .returns("Enable current website remove");
    common.getMessage
      .withArgs("options_action_rhbInt")
      .returns("Enable clearing blacklist on window close");
    common.getMessage
      .withArgs("options_action_rhaInt")
      .returns("Enable Clearing Whitelist on Interval");
    common.getMessage
      .withArgs("options_action_enNot")
      .returns("Enable Notification");
    common.getMessage
      .withArgs("options_misc_alarmInt")
      .returns("Interval for alarms (if configured)");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("load", async () => {
    wrapper = await mount(Settings, options);
    vm = wrapper.vm;

    const initialOptions = {
      title: "History Delete",
      menu: {
        subheader: "Settings",
        group: [0, 1, 2],
        items: [
          {
            id: "wl",
            title: "Enable Whitelist",
            value: true
          },
          {
            id: "bl",
            title: "Enable blacklist",
            value: true
          },
          {
            id: "cw",
            title: "Enable current website remove",
            value: true
          }
        ]
      },
      action: {
        subheader: "Actions",
        group: [0, 2],
        items: [
          {
            id: "rhbInt",
            title: "Enable clearing blacklist on window close",
            value: true
          },
          {
            id: "rhaInt",
            title: "Enable Clearing Whitelist on Interval",
            value: false
          },
          {
            id: "enNot",
            title: "Enable Notification",
            value: true
          }
        ]
      },
      misc: {
        subheader: "Misc",
        items: [
          {
            id: "alarmInt",
            type: "slider",
            label: "Interval for alarms (if configured)",
            value: 4
          }
        ]
      }
    };

    expect(vm.storageCfg).to.deep.equal(initialStorage.menuCfg.cfg);
    expect(vm.options).to.deep.equal(initialOptions);

    const checks = wrapper.findAll("div[role='listitem']");
    const initialItems = [
      ...initialOptions.menu.items,
      ...initialOptions.action.items
    ];

    let check, items;

    [...Array(checks.length - 1).keys()].forEach(idx => {
      check = checks.at(idx);
      check.trigger("click");
      items = [...vm.options.menu.items, ...vm.options.action.items];
      expect(items[idx].value).to.equal(!initialItems[idx].value);

      check.trigger("click");
      items = [...vm.options.menu.items, ...vm.options.action.items];
      expect(items[idx].value).to.equal(initialItems[idx].value);
    });

    let buttons = wrapper.findAll("button.v-btn.v-btn--contained");
    const save = buttons.at(1);
    save.trigger("click");

    const storArgs = storage.set.args[0][0];
    const menuIds = vm.options.menu.items.map(item => item.id);
    const actionIds = vm.options.action.items.map(item => item.id);
    const miscIds = vm.options.misc.items.map(item => item.id);
    const saveKeys = [
      "whiteList",
      "blackList",
      "popupMenus",
      ...actionIds,
      ...miscIds
    ];
    let menus = menuIds.map(eachId => vm.storageCfg[eachId]);
    menus = [].concat(...menus);

    expect(storArgs).to.have.all.keys(saveKeys);
    expect(storArgs.popupMenus).to.deep.equal(menus);
    expect(storage.set).to.have.been.calledOnce;

    return true;
  }).timeout(15000);

  it("table", async () => {
    wrapper = await mount(Settings, options);
    vm = wrapper.vm;

    let childs,
      text = [],
      idx = 0;
    let buttons = wrapper.findAll("div.v-data-table__wrapper").wrappers;
    for (let button of buttons) {
      text[idx] = [];

      childs = button.findAll("div > table > tr > td.left").wrappers;

      childs.forEach(child => {
        text[idx].push(child.text());
      });
      idx++;
    }
    //TODO for some reason blacklist does not work.
    return expect(text[0], "whitelist").to.include.members(
      storageVals.whiteList
    );
  }).timeout(15000);

  it("deleteItem", async () => {
    wrapper = await shallowMount(Settings, options);
    vm = wrapper.vm;

    const windowConfirm = sandbox.stub().returns(false);
    const testItem = vm.bl.items[0];

    vm.deleteItem(testItem, "bl", windowConfirm);
    let expectItems = vm.bl.items.map(obj => obj.host);
    expect(expectItems).to.deep.equal(storageVals.blackList);

    windowConfirm.returns(true);

    let items = [...storageVals.blackList];
    items.splice(0, 1);

    vm.deleteItem(testItem, "bl", windowConfirm);
    expectItems = vm.bl.items.map(obj => obj.host);
    expect(expectItems).to.deep.equal(items);
  });

  it("removeList", async () => {
    wrapper = await shallowMount(Settings, options);
    vm = wrapper.vm;

    const groupArr = [...vm.options.menu.group];
    const menuItems = [...vm.options.menu.items];

    const windowConfirm = sandbox.stub();
    let expectItems, itemIdx;
    const testCases = ["bl", "wl"];

    for (let testCase of testCases) {
      windowConfirm.returns(false);
      await vm.removeList(testCase, windowConfirm);

      expect(vm.options.menu.items, "menu unchanged").to.deep.equal(menuItems);
      expect(vm.options.menu.group, "group unchanged").to.include.members(groupArr);
      expectItems = vm[testCase].items.map(obj => obj.host);
      expect(expectItems, "list unchanged").to.deep.equal(
        storageVals[testCase == "bl" ? "blackList" : "whiteList"]
      );

      windowConfirm.returns(true);
      await vm.removeList(testCase, windowConfirm);

      expect(vm[testCase].items, "list emptied").to.be.empty;
      //list removed from menu items
      expectItems = vm.options.menu.items.map(obj => obj.id);
      expect(expectItems, "menu list changes").to.not.have.members([testCase]);
      //group not having the menu item
      itemIdx = menuItems.map(obj => obj.id).indexOf(testCase);
      expect(vm.options.menu.group, "group arr changes").to.not.have.members(
        [itemIdx]
      );
    }
    return true;
  });

  it("miscMethods", async () => {
    const tabId = "tab_1";
    options.methods.removeList = sandbox.stub().returns(true);
    chrome.tabs.getCurrent.yields({ id: tabId });
    chrome.tabs.remove.yields(true);

    wrapper = await shallowMount(Settings, options);
    vm = wrapper.vm;

    const testValues = [
      {
        id: "wl",
        title: "Enable Whitelist",
        value: false
      },
      {
        id: "bl",
        title: "Enable blacklist",
        value: true
      },
      {
        id: "cw",
        title: "Enable current website remove",
        value: true
      }
    ];
    vm.watchOptions(testValues);

    expect(options.methods.removeList, "wl removes").calledWith("wl");
    options.methods.removeList.resetHistory();

    testValues[0].value = true;
    testValues[1].value = false;
    vm.watchOptions(testValues);

    expect(options.methods.removeList, "bl removes").calledWith("bl");
    options.methods.removeList.resetHistory();

    testValues[1].value = true;
    testValues[2].value = false;
    vm.watchOptions(testValues);

    expect(options.methods.removeList, "cw no removes").to.not.have.been.called;

    chrome.tabs.getCurrent.resetHistory();

    await vm.close();
    expect(chrome.tabs.getCurrent).calledOnce;
    expect(chrome.tabs.remove).calledWith(tabId);
    return true;
  });
});

import { use, expect, assert, should } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import proxyquire from "proxyquire";
import chrome from "sinon-chrome";
import chaiAsPromised from "chai-as-promised";

import * as hooks from "./globalhooks";

import Vue from "vue";
import Vuetify from "vuetify";

require("jsdom-global")();

Vue.config.silent = true;
Vue.use(Vuetify);


/* Use sinon-chai */
use(sinonChai);
use(chaiAsPromised);
should();

global.proxyquire = proxyquire;
global.sinon = sinon;
global.should = should;
global.assert = assert;
global.expect = expect;

export const fixChromeWebextensionPolyfill = () => {
  if (!chrome.runtime) chrome.runtime = {};
  if (!chrome.runtime.id) chrome.runtime.id = "history-delete";
};

fixChromeWebextensionPolyfill();
global.preChrome = chrome;
global.chrome = chrome;

global.hooks = hooks;

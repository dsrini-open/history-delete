<template>
<div id="app" v-show="pageReady">
  <v-app>
    <v-layout row>
    <v-flex md3>
      <v-card>
        <v-toolbar v-once>
          <v-toolbar-title>{{ menu.title }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <template v-for="item in menu.icons">
            <v-btn :key="item" icon @click="openPage(item.toString())">
              <v-icon medium>{{ item }}</v-icon>
            </v-btn>
          </template>
        </v-toolbar>
        <v-layout row justify-center v-show="popupVisible.form_rghd">
          <v-flex xs8>
            <v-radio-group id="form_rghd" v-model="rgHostDom.value" v-bind:disabled="!!rgHostDom.disabled" row>
              <v-radio color="orange darken-3" :label="rgHostDom.labels[0]" value="host" v-bind:disabled="!!rgHostDom.disabled"></v-radio>
              <v-radio color="orange darken-3" :label="rgHostDom.labels[1]" value="domain" v-bind:disabled="!!rgHostDom.disabled"></v-radio>
            </v-radio-group>
            <v-divider></v-divider>
          </v-flex>
        </v-layout>
        <v-list>
          <template v-for="(item, index) in menu.topItems">
            <v-divider :key="index" v-if="item.divider" :inset="item.inset"></v-divider>
            <v-list-item :key="item.id" v-else v-show="popupVisible[item.id]" @click="clickPopup(item.id)">
              <v-list-item-avatar v-if="item.icon">
                <v-icon v-if="!item.color"> {{ item.icon }}</v-icon>
                <v-icon v-else v-bind:color="item.color"> {{ item.icon }}</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title v-if="!binders[item.id]">{{ getTitle(item.id) }}</v-list-item-title>
                <v-list-item-title v-else>{{ binders[item.id] }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
  </v-app>
</div>
</template>

<script>
import browser from 'webextension-polyfill';
import * as storage from 'utils/storage';
import {isInStorageList} from 'utils/data';
import {getMessage, openPage, getActiveTab, getDomainHost} from 'utils/common';
import _ from 'lodash';

export default {

  data: function() {

    return {
      pageReady: false,
      domainHost: {},
      rgHostDom: { value: "host", disabled: false, labels: [this.getTitle('rghd_host'), this.getTitle('rghd_dom')] },
      popupVisible: {
        form_rghd: true,
        rha: true,
        rhb: true,
        rhc: true,
        aw: true,
        ab: true,
        rw: false,
        rb: false
      },
      binders : {
        rhc : ' '
      },
      menu: {
        title: getMessage('extensionName'),
        icons: ['settings'],
        topItems: [
          { id: 'aw', icon: 'add_circle'},
          { id: 'rw', icon: 'remove_circle'},
          { id: 'ab', icon: 'add_circle_outline'},
          { id: 'rb', icon: 'remove_circle_outline'},
          { divider: true, inset: true },
          { id: 'rhc', icon: 'delete', color: 'red darken-2' },
          { id: 'rha', icon: 'delete', color: 'white darken-2' },
          { id: 'rhb', icon: 'delete', color: 'grey darken-2' }
        ]
      }
    }
  },

  methods: {
    getMessage,

    openPage,

    getTitle: function(id) {
      return getMessage(`popup_${id}`);
    },

    clickPopup: function(id, win  = window) {
      const site = this.domainHost[this.rgHostDom.value];
      browser.runtime.sendMessage({id, sender: 'action', site: site});
      win.close();
    }
  },

  created: async function() {
    const options = await storage.get(['popupMenus']);

    // Show only menus that are configured
    _.each(this.popupVisible, (value, key) => {
      if(key !== 'form_rghd')
        _.set(this.popupVisible, key, _.includes(options.popupMenus, key));
    });

    const tab = await getActiveTab();
    // eslint-disable-next-line prefer-destructuring
    const url = tab.url;
    const domainHost = getDomainHost(url);
    const isValidPage = !_.isEmpty(domainHost.host);

    this.domainHost = domainHost;

    if(isValidPage) {
      let property = 'rhc';

      if(this.popupVisible[property]){
        this.binders[property] = getMessage(`popup_${property}`, domainHost.host);
      }

      let isBlackListUrl = { domain: false, host: false };
      let isWhiteListUrl = { domain: false, host: false };

      // Configure menus based on which type an url is
      property = 'aw';
      if(this.popupVisible[property]) {
        isWhiteListUrl = { domain: await isInStorageList("whiteList", domainHost.domain), host: await isInStorageList("whiteList", domainHost.host) };
        if(isWhiteListUrl.domain || isWhiteListUrl.host) {
          this.rgHostDom.value = isWhiteListUrl.host ? "host" : "domain";
          this.rgHostDom.disabled = true;
          this.popupVisible.aw = false;
          this.popupVisible.rw = true;
        }
      }

      property = 'ab';
      if(this.popupVisible[property]) {
        isBlackListUrl = { domain: await isInStorageList("blackList", domainHost.domain), host: await isInStorageList("blackList", domainHost.host) };
        if(isBlackListUrl.domain || isBlackListUrl.host) {
          this.rgHostDom.value = isBlackListUrl.host ? "host" : "domain";
          this.rgHostDom.disabled = true;
          this.popupVisible.ab = false;
          this.popupVisible.rb = true;
        }
      }
    } else {
      this.popupVisible = _.mapValues(this.popupVisible, function() { return false; });
      this.popupVisible.rha = true;
      this.popupVisible.rhb = true;
    }

    if(domainHost.host === domainHost.domain)
      this.popupVisible.form_rghd = false;

    this.pageReady = true;
  }
};
</script>

<style lang="scss">
$bg-color: #F57C00;

/* Vuetify hacks to display custom font, color */
.v-application {
  font-family: 'Noto Sans', sans-serif;
  line-height: 1.5;
}

.v-list-item:hover  {
  background-color: $bg-color !important;
}

.radio-group{
  padding: 5px 0px 5px 0px;
}

body,
#app {
  height: 100%;
}

#app {
  display: flex;
  flex-direction: column;
}

body {
  margin: 0;
  min-width: 342px;
  overflow: hidden;
  font-size: 100%;
}
</style>

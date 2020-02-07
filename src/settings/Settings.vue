<template>
<div id="app" v-show="pageReady">
  <v-app>
    <v-layout row>
      <v-flex md10 offset-md1>
        <v-card>
          <v-toolbar>
            <v-toolbar-title>{{ options.title }}</v-toolbar-title>
          </v-toolbar>
          <v-list rounded v-if="options.menu" v-bind:subheader="!!options.menu.subheader">
            <v-subheader v-if="options.menu.subheader">{{ options.menu.subheader }}</v-subheader>
            <v-list-item-group v-model="options.menu.group" multiple>
              <template v-for="(item, index) in options.menu.items">
                <v-list-item :key="`menu_${index}`" @click="toggleCheck(index, 'menu')">
                  <template v-slot:default="{ }">
                    <v-list-item-action>
                      <v-checkbox v-bind:id="item.id" v-model="item.value"></v-checkbox>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item-content>
                  </template>
                </v-list-item>
              </template>
            </v-list-item-group>
          </v-list>
          <v-list rounded v-if="options.action" v-bind:subheader="!!options.action.subheader">
            <v-subheader v-if="options.action.subheader">{{ options.action.subheader }}</v-subheader>
            <v-list-item-group v-model="options.action.group" multiple>
              <template v-for="(item, index) in options.action.items">
                <v-list-item :key="`action_${index}`" @click="toggleCheck(index, 'action')">
                  <template v-slot:default="{ }">
                    <v-list-item-action>
                      <v-checkbox v-bind:id="item.id" v-model="item.value"></v-checkbox>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item-content>
                </template>
                </v-list-item>
              </template>
            </v-list-item-group>
          </v-list>
          <v-list v-if="options.misc" v-bind:subheader="!!options.misc.subheader">
              <v-subheader v-if="options.misc.subheader">{{ options.misc.subheader }}</v-subheader>
              <v-list-item>
              <template v-for="(item, index) in options.misc.items">
                <v-slider v-if="item.type === 'slider'"
                    :key="index"
                    v-bind:id="item.id"
                    v-model="item.value"
                    :max="23"
                    :min="1"
                    class="align-center"
                    thumb-label
                    :label="item.label"
                  />
              </template>
            </v-list-item>
          </v-list>
        </v-card>
        <v-container fluid>
          <v-layout row>
            <v-flex md4 offset-md1>
              <v-subheader class="black white--text">{{ wl.title }}</v-subheader>
              <v-card light>
                <v-data-table
                  light
                  :header="wl.headers"
                  :items="wl.items"
                  hide-default-footer
                  class="elevation-1">
                  <template v-slot:body="{ items }">
                    <template v-for="(item, index) in items">
                      <tr :key="index">
                        <td class="left">{{ item.host }}</td>
                        <td class="right">
                          <v-btn icon class="mx-0" @click="deleteItem(item, wl.id)">
                            <v-icon color="red darken-2">delete</v-icon>
                          </v-btn>
                        </td>
                      </tr>
                    </template>
                  </template>
                  <template v-slot:no-data>
                    No data to display
                  </template>
                </v-data-table>
              </v-card>
            </v-flex>
            <v-flex md4 offset-md1>
              <v-subheader class="black white--text">{{ bl.title }}</v-subheader>
              <v-card>
                <v-data-table
                  :header="bl.headers"
                  :items="bl.items"
                  hide-default-footer
                  class="elevation-1">
                  <template v-slot:body="{ items }">
                    <template v-for="(item, index) in items">
                      <tr :key="index">
                        <td class="left">{{ item.host }}</td>
                        <td class="right">
                          <v-btn icon class="mx-0" @click="deleteItem(item, bl.id)">
                            <v-icon color="red darken-2">delete</v-icon>
                          </v-btn>
                        </td>
                      </tr>
                    </template>
                  </template>
                  <template v-slot:no-data>
                    No data to display
                  </template>
                </v-data-table>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>

        <div class="text-center">
          <v-btn rounded color="teal" @click="close()">
            <v-icon left>close</v-icon>
            {{ getOptionMsg('close', 'btn') }}
          </v-btn>
          <v-btn rounded color="teal" @click="saveChanges()">
            <v-icon left>save</v-icon>
            {{ getOptionMsg('save', 'btn') }}
          </v-btn>
        </div>

      </v-flex>
    </v-layout>
  </v-app>
</div>
</template>

<script>
import browser from 'webextension-polyfill';
import * as storage from 'utils/storage';
import { getMessage } from 'utils/common';
import _ from 'lodash';

export default {

  data: function(){

    return {
      storageCfg :{},
      options: {
        title: this.getOptionMsg('ext', 'title'),
        menu: {
          subheader: this.getOptionMsg('header'),
          items: [],
          group: []
        },
        action: {
          subheader: this.getOptionMsg('header', 'action'),
          items: [],
          group: []
        },
        misc: {
          subheader: this.getOptionMsg('header', 'misc'),
          items: []
        }
      },
      wl: {
        id: "wl",
        title: this.getOptionMsg('wl', 'title'),
        headers: [
          {
            text: this.getOptionMsg('header1', 'table'),
            value: 'host',
            align: 'left',
            sortable: true,
          },
          {
            text: this.getOptionMsg('header2', 'table'),
            align: 'center',
            sortable: false
          }
        ],
        items: []
      },
      bl: {
        id: "bl",
        title: this.getOptionMsg('bl', 'title'),
        headers: [
          {
            text: this.getOptionMsg('header1', 'table'),
            value: 'host',
            align: 'left',
            sortable: true,
          },
          {
            text: this.getOptionMsg('header2', 'table'),
            align: 'center',
            sortable: false
          }
        ],
        items: []
      },
      pageReady: false,
    }
  },

  methods: {
    getMessage,

    getOptionMsg: function(id, path = 'menu') {
      return getMessage(`options_${path}_${id}`);
    },

    deleteItem: function(item, id, confirmDial = window.confirm) {
      const index = this[id].items.indexOf(item);
      // eslint-disable-next-line no-unused-expressions
      confirmDial( this.getOptionMsg('removeEntry','warn') ) && this[id].items.splice(index, 1);
    },

    toggleCheck: function(id, path) {
      this.options[path].items[id].value = !this.options[path].items[id].value;
    },

    removeList: function(id, confirmDial = window.confirm) {
      if(confirmDial(this.getOptionMsg(id ,'warn_remove'))) {
        this[id].items.splice(0);
      } else {
        const [item] = _.filter(this.options.menu.items, {"id": id});
        item.value = true;
        const idx = this.options.menu.items.findIndex(obj => obj.id === id);
        const arr = this.options.menu.group;
        arr.push(idx);
        this.$set(this.options.menu, 'group', arr);
      }
    },

    watchOptions : function(cbValues) {
      const items = _.filter(cbValues, {value: false});

      _.each(items, (eachItem) => {
        if(this[eachItem.id] && this[eachItem.id].items.length > 0)
          this.removeList(eachItem.id);
      });
    },

    close : async function() {
      const tab  = await browser.tabs.getCurrent();
      browser.tabs.remove(tab.id);
    },

    saveChanges: async function() {
      const constKeys = ["action", "misc"];
      const saveObj = {};
      saveObj.whiteList = _.map(this.wl.items, "host");
      saveObj.blackList = _.map(this.bl.items, "host");

      let popupMenus = [];
      const optionItemsArr = _.map(_.filter(this.options.menu.items, {value: true}), "id");
      _.each(optionItemsArr, (key) => {
        popupMenus = _.concat(popupMenus, this.storageCfg[key]);
      });
      saveObj.popupMenus = popupMenus;

      // loop through action, misc items
      constKeys.forEach(key => {
        this.options[key].items.forEach(item => {
          saveObj[item.id] =  item.value;
        });
      });

      await storage.set(saveObj);
      this.close();
      browser.runtime.sendMessage({sender: 'settings'});
    }
  },

  created: async function() {
    const storageVals = await storage.getAll();

    document.title = this.options.title;

    // Generate options from the storage values
    _.each(storageVals.menuCfg.options, (key) => {
      this.options.menu.items.push({
        id: key,
        title: this.getOptionMsg(key),
        value: _.difference(storageVals.menuCfg.cfg[key], storageVals.popupMenus).length === 0
      });
    });
    _.each(storageVals.menuCfg.actions, (key) => {
      this.options.action.items.push({
        id: key,
        title: this.getOptionMsg(key, 'action'),
        value: storageVals[key]
      });
    });
    _.each(storageVals.menuCfg.misc, (key) => {
      this.options.misc.items.push({
        type: key === 'alarmInt' ? "slider" : '',
        id: key,
        label: this.getOptionMsg(key, 'misc'),
        value: storageVals[key]
      });
    });
    _.each(storageVals.whiteList, (key) => {
      this.wl.items.push({ host: key });
    });
    _.each(storageVals.blackList, (key) => {
      this.bl.items.push({ host: key });
    });
    // generate group array keys from values present
    let group = [];
    this.options.menu.items.forEach((obj, idx) => {
      if(obj.value === true) group.push(idx);
    });
    this.options.menu.group = group;
    group = [];
    this.options.action.items.forEach((obj, idx) => {
      if(obj.value === true) group.push(idx);
    });
    this.options.action.group = group;

    this.storageCfg = storageVals.menuCfg.cfg;
    this.pageReady = true;
    this.$watch('options.menu.items', this.watchOptions , { deep: true });
  }
};
</script>

<style lang="scss" rel="stylesheet/scss">
$bg-color: #F57C00;

/* Vuetify hacks to display custom font, color */
.v-application {
  font-family: 'Noto Sans', sans-serif;
  line-height: 1.5;
}

.v-list-item:hover {
  background-color: $bg-color !important;
}

/* Vuetify hack for table overflow */
table {
  display: block;
  height: 300px;
  overflow: auto;
}

thead, tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.v-data-table td.left {
  width: 80%;
}
.v-data-table td.right {
  width: 20%;
}
</style>

<template>
<div id="app" v-show="pageReady">
  <v-app dark>
    <v-layout row>
      <v-flex md10 offset-md1>
        <v-card>
          <v-toolbar>
            <v-toolbar-title>{{ options.title }}</v-toolbar-title>
          </v-toolbar>
          <v-list v-if="options.menu" v-bind:subheader="!!options.menu.subheader">
            <v-subheader v-if="options.menu.subheader">{{ options.menu.subheader }}</v-subheader>
            <template v-for="(item, index) in options.menu.items">
              <v-list-tile>
                <v-list-tile-action>
                  <v-checkbox id="item.id" v-model="item.value"></v-checkbox>
                </v-list-tile-action>
                <v-list-tile-content @click="toggleCheck(index, 'menu')">
                  <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
          <v-list v-if="options.action" v-bind:subheader="!!options.action.subheader">
            <v-subheader v-if="options.action.subheader">{{ options.action.subheader }}</v-subheader>
            <template v-for="(item, index) in options.action.items">
              <v-list-tile>
                <v-list-tile-action>
                  <v-checkbox id="item.id" v-model="item.value"></v-checkbox>
                </v-list-tile-action>
                <v-list-tile-content @click="toggleCheck(index, 'action')">
                  <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </v-card>
        <v-container fluid>
          <v-layout row>
            <v-flex md4 offset-md1>
              <v-subheader class="black white--text">{{ wl.title }}</v-subheader>
              <v-card light>
                <v-data-table
                  light
                  :headers="wl.headers"
                  :items="wl.items"
                  hide-actions
                  class="elevation-1">
                  <template slot="items" slot-scope="props">
                    <td>{{ props.item.host }}</td>
                    <td class="justify-center layout px-0">
                      <v-btn icon class="mx-0" @click="deleteItem(props.item, wl.id)">
                        <v-icon color="red darken-2">delete</v-icon>
                      </v-btn>
                    </td>
                  </template>
                  <template slot="no-data">
                    No data to display
                  </template>
                </v-data-table>
              </v-card>
            </v-flex>
            <v-flex md4 offset-md1>
              <v-subheader class="black white--text">{{ bl.title }}</v-subheader>
              <v-card>
                <v-data-table
                  :headers="bl.headers"
                  :items="bl.items"
                  hide-actions
                  class="elevation-1">
                  <template slot="items" slot-scope="props">
                    <td>{{ props.item.host }}</td>
                    <td class="justify-center layout px-0">
                      <v-btn icon class="mx-0" @click="deleteItem(props.item, bl.id)">
                        <v-icon color="red darken-2">delete</v-icon>
                      </v-btn>
                    </td>
                  </template>
                  <template slot="no-data">
                    No data to display
                  </template>
                </v-data-table>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>

        <div class="text-xs-center">
          <v-btn round color="teal" @click="close()">
            <v-icon left>close</v-icon>
            {{ getOptionMsg('close', 'btn') }}
          </v-btn>
          <v-btn round color="teal" @click="saveChanges()">
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
import storage from 'utils/storage';
import {isInStorageList} from 'utils/data';
import {getMessage, getActiveTab, getDomain} from 'utils/common';
import _ from 'lodash';

export default {

  data: function(){

    return {
      storageCfg :{},
      options: {
        title: this.getOptionMsg('ext', 'title'),
        menu: {
          subheader: this.getOptionMsg('header'),
          items: []
        },
        action: {
          subheader: this.getOptionMsg('header', 'action'),
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
      return getMessage('options_' + path + '_' + id);
    },

    deleteItem: function(item, id) {
      const index = this[id].items.indexOf(item);
      confirm( this.getOptionMsg('removeEntry','warn') ) &&  this[id].items.splice(index, 1);
    },

    toggleCheck: function(id, path) {
      this.options[path].items[id].value = !this.options[path].items[id].value;
    },

    removeList: function(id) {
      if(confirm(this.getOptionMsg(id ,'warn_remove'))) {
        this[id].items.splice(0);
      } else {
        const [item] = _.filter(this.options.menu.items, {"id": id});
        item.value = true;
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
      let tab  = await browser.tabs.getCurrent();
      browser.tabs.remove(tab.id);
    },

    saveChanges: async function() {
      let saveObj = {};
      saveObj.whiteList = _.map(this.wl.items, "host");
      saveObj.blackList = _.map(this.bl.items, "host");

      let popupMenus = [];
      const optionItemsArr = _.map(_.filter(this.options.menu.items, {value: true}), "id");
      _.each(optionItemsArr, (key) => {
        popupMenus = _.concat(popupMenus, this.storageCfg[key]);
      });
      saveObj.popupMenus = popupMenus;

      _.each(this.options.action.items, (item) => {
        saveObj[item.id] =  item.value;
      });

      await storage.set(saveObj);
      this.close();
      browser.runtime.sendMessage({sender: 'settings'});
    }
  },

  created: async function() {
    const storageVals = await storage.getAll();

    //Generate options from the storage values
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
    _.each(storageVals.whiteList, (key) => {
      this.wl.items.push({ host: key });
    });
    _.each(storageVals.blackList, (key) => {
      this.bl.items.push({ host: key });
    });

    this.storageCfg = storageVals.menuCfg.cfg;
    this.pageReady = true;
    this.$watch('options.menu.items', this.watchOptions , { deep: true });
  }
};
</script>

<style lang="scss">

/* Vuetify hacks to display custom font, color */
.application {
  font-family: 'Noto Sans', sans-serif;
  line-height: 1.5;
}

.list__tile:hover {
  background-color: #F57C00 !important;
}

/* Vuetify hack for table overflow */
tbody {
  display: block;
  height: 300px;
  overflow: auto;
}

thead, tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}
</style>

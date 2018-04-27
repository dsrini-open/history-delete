import Vue from 'vue';
import Vuetify from 'vuetify';

import 'vuetify/dist/vuetify.min.css';

import Settings from './Settings';

async function init() {
  try {
      await document.fonts.load('400 14px Noto Sans');
    } catch (e) {}

  Vue.use(Vuetify);
  const vm = new Vue({
    el: '#app',
    render: h => h(Settings)
  });
}

init();

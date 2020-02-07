import Vue from "vue";
import Vuetify from "vuetify";
import vuetify from "vue/vuetify";
import "vuetify/dist/vuetify.min.css";

import Settings from "./Settings.vue";

async function init() {
  try {
    await document.fonts.load("400 14px Noto Sans");
  } catch (e) {
    /* continue regardless of error */
  }

  Vue.use(Vuetify);

  // eslint-disable-next-line no-unused-vars
  const vm = new Vue({
    vuetify,
    render: h => h(Settings)
  }).$mount("#app");
}

init();

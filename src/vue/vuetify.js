import Vuetify from "vuetify";
import colors from "vuetify/lib/util/colors";
// import '@mdi/font/css/materialdesignicons.css';

const opts = {
  theme: {
    themes: {
      dark: {
        primary: colors.blue.lighten1,
        secondary: colors.teal.lighten1,
        accent: colors.blue.accent1,
        error: colors.red.darken1
      }
    },
    dark: true
  },
  icons: {
    iconfont: "md"
  }
};

/*
Vue.use(Vuetify);
Vue.prototype.$vuetify.theme = opts.theme.themes.dark;
*/

export default new Vuetify(opts);

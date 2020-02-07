import Vuetify from "vuetify";

const colors = {
  blue: {
    lighten1: "#42A5F5",
    accent1: "#82B1FF"
  },
  teal: {
    lighten1: "#26A69A"
  },
  red: {
    darken1: "#E53935"
  }
};

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
  }
};

export default new Vuetify(opts);

import PopupManager from "./popup-manager.js";

export default {
  created() {
    console.log("created");
  },

  beforeMount() {
    console.log("beforeMount");
  },

  beforeDestroy() {
    console.log("beforeDestroy");
  },

  props: {
    value: {
      type: Boolean,
      default: false
    }
  },

  watch: {
    value(val) {
      if (val) {
        this.open();
      } else {
        this.close();
      }
    }
  },

  methods: {
    open() {
      PopupManager.openModal();
    },

    close() {
      PopupManager.closeModal();
    }
  }
};

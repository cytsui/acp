import Vue from "vue";
import msgboxVue from "./index.vue";

var instance;
var MessageBoxConstructor = Vue.extend(msgboxVue);

var MessageBox = function(options) {
  if (!instance) {
    initInstance();
  }

  // 合并props
  instance["message"] = options.message;
  instance["html"] = options.html;

  document.body.appendChild(instance.$el);
  instance.value = true;
};

var initInstance = function() {
  instance = new MessageBoxConstructor({
    el: document.createElement("div")
  });
};

export default MessageBox;

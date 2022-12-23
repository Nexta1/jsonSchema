import Vue from "vue";
import App from "./App.vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import JsonSchema from "@nexta1/json-schema";
import "@nexta1/json-schema/json-schema.css";
Vue.use(ElementUI);
Vue.use(JsonSchema);
Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount("#app");

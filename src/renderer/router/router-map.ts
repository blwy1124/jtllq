import { RouteRecordRaw } from "vue-router";

// 定义路由规则
const routeMap: Array<RouteRecordRaw> = [
  {
    path: "/primary",
    name: "primary",
    component: () => import("@views/primary.vue"),
  },
  {
    path: "/webview",
    name: "webview",
    component: () => import("@views/webview.vue"),
  },
  {
    path: "/frameless-sample",
    name: "frameless-sample",
    component: () => import("@views/frameless-sample.vue"),
  },
  {
    path: "/printPreview",
    name: "printPreview",
    component: () => import("@views/print/printPreview.vue"),
  },
  {
    path: "/print",
    name: "print",
    component: () => import("@views/print/print.vue"),
  }
];

export default routeMap;
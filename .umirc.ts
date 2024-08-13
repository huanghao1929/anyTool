import { defineConfig } from '@umijs/max';
import routers from '@/routers'
export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '工具库',
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
    },
    {
      name: '关键字查询',
      path: '/keyWordsQuery',
      component: './KeyWordsQuery',
    },
    {
      name: '文件上传并解析',
      path: '/parseUploadFile',
      component: './ParseUploadFile',
    },
  ],
  npmClient: 'npm',
});

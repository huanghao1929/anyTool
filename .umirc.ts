import { defineConfig } from '@umijs/max';
import routers from '@/routers'
export default defineConfig({
  alias: {
    '@': require('path').resolve(__dirname, 'src'),
  },
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
      name: '生成捐赠排序表',
      path: '/donateMoney',
      component: './DonateMoney',
    },
    {
      name: '腾讯一起捐数据审查',
      path: '/checkDonateMoney',
      component: './CheckDonateMoney',
    },
    {
      name: '线性规划',
      path: '/lpSolver',
      component: './LpSolver',
    },
    {
      name: '文件上传并解析',
      path: '/parseUploadFile',
      component: './ParseUploadFile',
    },
  ],
  npmClient: 'npm',
});

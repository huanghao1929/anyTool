const routers = [
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
    component: './keyWordsQuery',
  },
];

export default routers;

export default defineAppConfig({
  pages: [
    'pages/inventory/inventory',
    'pages/profile/profile',
    'pages/login/login',
    'pages/index/index',
    'pages/setting/setting',
    'pages/register/register',
    'pages/collaboration/collaboration',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999',
    selectedColor: '#506cf6',
    backgroundColor: '#fff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: '/assets/icons/home.png',
        selectedIconPath: '/assets/icons/home-active.png'
      },
      {
        pagePath: 'pages/inventory/inventory',
        text: '库存',
        iconPath: '/assets/icons/inventory.png',
        selectedIconPath: '/assets/icons/inventory-active.png'
      },
      {
        pagePath: 'pages/collaboration/collaboration',
        text: '协作',
        iconPath: '/assets/icons/collaboration.png',
        selectedIconPath: '/assets/icons/collaboration-active.png'
      },
      {
        pagePath: 'pages/profile/profile',
        text: '我的',
        iconPath: '/assets/icons/profile.png',
        selectedIconPath: '/assets/icons/profile-active.png'
      }
    ]
  }
})

export default defineAppConfig({
    pages: [
    'pages/profile/profile',
    'pages/login/login',
    'pages/inventory/inventory',
    'pages/inventory-detail/inventory-detail',
    'pages/inventory-edit/inventory-edit',
    'pages/inventory-record/inventory-record',
    'pages/index/index',
    'pages/setting/setting',
    'pages/register/register',
    'pages/collaboration/collaboration',
    'pages/laboratory/laboratory',
    'pages/create-lab/create-lab',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#F0F5FA',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#2F4F4F',
    selectedColor: '#1E90FF',
    backgroundColor: '#F0F5FA',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: './assets/icons/home.png',
        selectedIconPath: './assets/icons/home-active.png'
      },
      {
        pagePath: 'pages/inventory/inventory',
        text: '库存',
        iconPath: './assets/icons/inventory.png',
        selectedIconPath: './assets/icons/inventory-active.png'
      },
      {
        pagePath: 'pages/collaboration/collaboration',
        text: '协作',
        iconPath: './assets/icons/collaboration.png',
        selectedIconPath: './assets/icons/collaboration-active.png'
      },
      {
        pagePath: 'pages/profile/profile',
        text: '我的',
        iconPath: './assets/icons/profile.png',
        selectedIconPath: './assets/icons/profile-active.png'
      }
    ]
  }
})

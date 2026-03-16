export default defineAppConfig({
    pages: [
    'pages/index/index',
    'pages/profile/login/login',
    'pages/ai-chat/ai-chat',
    'pages/profile/profile',
    'pages/profile/register/register',
    'pages/profile/setting/setting',
    'pages/profile/laboratory/laboratory',
    'pages/profile/create-lab/create-lab',
    'pages/inventory/inventory',
    'pages/inventory/inventory-detail/inventory-detail',
    'pages/inventory/inventory-edit/inventory-edit',
    'pages/inventory/inventory-record/inventory-record',
    'pages/collaboration/collaboration',
    'pages/experiment-plan/experiment-plan'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#F0F5FA',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  plugins: {
    WechatSI: {
      version: 'latest',
      provider: process.env.TARO_APP_ID || 'wx069ba97219f66d99'
    }
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
        pagePath: 'pages/ai-chat/ai-chat',
        text: 'AI助手',
        iconPath: './assets/icons/robot-3-line.png',
        selectedIconPath: './assets/icons/robot-3-line-active.png'
      },
      {
        pagePath: 'pages/collaboration/collaboration',
        text: '计划',
        iconPath: './assets/icons/plan.png',
        selectedIconPath: './assets/icons/plan-active.png'
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

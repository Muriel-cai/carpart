//index.js
//获取应用实例
const app = getApp()

Page({
  data: { 
  },
  onLoad: function (options) {
    let self = this;
    wx.setNavigationBarTitle({ title: '车损拍照示例' });
  },
  //确认车型
  getSure: function() {
    wx.navigateTo({
      url: '../carlist/index',
    });
  },
})

//   getUserInfo: function(e) {
//     console.log(e)
//     app.globalData.userInfo = e.detail.userInfo
//     this.setData({
//       userInfo: e.detail.userInfo,
//       hasUserInfo: true
//     })
//   }
// })

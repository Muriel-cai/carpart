//app.js
App({
  onLaunch: function () {
    var self = this;
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log(res,"登录");
        wx.request({
          url: 'https://reco.lpcknew.com:8072/ai/wx/getOpenId',
          data: { code: res.code },
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },// 设置请求的 header
          success: function (res) {
            var msg = JSON.parse(res.data.msg);
            // console.log(this, "-------", self);
            self.globalData.openid = msg.openid;
          },
          fail: function () {
            console.log("index.js wx.request CheckCallUser fail");
          },
          complete: function () {

            // complete
          }
        })
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
       
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    // carCode: "1195274873585405952",
    // caseId: 45,
    // modelId: "71416",
    // openid: "ouxls5ePFoxV8iec1G8mzJLt8Sf8",
    // vin: "LGBF1CE018R226548"
    openid:'',
    caseId: '',
    vin:'',
    carCode:'',
    modelId:''
  }
})
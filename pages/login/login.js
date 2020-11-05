//index.js
const WXAPI = require('../../config')
import Toast from '../../dist/toast/toast';
import Dialog from '../../dist/dialog/dialog';
//获取应用实例
const app = getApp()

Page({
  data: {
    bgPic: '../../img/login_bg.png',
    type: '0',
    username: '',
    password: ''
  },
  onLoad: function () {


  },
  //事件处理函数
  onChange: function (event) {
    // console.log(event)
    this.setData({
      username: event.detail.value
    })
  },
  onChange1: function (event) {
    // console.log(event)
    this.setData({
      username: event.detail.value
    })
  },
  onChangePw: function (event) {
    let self = this;
    // console.log(event)
    this.setData({
      password: event.detail
    })
  },

  //登录
  login: function () {
    let data = {
      "username": this.data.username,
      "password": this.data.password
    }
    // console.log(data, '++++++++++++')
    WXAPI.request('POST', '/login', data, (res) => {
      // alert(res.code, "++++++++++");
      if (res.status == 200) {
        wx.setStorage({
          "key": 'accessToken',
          "data": res.accessToken
        });
        wx.navigateTo({
          url: '../feeList/feeList'
        });
      } else {
        wx.showToast({
          title: res.msg,
          icon: 'none',
          duration: 2000
        })
      }
    }, (err) => {
      console.log(err)
    }, () => {
      console.log('next')
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    wx.hideLoading()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }

})
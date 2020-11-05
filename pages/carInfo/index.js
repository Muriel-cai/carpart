//index.js
//获取应用实例
import WXAPI from "../../config.js";
import Toast from '../../dist/toast/toast';
const app = getApp()

Page({
  data: {   
    vin:'', 
    type:'',
    carCode:'',
    modelId:'',
    carPic:'../../img/brandPic.png',
    text:'',
    pp:'',
    carBrand:'',
    carYear:'',
    carGgh:'',
    carType:'',
    gearbox:'',
    carStructure:'',
    hasDone: false,
    caseId:''
    
  },
  onLoad: function (options) {
    let self = this;
    wx.setNavigationBarTitle({ title: '车辆信息' });
    self.setData({
      pp: options.pp,
      carBrand: options.carBrand,
      carYear: options.carYear,
      carGgh: options.carGgh,
      carType: options.carType,
      gearbox: options.gearbox,
      caseId:options.caseId,
      modelId:options.modelId
    });
    wx.showShareMenu({
      withShareTicket: true
    })
    
   

  },
  //确认车型
  getSure: function() {
    let self = this;
    wx.redirectTo({
      url: '../carpic/index?caseId='+this.data.caseId+'&modelId='+this.data.modelId,
    });
  }
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

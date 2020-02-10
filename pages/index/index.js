//index.js
const WXAPI = require('../../config')
import Toast from '../../dist/toast/toast';
import Dialog from '../../dist/dialog/dialog';
//获取应用实例
const app = getApp()

Page({
  data: {    
    bgPic:'../../img/img_bg.png',
    num:0,
    type:'0',
    value :'',
    carCode:'',
    imgData: [],
    openId:'',
    caseId:'',
    searchText:'请输入17位车架号码',
    hasDone:false,
    isOk: false,
    show:false,
    identity: [
      {
        text: 'VIN码',
        static: true
      }     
    ],
  
  },
  onLoad:function(){
    let self = this;   
    this.setData({
      openId: app.globalData.openid,
      value:''
    });
  },
  //展示行驶证范例
  showPermit:function(){
    let self = this;
    this.setData({ show: true });
  },
  onClose() {
    this.setData({ show: false });
  },
  //事件处理函数
    haschoise: function(e) {     
      let self = this;   
      let index = e.currentTarget.dataset.index;
      console.log(index ,this.data.num);
      this.data.num = index;
      this.setData({
        num: index       
      });
      if (index == 0){
        this.setData({
          searchText: '请输入17位车架号码',
          value:''
        });
      } else{
        this.setData({
          searchText: '请输入车型名称',
          value: ''
        });
        
      }       
    },
  onChange: function (e) {
    let self = this;
    // console.log(e, "onChange", e.detail);
    self.setData({
      value: e.detail.replace(/\s+/g, ""),
      type:'1'
    });
    
  },
  
 
  uploadPhoto(e) {
    var self = this;  
    self.setData({show:false})  
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
       
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths; // 返回选定照片的本地路径列表 
        // self.upload(self, tempFilePaths);
        console.log('本地图片的路径:'+ tempFilePaths)
        // this.upload(that, tempFilePaths)
        for (let i = 0; i < tempFilePaths.length; i++) {
          self.upload(tempFilePaths[i]);
          console.log('本地图片的路径:' + tempFilePaths[i])
        }
      }
    })
  },
  // 上传图片
  upload:function( path) {
    let self = this;
    self.setData({
      openId: app.globalData.openid
    });
    var timer = setInterval(() => {
      if (self.data.hasDone) {
        clearInterval(timer);
        Toast.clear();

      } else {
        console.log(self.data.value)
        Toast.loading({
          mask: false,
          message: '正在解析中，请稍等！'
        });
      }
    }, 200);
    let param ={ openid: self.data.openId};
    WXAPI.uploadImage('/ai/recogn/queryByDrivingLicense', path, param, (res) => {
      console.log(res);
      var res = JSON.parse(res.data);
      self.setData({
        hasDone: true
      })
      console.log('上传成功返回的数据', res.data, res.status);
      if (res.status == 200) {
        self.setData({
          value: res.data.vin,
          carCode: res.data.carcode,
          caseId: res.data.caseId,
          type: '0'
        });
        app.globalData.caseId = res.data.caseId;
        app.globalData.vin = self.data.value;
        app.globalData.carCode = res.data.carcode;
      } else {
        self.setData({
          hasDone: true
        });
        wx.showModal({
          title: '提示',
          content: '解析失败',
          showCancel: false
        })
        return;
      }
    }, (err) => {
      console.log(err,"_____________");
      self.setData({
        hasDone: false
      });
      wx.showModal({
        title: '提示',
        content: '上传失败',
        showCancel: false
      })
    }, () => {
      console.log('next');
      // self.judgeVin();
      wx.hideToast(); //隐藏Toast
    })
   
  },
  // 判断VIN 是否有效
  judgeVin:function(){
    let self = this;
    console.log('1122222332')
    let data = {
      "vin": self.data.value,
      'type': self.data.type,
      'openid': app.globalData.openid,
      'caseId': app.globalData.caseId
    };
    var timer1 = setInterval(() => {
      if (self.data.isOk) {
        clearInterval(timer1);
        Toast.clear();

      } else {
        Toast.loading({
          mask: false,
          message: '正在查询中，请稍等！'
        });
      }
    }, 200);
    WXAPI.request('POST', '/ai/vin/queryModelInfo', data, (res) => {
      // console.log(res.data, "-------");
      self.setData({
        isOk: true
      });
      if (res.status == 200) {
        var data = res.data;
        app.globalData.caseId = data.caseId;
        app.globalData.modelId = data.modelId;
        app.globalData.carCode = data.carcode;
        wx.navigateTo({
          url: '../carInfo/index?pp=' + data.pp + '&carBrand=' + data.cx + '&carYear=' + data.nk + '&carGgh=' + data.gongGao + '&carType=' + data.sellVersion + '&gearbox=' + data.gearBox
        })
      } else {
        self.setData({
          isOk: true
        });
        wx.showModal({
          
          title: '提示',
          content: 'VIN码解析失败！',
          showCancel: false
        })
      
      }
    }, (err) => {
      console.log(err);
      wx.showModal({
        title: '提示',
        content: '解析失败！',
        showCancel: false
      })
      
    }, () => {
      console.log('next');
     
    })
  },
  // 获取查询信息跳转至车辆信息页面
  toCarInfo:function(){
    let self = this;
    var reg = new RegExp(/^[0-9a-zA-Z]{17}$/);
    console.log(self.data.value.length,reg.test(self.data.value))
      if (reg.test(self.data.value)) {
        if (self.data.caseId == '') {
          self.setData({
            type: '1'
          });
        }
        app.globalData.vin = self.data.value;
        self.judgeVin();
      } else {
        wx.showModal({
          title: '提示',
          content: 'VIN号码错误！',
          showCancel: false
        })
      }
  
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



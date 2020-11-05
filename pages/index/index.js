//index.js
const WXAPI = require('../../config')
import Toast from '../../dist/toast/toast';
import Dialog from '../../dist/dialog/dialog';
//获取应用实例
const app = getApp()

Page({
  data: {
    bgPic: '../../img/img_bg.png',
    value: '',
    plateNum: '',
    carCode: '',
    imgData: [],
    modelId: '',
    caseId: '',
    searchText: '请输入17位车架号码',
    hasDone: false,
    isOk: false,
    show: false,
  },
  onLoad: function (options) {
    let self = this;
    this.setData({
      value: ''
    });
  },
  //展示行驶证范例
  showPermit: function () {
    let self = this;
    this.setData({
      show: true
    });
  },
  onClose() {
    this.setData({
      show: false
    });
  },

  onChange: function (event) {
    let self = this;
    console.log(event,"输入onChange")
    self.setData({
      value: event.detail.replace(/\s+/g, "")
    });

  },
  getPlateNum: function (event) {
    let self = this;
    console.log(event,"输入")
    self.setData({
      plateNum: event.detail
    });
  },

  afterRead(e) {
    var self = this;
    self.setData({
      show: false
    })
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {

        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths; // 返回选定照片的本地路径列表 
        // self.upload(self, tempFilePaths);
        // console.log('本地图片的路径:' + tempFilePaths)
        // this.upload(that, tempFilePaths)
        for (let i = 0; i < tempFilePaths.length; i++) {
          self.setPic(tempFilePaths[i]);
          // console.log('本地图片的路径:' + tempFilePaths[i])
        }
      }
    })
  


  },
  // 转化为 base64
  setPic: function (file) {
    // console.log(file, "oooooooooooo")
    let self = this;
    // const {
    //   file
    // } = file;
    wx.getFileSystemManager().readFile({
      filePath: file, //选择图片返回的相对路径
      encoding: 'base64', //编码格式
      success: res => { //成功的回调
        // console.log(file, "afterRead 图片大小")
        self.uploadimg(res.data, file.path);
      }
    })
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
  },
  // 上传图片
  uploadimg: function (path) {
    let self = this;
    var timer = setInterval(() => {
      // console.log(this.data.hasDone)
      if (this.data.hasDone ) {
        clearInterval(timer);
        Toast.clear();

      } else {
        // console.log(this.data.value)
        Toast.loading({
          mask: false,
          forbidClick:true,
          message: '正在解析中，请稍等！'
        });
      }
    }, 200);
    let param = {
      file: path
    };
    WXAPI.request('POST', '/recogn/queryByDrivingLicense', param, (res) => {
      // var res = JSON.parse(res.data);
      this.setData({
        hasDone: true
      })
      if (res.status == 200) {
        self.setData({
          value: res.data.vin,
          plateNum:res.data.plateNum,
          carCode: res.data.carcode,
          caseId: res.data.caseId
        });
      
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
    
      self.setData({
        hasDone: true
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
  judgeVin: function () {
    let self = this;
    let data = {
      "vin": self.data.value,
      'caseId': seld.data.caseId
    };
    var timer1 = setInterval(() => {
      if (self.data.isOk) {
        clearInterval(timer1);
        Toast.clear();

      } else {
        Toast.loading({
          mask: false,
          forbidClick:true,
          message: '正在查询中，请稍等！'
        });
      }
    }, 50);
    WXAPI.request('POST', '/vin/queryModelInfo', data, (res) => {
      self.setData({
        isOk: true
      });
      if (res.status == 200) {
        var data = res.data;
        wx.navigateTo({
          url: '../carInfo/index?pp=' + data.pp + '&carBrand=' + data.cx + '&carYear=' + data.nk + '&carGgh=' + data.gongGao + '&carType=' + data.sellVersion + '&gearbox=' + data.gearBox + '&caseId=' + data.caseId
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
        content: '解析失败0000！',
        showCancel: false
      })

    }, () => {
      console.log('next');

    })
  },
  // 获取查询信息跳转至车辆信息页面
  toCarInfo: function () {
    let self = this;
    let data = {
      vin: this.data.value,
      plateNum: this.data.plateNum
    }
    var timer1 = setInterval(() => {
      if (self.data.isOk) {
        clearInterval(timer1);
        Toast.clear();

      } else {
        Toast.loading({
          mask: false,
          forbidClick:true,
          message: '正在查询中，请稍等！'
        });
      }
    }, 50);
    if (this.data.value.length == 17) {
      WXAPI.request('POST', '/vin/queryModelInfo', data, (res) => {
        self.setData({
          isOk: true
        });
        if (res.status == 200) {
          var data = res.data;
         
          wx.navigateTo({
            url: '../carInfo/index?pp=' + data.pp + '&carBrand=' + data.cx + '&carYear=' + data.nk + '&carGgh=' + data.gongGao + '&carType=' + data.sellVersion + '&gearbox=' + data.gearBox + '&caseId=' + data.caseId + '&modelId=' + data.modelId
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.msg,
            showCancel: false
          })
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: 'VIN长度必须为17位',
        showCancel: false
      })
      self.setData({
        isOk: true
      });
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
    // wx.hideLoading()
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
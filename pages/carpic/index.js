//index.js
const WXAPI = require('../../config');
import Toast from '../../dist/toast/toast'
import imgCount from '../../utils/imgCount'
//获取应用实例
const app = getApp()
Page({
  data: {
    carPic: '../../img/carPic.png',
    addPhoto: '../../img/iconCarcam.png',
    carCode: '',
    modelId: '',
    vin: '',
    caseId: '',
    imageSize: '',
    quality: 1,
    photos: []
  },
  //确认车型
  onLoad: function (options) {
    let self = this;
    wx.setNavigationBarTitle({
      title: '车损拍照'
    });
    self.setData({
      vin: options.vin,
      caseId: options.caseId,
      modelId: options.modelId
    });
    this.getPicList()
  },
  // 获取照片列表
  getPicList: function () {
    let data = {
      caseId: this.data.caseId
    }
    WXAPI.request('POST', '/injuredCase/getImagesByCaseId', data, (res) => {
      if (res.status == 200) {
        this.setData({
          photos: res.data.imageUrlList,
          modelId: res.data.modelId
        });
      } else {
        wx.showToast({
          title: '提示',
          content: '解析失败',
          showCancel: false,
          forbidClick:true
        })
      }
    }, (err) => {
      console.log(err)
    }, () => {
      // console.log('next')
    })
  },
  addPhoto: function (e) {
    let self = this;
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // console.log(res.tempFilePaths,  res.tempFilePaths.length)
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths; // 返回选定照片的本地路径列表         
        for (let i = 0; i < tempFilePaths.length; i++) {
          self.setPic(tempFilePaths[i]);
        }
      }
    })
  },
  // 转化为 base64
  setPic: function (file) {
    let self = this;
    // const {
    //   file
    // } = file;
    wx.getFileSystemManager().readFile({
      filePath: file, //选择图片返回的相对路径
      encoding: 'base64', //编码格式
      success: res => { //成功的回调
        self.uploadimg(res.data, file.path);
      }
    })
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
  },
  uploadimg: function (path) { //这里触发图片上传的方法   
    var self = this;
    let param = {
      caseId: self.data.caseId,
      file: path
    };
    WXAPI.request('POST', '/recogn/uploadImage', param, (res) => {
      self.setData({
        photos: self.data.photos.concat(res.imageUrl)
      });
      wx.hideToast(); //隐藏Toast
    }, (err) => {
      console.log(err);
      wx.showToast({
        title: '提示',
        content: '上传失败00',
        showCancel: false,
        forbidClick:true
      })
    })
  },
  //压缩并获取图片，这里用了递归的方法来解决canvas的draw方法延时的问题
  getCanvasImg: function (index, failNum, tempFilePaths) {
    var self = this;
    wx.getImageInfo({
      // src: tempFilePaths[index],// 用于多个图片压缩
      src: tempFilePaths, //图片的路径，可以是相对路径，临时文件路径，存储文件路径，网络图片路径,  
      success: res => {
        // util.imageUtil  用语计算长宽比
        var imageSize = imgCount.imageUtil(res);
        // console.log(imageSize)
        self.imageSize = imageSize;
        const ctx = wx.createCanvasContext('attendCanvasId');
        setTimeout(() => {
          ctx.drawImage(tempFilePaths, 0, 0, imageSize.imageWidth, imageSize.imageHeight);
          ctx.draw(true, function () {
            wx.canvasToTempFilePath({
              canvasId: 'attendCanvasId',
              fileType: 'jpg',
              quality: self.data.quality,
              success: function success(res) {
                self.uploadimg(res.tempFilePath);
                // self.getCanvasImg(index,failNum,tempFilePaths); // 用于多个图片压缩
              },
              fail: function (e) {
                failNum += 1; //失败数量，可以用来提示用户
                self.getCanvasImg(inedx, failNum, tempFilePaths);
              }
            });
          });
        }, 200);

      },
      fail: () => {},
      complete: () => {}
    });
  },
  // 删除图片
  photoClick: function (e) {
    let self = this;
    // console.log();
    var src = e.currentTarget.dataset.src;
    var index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '提示',
      content: '您确定要删除该定损的照片？',
      showCancel: true,
      success(res) {
        if (res.cancel) {
          // 用户点击了取消属性的按钮，对应选择了'女'
          // self.setData({
          //   userSex: 2
          // })
        } else if (res.confirm) {
          let data = {
            "caseId": self.data.caseId,
            "imageUrl": src
          }
          WXAPI.request('POST', '/recogn/delImage', data, (res) => {

            if (res.status == 200) {

              self.data.photos.splice(index, 1)
              self.setData({
                photos: self.data.photos
              });
            }
          }, (err) => {
            console.log(err)
          }, () => {
            console.log('next')
          })
        }
      }
    })
  },
  //去示例页面
  toExample: function () {
    wx.navigateTo({
      url: '../picShow/index',
    });
  },
  // 上传图片
  getSure: function () {
    let self = this;
    if (self.data.photos.length > 0) {
      wx.redirectTo({
        url: '../carharm/index?modelId=' + self.data.modelId + '&caseId=' + self.data.caseId + '&type=0',
      });
    } else {
      wx.showModal({
        title: '提示',
        content: '您好还没上传定损图片，请选您需要定损的照片',
        showCancel: false
      })
    }
  },
  onUnload: function () {
    // wx.redirectTo({
    //   url: '../feeList/feeList'
    // })
  }
})
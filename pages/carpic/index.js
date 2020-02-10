//index.js
const WXAPI = require('../../config');
import Toast from '../../dist/toast/toast'
import imgCount from '../../utils/imgCount'
//获取应用实例
const app = getApp()
var imgData= [];
Page({
  data: {    
    carPic:'../../img/carPic.png',
    addPhoto: '../../img/iconCarcam.png',
    carCode:'',
    modelId:'',
    vin:'',
    caseId:'',
    imageSize: '',
    quality:1,
    photos:[
   
    ] ,
    allImg:[],  
  },
  //确认车型
  onLoad: function (options) {
    let self= this;
    wx.setNavigationBarTitle({ title: '车损拍照' });
    console.log(options, "++++", app.globalData)
    self.setData({
      carCode: app.globalData.carCode,
      modelId: app.globalData.modelId,
      vin:options.vin,
      // caseId:'47'
      caseId: app.globalData.caseId
    });

  },
  addPhoto: function(e) {     
    let self = this; 
    console.log('addPhoto')         
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // console.log(res.tempFilePaths,  res.tempFilePaths.length)
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths; // 返回选定照片的本地路径列表         
        for (let i = 0; i < tempFilePaths.length ; i++){
          self.uploadimg(tempFilePaths[i]);
          
          
        }
      }
    })
  },
  uploadimg:function(path){//这里触发图片上传的方法   
    var self=this;
    let param = { caseId: self.data.caseId };
    // let param = { caseId: '340'}
    WXAPI.uploadImage('/ai/recogn/uploadImage', path, param, (res) => {
      console.log(res);
      var resData = JSON.parse(res.data);
      imgData.push(resData.imageUrl);
    }, (err) => {
      console.log(err);
      
      wx.showModal({
        title: '提示',
        content: '上传失败00',
        showCancel: false
      })
    }, () => {
      // console.log('next', imgData);
      self.setData({
        allImg: imgData,
        photos: imgData
      });
      wx.hideToast(); //隐藏Toast
    })
 },
  //压缩并获取图片，这里用了递归的方法来解决canvas的draw方法延时的问题
  getCanvasImg: function (index, failNum, tempFilePaths) {
    var self = this;
    wx.getImageInfo({
      // src: tempFilePaths[index],// 用于多个图片压缩
      src: tempFilePaths, //图片的路径，可以是相对路径，临时文件路径，存储文件路径，网络图片路径,  
      success: res => {
        // console.log(res,"fuuffj")
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
                }, fail: function (e) {
                  failNum += 1;//失败数量，可以用来提示用户
                  self.getCanvasImg(inedx, failNum, tempFilePaths);
                }
              });
            });
          },200);
        
      },
      fail: () => { },
      complete: () => { }
    });
  },
 // 删除图片
  photoClick:function(e){
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
          console.log('取消')
          // 用户点击了取消属性的按钮，对应选择了'女'
          // self.setData({
          //   userSex: 2
          // })
        } else if (res.confirm) {
          let data = {
            "caseId": self.data.caseId,
            "imageUrl": src
          }
          console.log('确认')
          WXAPI.request('POST', '/ai/recogn/delImage', data, (res) => {
            console.log(res,"++++++++++");
            if (res.status == 200){
              imgData.splice(index, 1);
              self.setData({
                photos: imgData 
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
  toExample:function(){
    wx.navigateTo({
      url: '../picShow/index',

    });
  },
  // 上传图片
  getSure: function () {   
    let self = this;
    // console.log("[[[[[[[[[[[[[[", self.data.photos.length)
    if(self.data.photos.length >0){
      wx.navigateTo({
        url: '../carharm/index',

      });
    } else{
      wx.showModal({
        title: '提示',
        content: '您好还没上传定损图片，请选您需要定损的照片',
        showCancel: false
       
      })
    }
    
  }
})


//index.js
//获取应用实例
import WXAPI from "../../config.js";
import Toast from '../../dist/toast/toast';
const app = getApp()

Page({
  data: { 
    carCode: '',
    modelId: '',
    vin: '',
    caseId:'',
    hasDone:false,
    currentTab:0,
    widHeight:0,
    height:0,
    totalnum:0,
    harmData:[],
    totalAccessoriesCost: '0',
    totalManhourCost: '0',
    totalnum: "0",
    listData: [     
      // { 
      //   "imageUrl": "../../img/m1.png",    
      //   "list":[
      //     {
      //       'injuredType':'刮擦',
      //       'partName':'前保险杠'
      //     }
          
      //   ]
      // },
      // {
      //   "imageUrl": "../../img/m11.png",
      //   "list": [
      //     {
      //       'injuredType': '刮擦',
      //       'partName': '前保险杠'
      //     },
      //     {
      //       'injuredType': '刮擦',
      //       'partName': '前保险杠111111'
      //     }

      //   ]
      // },
      // {
      //   "imageUrl": "../../img/m13.png",
      //   "list": [
      //     {
      //       'injuredType': '000刮擦',
      //       'partName': '前保险杠'
      //     },
      //     {
      //       'injuredType': '000刮擦',
      //       'partName': '前保险杠111111'
      //     }

      //   ]
      // }
        
    ],

  },
  onLoad: function (options) {
    let query = wx.createSelectorQuery();
    let self = this;
    wx.setNavigationBarTitle({ title: '受损部位识别' });
    // console.log(options, "[[[[[[[[[[[[[[", app.globalData);
    var timer = setInterval(() => {
      if (self.data.hasDone) {
        clearInterval(timer);
        Toast.clear();

      } else {
        console.log(self.data.value)
        Toast.loading({
          mask: false,
          message: '受损部位识别中，请稍等！'
        });
      }
    }, 200);
    let data = {
      caseId: app.globalData.caseId,
      carCode: app.globalData.carCode,
      modelId: app.globalData.modelId,
      vin: app.globalData.vin
      // caseId: 389,
      // carCode: "1199899837101903872",
      // modelId: "71416",
      // vin:"LGBF1CE018R226548"
    };
    var harmData = [], totalCost = 0, totalManhour = 0, totalPrice = 0;
    WXAPI.request('POST', '/ai/recogn/queryByCarDamage', data, (res) => {
      self.setData({
        hasDone: true
      });
      
      // console.log(res, "-------");
      var resData = res.data;
      if (res.status == 200) {
        self.setData({
          listData: res.data
        });
        query.select('.mainBox').boundingClientRect(function (rect) {
          // console.log("11111111",rect.height, "+++++++++++++++++++++++++++++")
          self.setData({
            // 获取要循环标签的高度
            height: rect.height * 2 + "rpx"
            // widHeight: rect.height * zhang + "rpx"
          })
        }).exec();
        for (let i = 0; i < resData.length; i++) {
          // harmData.push(listData[i].list);
          for (let j = 0; j < resData[i].list.length; j++) {
            console.log(resData[i].list[j].partPrice, "[[[[[");
            harmData.push(resData[i].list[j]);
            if (resData[i].list[j].partPrice == '' || resData[i].list[j].partPrice == null) {
              // console.log('1111partPrice', listData[i].list[j].partPrice)
              resData[i].list[j].partPrice = 0;
            } else {
              totalCost = totalCost + Number(resData[i].list[j].partPrice);
            };
            if (resData[i].list[j].hourPrice == '' || resData[i].list[j].hourPrice == null) {
              // console.log('1111hourPricee', listData[i].list[j].hourPrice)
              resData[i].list[j].hourPrice = 0;
            } else {
              totalManhour = totalManhour + Number(resData[i].list[j].hourPrice);
            }
            // console.log(harmData, totalCost, totalManhour, totalPrice);           
          }
        };
        totalPrice = totalCost + totalManhour;
        // console.log(harmData, totalCost, totalManhour, totalPrice);

        self.setData({
          harmData: harmData,
          totalAccessoriesCost: totalCost,
          totalManhourCost: totalManhour,
          totalnum: totalPrice
        });
      } else {
        // wx.showModal({
        //   title: '提示',
        //   content: res.msg,
        //   showCancel: false
        // })
        return;
      }
    }, (err) => {
      console.log(err);
      self.setData({
        hasDone: true
      });
      wx.showModal({
        title: '提示',
        content: '受损部位解析失败',
        showCancel: false
      })
    },()=>{
      console.log('next');
      // wx.showModal({
      //   title: '提示',
      //   content: '解析失败',
      //   showCancel: false
      // })
      wx.hideToast();
    });
   
  },
  //滑动切换
  swiperTab: function (e) {
    let query = wx.createSelectorQuery();
    var self = this;
    query.selectAll('.mainBox').boundingClientRect(function (rects) {
      console.log(rects[e.detail.current].height)
     
      self.setData({
        // 获取要循环标签的高度
        height: rects[e.detail.current].height * 2 + "rpx"
        // widHeight: rect.height * zhang + "rpx"
      })
    }).exec();
    // 获取单个轮播循环的高度
    // var heights = this.data.height;
    // // 获取一级成员的数组个数
    // var len = this.data.listData.length
    // console.log(heights, e.detail.current)
    // self.setData({
    //   currentTab: e.detail.current
    // });
    // if (this.data.currentTab == 0) {
    //   self.setData({
    //     height: heights * 2 + "rpx"
    //   });
    //   // console.log(2222)
    //   // console.log(this.data.zhangsan.length)
    // } else {
    //   // self.setData({
    //   //   widHeight: heights * lisi + "px"
    //   // });
    //   console.log(2222)
    //   //  console.log(this.data.lisi.length)
    // }
    // console.log(e.detail.current);
  },
  //确认车型
  getSure: function() {
    let self = this;
    wx.navigateTo({
      url: '../carAdevise/index?totalPrice=' + self.data.totalnum,
    });
  },
})



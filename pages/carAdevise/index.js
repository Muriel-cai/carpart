//index.js
//获取应用实例
import WXAPI from "../../config.js";
import Toast from '../../dist/toast/toast';
const app = getApp()

Page({
  data: { 
    // totalAccessoriesCost:'示例5000',
    // totalManhourCost:'示例1000',
    // totalnum:"10000",
    License:'',
    listData: [
          
    ],
    num :0,
    type:'2',
    identity: [
      {
        text: '维修厂',
        static: true
      },
      {

        text: '4S店',
        static: false
      }
    ],
    showLicense:false,
    servicePrice:'0',
    price4S:'0',
    insurancePrice:'0',
    sfMoney:'0',
    basxMoney:'0',
    hpMoney:"0",
    type:1,
    caseId: '',
    modelId: '',
    hasDone:false
  },
  onLoad: function (options) {
    let self = this;
    wx.setNavigationBarTitle({ title: '出险建议' });
    console.log(options, "[[[[[[[[[[[[[[", app.globalData);
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
    self.setData({
      caseId: app.globalData.caseId,
      modelId: app.globalData.modelId,
      basxMoney: options.totalPrice,
      servicePrice: options.totalPrice,
      hpMoney: options.totalPrice
    });
    // self.data.caseId = 47;
    // self.data.modelId = 71416;
    var harmData = [], totalCost = 0, totalManhour = 0, totalPrice = 0, total4SPrice = 0, totalManhour4S = 0, totalCost4S = 0;
    let data ={
      caseId: self.data.caseId,
      modelId: self.data.modelId
    };
    WXAPI.request('POST', '/ai/recogn/getInjuredCase', data, (res) => {
      console.log(res, "]]]]]");
      self.setData({
        hasDone: true
      });
      var listData = res.data;
      if (res.status == 200) {
        for (let i = 0; i < listData.length; i++) {
          // harmData.push(listData[i].list);
          for (let j = 0; j < listData[i].list.length; j++) {
            console.log(listData[i].list[j].partPrice, "[[[[[");
            harmData.push(listData[i].list[j]);
            if (listData[i].list[j].partPrice == '' || listData[i].list[j].partPrice == null) {
              // console.log('1111partPrice', listData[i].list[j].partPrice)
              listData[i].list[j].partPrice = 0;
            }
            if (listData[i].list[j].hourPrice == '' || listData[i].list[j].hourPrice == null) {
              // console.log('1111hourPricee', listData[i].list[j].hourPrice)
              listData[i].list[j].hourPrice = 0;
            }
            if (listData[i].list[j].partPrice4S == '' || listData[i].list[j].partPrice4S == null) {
              // console.log('1111partPrice', listData[i].list[j].partPrice)
              listData[i].list[j].partPrice4S = 0;

            } else{
              totalCost4S = totalCost4S + Number(listData[i].list[j].partPrice4S);
            }
            if (listData[i].list[j].partPrice4SHour == '' || listData[i].list[j].partPrice4SHour == null) {
              // console.log('1111hourPricee', listData[i].list[j].hourPrice)
              listData[i].list[j].partPrice4SHour = 0;
            } else {
              totalManhour4S = totalManhour4S + Number(listData[i].list[j].partPrice4SHour);
            } 
            // console.log(harmData, totalCost, totalManhour, totalPrice);           
          }
        };
        // totalPrice = totalCost + totalManhour;
        total4SPrice = totalManhour4S + totalCost4S;
        // console.log(harmData, totalCost, totalManhour, totalPrice);

        self.setData({
          listData: harmData,
          price4S: total4SPrice,
          // totalAccessoriesCost: totalCost,
          // totalManhourCost: totalManhour,
          // totalnum: totalPrice
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
      console.log(err);
      wx.showModal({
        title: '提示',
        content: '解析失败',
        showCancel: false
      })
    }, () => {
      console.log('next');
      WXAPI.request('POST', '/ai/recogn/insuranceEstimate', data, (res) => {
        console.log(res);
        if(res.status == 200){
          self.setData({
            sfMoney: res.insuranceEstimate
          });
        }
        
      },
        (err) => {
          console.log(err);
          wx.showModal({
            title: '提示',
            content: '解析失败',
            showCancel: false
          })
        }, () => {
          console.log('第二个next');
          wx.hideToast();
        })
    })
  },
  hasTab:function(e){
    let self = this;
    console.log(e.currentTarget.dataset.type);
    self.setData({
      type: e.currentTarget.dataset.type
    })
  },
  haschoise: function (e) {
    let self = this;
    var a = self.data.servicePrice, b = self.data.price4S;
    console.log(e.currentTarget.dataset.index);
    self.setData({
      num: e.currentTarget.dataset.index
    });
    if(e.currentTarget.dataset.index == 0){
      self.setData({
        basxMoney: a
      });
    } else if (e.currentTarget.dataset.index == 1 ){
      self.setData({
        basxMoney: b
      });
    }

  },
  onChange: function (e) {
    let self = this;
    console.log(e, "onChange", e.detail);
    self.setData({
      License: e.detail     
    });

  },
  //确认车型
  getSure: function() {
    let self = this;  
    self.setData({ showLicense: true });  
      
      console.log(self.data.License,"pppppppp")
    
  },
  //取消保存案件
  cancelSave:function(){
    let self = this;
    self.setData({ showLicense: false})
  },
  // 保存案件
  hasSave:function(){
    let self = this;

    self.setData({ showLicense: false });
    let data = {
      caseId: self.data.caseId,
      // caseId:47,
      plateNum: self.data.License
    };
    WXAPI.request('POST', '/ai/recogn/saveCase', data, (res) => {
      console.log(res,"pppppppp")

    },
      (err) => {
        console.log(err);
        wx.showModal({
          title: '提示',
          content: '解析失败',
          showCancel: false
        })
      }, () => {
        console.log('第二个next');
        wx.hideToast();
      })
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

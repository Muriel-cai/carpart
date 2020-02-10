//index.js
//获取应用实例
import WXAPI from "../../config.js";
import Toast from '../../dist/toast/toast';
const app = getApp()

Page({
  data: { 
    totalAccessoriesCost:'0',
    totalManhourCost:'0',
    totalnum:"0",
    hasDone:false,
    listData: [
      // { "partName": "前保险杠", "partPrice": "200", "hourPrice": "222" },
      // { "partName": "前右侧车门", "partPrice": "800", "hourPrice": "262"  }      
    ],
    caseId: '',
    modelId:''
  },
  onLoad: function (options) {
    let self = this;
    wx.setNavigationBarTitle({ title: '损失智能估算' });
    console.log(options, "[[[[[[[[[[[[[[", app.globalData)
    self.setData({
      caseId: app.globalData.caseId,
      modelId: app.globalData.modelId
    });
    //  self.data.caseId = 47;
    // self.data.modelId = 71416;
    var harmData = [], totalCost = 0, totalManhour = 0, totalPrice = 0;
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
    let data = {
      caseId: self.data.caseId,
      modelId: self.data.modelId
    };
    WXAPI.request('POST', '/ai/recogn/getInjuredCase', data, (res) => {
      console.log(res,"]]]]]");
      self.setData({
        hasDone: true
      });
      var listData = res.data;
      if (res.status == 200) {
        for (let i = 0; i < listData.length; i++){
          // harmData.push(listData[i].list);
          for
          (let j = 0; j < listData[i].list.length; j++){
            console.log(listData[i].list[j].partPrice,"[[[[[");
            harmData.push(listData[i].list[j]);
            if (listData[i].list[j].partPrice == '' || listData[i].list[j].partPrice ==  null  ){
              // console.log('1111partPrice', listData[i].list[j].partPrice)
              listData[i].list[j].partPrice = 0;
            }else {               
              totalCost = totalCost + Number(listData[i].list[j].partPrice);
            } ;
            if (listData[i].list[j].hourPrice == '' || listData[i].list[j].hourPrice == null){
              // console.log('1111hourPricee', listData[i].list[j].hourPrice)
             listData[i].list[j].hourPrice = 0;
            } else {
              totalManhour = totalManhour+Number(listData[i].list[j].hourPrice);
            }  
            // console.log(harmData, totalCost, totalManhour, totalPrice);           
          }
        };
        totalPrice = totalCost + totalManhour;
        // console.log(harmData, totalCost, totalManhour, totalPrice);

        self.setData({
          listData: harmData,
          totalAccessoriesCost: totalCost,
          totalManhourCost: totalManhour,
          totalnum: totalPrice
        });

      } else {
        wx.showModal({
          title: '提示',
          content: '解析失败',
          showCancel: false
        })
        return;
      }
    }, (err) => {
      console.log(err);
      self.setData({
        hasDone: true
      })
      wx.showModal({
        title: '提示',
        content: '解析失败',
        showCancel: false
      })
    }, () => {
      console.log('next');
      // wx.showModal({
      //   title: '提示',
      //   content: '获取数据失败！',
      //   showCancel: false
      // })
      wx.hideToast();
    }) 
   
    
    // wx.request({
    //   url: 'http://10.9.1.179:8072/ai/recogn/getInjuredCase',
    //   method: "POST",
    //   header: { 'Content-Type': "application/x-www-form-urlencoded" },
    //   data: {
    //     //和服务器约定的token, 一般也可以放在header中
    //     caseId: self.data.caseId,
    //     modelId: self.data.modelId
    //   },
    //   success: function (res) {
    //     //上传成功返回数据JSON.parse(res.data).data
        
    //     var listData = res.data.data;
    //     console.log('上传成功返回的数据', res.data.status);
    //     if (res.data.status == 200) {
    //       for (let i = 0; i < listData.length; i++){
    //         // harmData.push(listData[i].list);
    //         for
    //         (let j = 0; j < listData[i].list.length; j++){
    //           console.log(listData[i].list[j].partPrice,"[[[[[");
    //           harmData.push(listData[i].list[j]);
    //           if (listData[i].list[j].partPrice == '' || listData[i].list[j].partPrice ==  null  ){
    //             // console.log('1111partPrice', listData[i].list[j].partPrice)
    //             listData[i].list[j].partPrice = 0;
    //           }else {               
    //             totalCost = totalCost + Number(listData[i].list[j].partPrice);
    //           } ;
    //           if (listData[i].list[j].hourPrice == '' || listData[i].list[j].hourPrice == null){
    //             // console.log('1111hourPricee', listData[i].list[j].hourPrice)
    //            listData[i].list[j].hourPrice = 0;
    //           } else {
    //             totalManhour = totalManhour+Number(listData[i].list[j].hourPrice);
    //           }  
    //           // console.log(harmData, totalCost, totalManhour, totalPrice);           
    //         }
    //       };
    //       totalPrice = totalCost + totalManhour;
    //       // console.log(harmData, totalCost, totalManhour, totalPrice);
          
    //       self.setData({
    //         listData: harmData,
    //         totalAccessoriesCost: totalCost,
    //         totalManhourCost: totalManhour,
    //         totalnum: totalPrice
    //       });

    //     } else {
    //       wx.showModal({
    //         title: '提示',
    //         content: '解析失败',
    //         showCancel: false
    //       })
    //       return;
    //     }
    //   },
    //   fail: function (e) {
    //     console.log(e);
    //     wx.showModal({
    //       title: '提示',
    //       content: '解析失败',
    //       showCancel: false
    //     })
    //   },
    //   complete: function () {
    //     wx.hideToast(); //隐藏Toast
    //   }
    // })
  },
  //确认车型
  getSure: function() {
    let self = this;
    wx.navigateTo({
      url: '../carAdevise/index?totalPrice=' + self.data.totalnum,

    });
  },

})


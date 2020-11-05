//index.js
//获取应用实例
import WXAPI from "../../config.js";
import Toast from '../../dist/toast/toast';
let partData =[]
const app = getApp()

Page({
  data: {
    carCode: '',
    modelId: '',
    vin: '',
    caseId: '',
    hasDone: false,
    caseType: '',// 订单状态
    widHeight: 0,
    height: 0,
    totalPrice: 0,   
    listData: [ ],
    harmData: [],
    modalHidden:true,
    show: false,
    newPrice:'',
    partId:'',
    harmInd:"",
    keyValue:'',
    addData:{
      caseId:'',
      imgUrl:'',
      imgId:'',
      partName:'',
      injuredType:''
    },
    columns:[
        {
          values:  [ //32个配件数组
            "左A柱",
            "左前叶子板",
            "左前大灯",
            "左前门",
            "左前雾灯",
            "左前雾灯框",
            "左后内尾灯",
            "左后叶子板",
            "左后外尾灯",
            "左后视镜",
            "左后门",
            "左底大边",
            "右A柱",
            "右前叶子板",
            "右前大灯",
            "右前门",
            "右前雾灯",
            "右后内尾灯",
            "右后叶子板",
            "右后视镜",
            "右后门",
            "右底大边",
            "前保下隔栅",
            "中网",
            "前保险杠",
            "机盖",
            "行李箱盖",
            "车顶",
            "钢圈",
            "后保险杠"
          ],
          className: 'column1',
        },
        {
          values: ['刮擦','凹陷','穿孔','褶皱','开裂'],
          className: 'column2',
          defaultIndex: 2,
        },
    ] 
  },
  onLoad: function (options) {   
    let self = this;
    self.setData({
      caseId: options.caseId,
      modelId: options.modelId,
      'addData.caseId': options.caseId,
      caseType:options.type
    })
    partData = self.data.columns[0].values
    // options.type = 0 ;// 一下测试数据
    wx.setNavigationBarTitle({
      title: '受损部位识别'
    });
      var timer = setInterval(() => {
      if (self.data.hasDone) {
        clearInterval(timer);
        Toast.clear();
      } else {
        Toast.loading({
          mask: false,
          message: '受损部位识别中，请稍等！',
          forbidClick:true
        });
      }
    }, 200);
    if (options.type == 0) {
      self.getList();
    } else if (options.type == 1) {
      self.getInjuredCase()
    }
  },
  //滑动切换
  swiperTab: function (e) {
    let query = wx.createSelectorQuery();
    var self = this;  
    query.selectAll('.mainBox').boundingClientRect(function (rects) {   
      self.setData({
        // 获取要循环标签的高度
        height: rects[e.detail.current].height * 2 + "rpx"
        // widHeight: rect.height * zhang + "rpx"
      })
    }).exec();

  },
  setrect() {
    let self = this;
    let query = wx.createSelectorQuery();       
    query.select('.mainBox').boundingClientRect(function (rect) {
      self.setData({
        // 获取要循环标签的高度
        height: rect.height * 2 + "rpx"
        // widHeight: rect.height * zhang + "rpx"
      })
    }).exec();
 
  },
  //获取未完成订单信息
  getList:function(){
    let self = this;
    let data = {
      caseId: self.data.caseId,
      modelId: self.data.modelId     
        // 一下测试数据
      //  caseId: 1746,
      //  modelId: 80610  
    };    
    WXAPI.request('POST', '/recogn/queryByCarDamage', data, (res) => {
      self.setData({
        hasDone: true
      });
      var resData = res.data;
      if (res.status == 200) {
        self.setData({
          listData: res.data.partList,
          harmData:res.data.priceList
        });
        self.getTotalPrice();
        self.setrect();  
      } else {        
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
        showCancel: false,
        mask:true
      })
    }, () => {
      console.log('next');     
      wx.hideToast();
    });

  },
  //获取已完成订单信息
  getInjuredCase:function(){
    let self= this;
    let data = {
      caseId: self.data.caseId      
    }
    WXAPI.request('POST', '/recogn/getInjuredCase', data, (res) => {  
      self.setData({
        hasDone: true
      });           
      if (res.status == 200) {
        self.setData({
          listData: res.data.partList,
          harmData:res.data.priceList
        });
        self.getTotalPrice();
        self.setrect();  
      } else {
       
        return;
      }
    }, (err) => {
      console.log(err);
    
    
    })
  },
  getTotalPrice:function(){
    let self = this;
    let count = 0;
    self.data.harmData.map((item) => {
      count += (Number(item.price) || 0) 
    })
    self.setData({
      totalPrice: count
    });
  },
  //确认车型
  getSure: function () {
    let self = this;
    let data = {
      caseId: self.data.caseId,
    };
    if(self.data.caseType  == 0){
      WXAPI.request('POST', '/recogn/finished', data, (res) => {
        wx.redirectTo({
          url: '../feeList/feeList'
        });
  
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
      }, () => {
        console.log('next');
        wx.hideToast();
      });
  
    } else{
      wx.redirectTo({
        url: '../feeList/feeList'
      });
    }
    
  },
  
  // 修改价格
  changePrice:function(event){
    let self = this;
    self.setData({
      modalHidden: false,
      partId:event.currentTarget.dataset.partid,
      harmInd:event.currentTarget.dataset.index,
      newPrice:''
    })
  },
  //获取价格
  getNewPrice:function(event){
    let self = this;
    self.setData({
      newPrice: event.detail.value
    })
  },
  //确认修改
  modalBindaconfirm: function(){
    let self = this;  
    let data = {
      partId: self.data.partId,
      modifyPrice:self.data.newPrice
    };
    let index  = self.data.harmInd
    WXAPI.request('POST', '/aiPart/modifyPartPrice', data, (res) => {
      self.data.harmData[index].price = self.data.newPrice        
      self.setData({
        modalHidden: true,
        harmData :self.data.harmData
      })
      self.getTotalPrice();
    }, (err) => {
      console.log(err);
     
    }, () => {
      console.log('next');
    
    });
  },
  //取消修改
  modalBindcancel: function(){
    let self = this;
    self.setData({
      modalHidden: true,
    })
  },
  //删除损失部位
  delDamage:function(event){
    let self = this;
    wx.showModal({
      title: '删除损伤部位',
      content: '确定要删除损伤部位？',
      mask:true,//是否显示透明蒙层，防止触摸穿透，默认：false  
      showCancel: true,//是否显示取消按钮
      cancelText:"取消",//默认是“取消”
      cancelColor:'#999',//取消文字的颜色
      confirmText:"确定",//默认是“确定”
      confirmColor: '#1890FF',//确定文字的颜色
      success: function (res) {
         if (res.cancel) {
            //点击取消,默认隐藏弹框
            console.log('quxiao ')
         } else {
            //点击确定
            let dataIndex = event.currentTarget.dataset.index;
            let dataInd = event.currentTarget.dataset.ind;
            let id= event.currentTarget.dataset.id
            let data = {
              partId: id
            };    
            WXAPI.request('POST', '/aiPart/deletePart', data, (res) => {
              self.getList()
            }, (err) => {
              console.log(err);
             
            }, () => {
              console.log('next');
            
            });
         }
      },
      fail: function (res) { },//接口调用失败的回调函数
      complete: function (res) { },//接口调用结束的回调函数（调用成功、失败都会执行）
   })
    
  },
  // 添加损伤部分
  getDamage:function(e){
    let self = this;
    console.log(self.data.columns[0],"ces",self.data.columns[0].values[0])
    let index = e.currentTarget.dataset.index
    self.setData({
      show: true,
      'addData.imgUrl':self.data.listData[index].imageUrl,
      'addData.imgId':self.data.listData[index].imgId,
      'addData.partName':self.data.columns[0].values[0],
      'addData.injuredType':self.data.columns[1].values[2]
    });
  },
  getValue:function(e){
    let self = this;
    console.log(e.detail);
    let keyWord = e.detail;
    let arr = [];  
    for (let i = 0; i < partData.length; i++) {   
      if (partData[i].indexOf(keyWord) >= 0) { 
        arr.push(partData[i]);             
      }
    }
    self.setData({
      'columns[0].values': arr,
      'keyValue':e.detail
    });
    if(arr.length ==0){
      self.setData({
        'addData.partName':self.data.keyValue,
      });
    } else {
      self.setData({
        'addData.partName':self.data.columns[0].values[0]
      });
    }
    
  },
  onChange(event) {
   let self = this;
    const { picker, value, index } = event.detail;
    console.log( value, value[0],value[1]);
    if(!value[0] ){
      self.setData({
        'addData.partName':self.data.keyValue,
        'addData.injuredType':value[1]
      });
    } else{
      self.setData({
        'addData.partName':value[0],
        'addData.injuredType':value[1]
      });
    }   
  },
  onClose(){
    this.setData({
      show: false
    })
  },
  //确定
  getNameSure(){ 
    let self = this;

    WXAPI.request('POST', '/aiPart/addPart', self.data.addData, (res) => {
      this.setData({
        show: false
      })
      self.getList();
    }, (err) => {
      wx.showToast({
        title: '提示',
        duration:2000,//显示时长
        content: '新增失败!请检查数据',
        showCancel: false
      })
    })
  }
})
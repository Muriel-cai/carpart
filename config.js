// 小程序开发api接口统一配置
// 如果你的域名是： https://www.baidu.com/cn 那么这里只要填写 cn
// let subDomain = '/cn'  // 子域名,没有就等于''
const API_BASE_URL = 'https://reco.lpcknew.com:8072' // 主域名  记得修改app.js 中的域名
//  const API_BASE_URL = 'http://10.9.1.179:8072'
// 统一请求
const request = (method, url, data, callback, errFun, next) => {
  let geturl = API_BASE_URL + url;
  // console.log(data,wx.getStorageSync('accessToken'),'accessToken+++++++++++++');
  wx.request({
    url: geturl,
    method: method,
    data: data,
    header: {
      'content-type': method == 'GET' ? 'application/json' : 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Token': wx.getStorageSync('accessToken')
    },
    dataType: 'json',
    success: function (res) {
      // console.log(res.data.status)
      if (res.data.status == 200) {
        callback(res.data);
      } else if (res.data.status == 101) {
        wx.navigateTo({
          url: '../login/login'
        });
      } else {
        callback(res.data);
        // console.log('ces++++++++++++++++++++++',res.data.msg,res.msg)
        // wx.showModal({
        //   title: '提示',
        //   content: res.data.msg,
        //   showCancel: false
        // })
      }

    },
    fail: function (err) {
      console.log('失败', err)
      errFun(err);
    },
    complete: function () {

    }
  })
};
//上传图片
const uploadImage = (url, path, data, callback, errFun, next) => {
  console.log(path)
  let geturl = API_BASE_URL + url;
  wx.uploadFile({
    url: geturl,
    filePath: path,
    name: 'file',
    header: {
      "Content-Type": "multipart/form-data"
    },
    formData: data,
    success: function (res) {
      //上传成功返回数据
      if (res.data.status == 200) {
        callback(res.data);
      } else if (res.data.status == 101) {
        wx.navigateTo({
          url: '../login/login'
        });
      } else {
        // console.log('ces++++++++++++++++++++++',res.data.msg,res.msg)
        wx.showModal({
          title: '提示',
          content: res.data.msg,
          showCancel: false
        })
      }
      // callback(res);

    },
    fail: function (err) {
      errFun(err);

    },
    complete: function () {
      next()

    }
  });
}
// 加载时的弹框

/**
 * 小程序的promise没有finally方法，自己扩展下
 */
// Promise.prototype.finally = function (callback) {
//   var Promise = this.constructor;
//   return this.then(
//     function (value) {
//       Promise.resolve(callback()).then(
//         function () {
//           return value;
//         }
//       );
//     },
//     function (reason) {
//       Promise.resolve(callback()).then(
//         function () {
//           throw reason;
//         }
//       );
//     }
//   );
// }

module.exports = {
  request,
  uploadImage

}

// module.exports = config;
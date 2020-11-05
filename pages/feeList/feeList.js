// pages/feeList/feeList.js
import WXAPI from "../../config.js";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        searchValue: '',
        listData: [],
        isnull: true,
        page: 1,
        total: 0,
        pageSize: 10,
        loading: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let self = this;
        // wx.stopPullDownRefresh();
        if (wx.getStorageSync('accessToken') == '') {
            wx.navigateTo({
                url: '../login/login'
            });
        } else {
            wx.getSystemInfo({
                success: function (res) {
                    self.setData({
                        scrollHeight: res.windowHeight
                    });
                }
            });
            this.getList();
        }
    },
    // 获取列表
    getList: function () {
        let self = this;
        this.loading = true
        let data = {
            page: self.data.page
        }
        WXAPI.request('POST', '/injuredCase/list', data, (res) => {
            if (res.status == 200) {
                if (self.data.page == 1) {
                    this.setData({
                        listData: res.data,
                        total: res.total
                    })
                } else {
                    this.setData({
                        listData: self.data.listData.concat(res.data),
                        total: res.total
                    })
                }

                wx.hideNavigationBarLoading(); //完成停止加载图标
                wx.stopPullDownRefresh();
                if (res.data.length > 0) {
                    this.setData({
                        isnull: true
                    })
                } else {
                    this.setData({
                        isnull: false
                    })
                }
            } else if (res.status == 101) {
                wx.navigateTo({
                    url: '../login/login'
                });
            }
        }, (err) => {
            console.log(err)
        }, (res) => {

        })
    },
    //跳转到添加页面
    addCase: function () {
        let self = this;
        wx.redirectTo({
            url: '../index/index?state=false'
        })
    },
    // 根据状态 跳转
    getInfo(e) {
        if (e.currentTarget.dataset.status == 1) {
            wx.redirectTo({
                url: '../carharm/index?caseId=' + e.currentTarget.dataset.caseid + '&type=1'
            })
        } else if (e.currentTarget.dataset.status == 0) {
            wx.redirectTo({
                url: '../carpic/index?caseId=' + e.currentTarget.dataset.caseid
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

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        this.onLoad();
      },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        wx.showNavigationBarLoading();
        this.setData({
            page: 1
        })
        this.onLoad();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        // 下拉触底，先判断是否有请求正在进行中
        // 以及检查当前请求页数是不是小于数据总页数，如符合条件，则发送请求
        console.log(this.data.page * this.data.pageSize, this.data.total)
        if (this.data.page * this.data.pageSize < this.data.total) {
            this.setData({
                page: this.data.page + 1
            })
            this.getList()
        } else {
            wx.showToast({
                title: '无更多数据',
                icon: 'none',
                duration: 1000
            });
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
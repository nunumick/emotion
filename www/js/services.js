/**
 * author:nunumick@gmail.com
 */
angular.module('eMotion.services', [])

/**
 * service apis
 */
.factory('ApiService',function($http, $rootScope, $ionicLoading, $state, $timeout){
  var host = 'http://dip.taobao.net/mock/';
  var server = $rootScope.CustomDatas.host + '/';
  var apiCfg = [
    {
      name:'login',
      path : '1743'
    },
    {
      name : 'register',
      path : '1742'
    },
    {
      name : 'create',
      path : '1744'
    },
    {
      name : 'cancel',
      path : '1746'
    },
    {
      name : 'lists',
      path : '1747'
    },
    {
      name : 'detail',
      path : '1748'
    },
    {
      name : 'apply',
      path : '1749'
    },
    {
      name : 'cancelApply',
      path : '1750'
    },
    {
      name : 'kill',
      path : '1751'
    },
    {
      name : 'resource',
      path : '1752'
    },
    {
      name : 'members',
      path : '1888'
    },
    {
      name : 'userinfo',
      path : '2000'
    }
  ];

  var apiServer = [
    {
      name:'login',
      path : 'user/loginCheck.do'
    },
    {
      name : 'register',
      path : 'user/register.do'
    },
    {
      name : 'create',
      path : 'activity/create.do'
    },
    {
      name : 'cancel',
      path : 'activity/cancel.do'
    },
    {
      name : 'lists',
      path : 'activity/squareList.do'
    },
    {
      name : 'detail',
      path : 'activity/activityDetail.do'
    },
    {
      name : 'apply',
      path : 'activityApply/activityApply.do'
    },
    {
      name : 'cancelApply',
      path : 'activityApply/cancelApply.do'
    },
    {
      name : 'kill',
      path : 'activityApply/killPatner.do'
    },
    {
      name : 'resource',
      path : 'resource/resourceList.do'
    },
    {
      name : 'members',
      path : 'activityApply/applyRecord.do'
    },
    {
      name : 'updateuserinfo',
      path : 'user/updateUserInfo.do'
    },
    {
      name : 'getuserinfo',
      path : 'user/getUserInfo.do'
    }
  ];
  var apis = {};

  //调试数据开关
  if(!$rootScope.CustomDatas.debug){
    host = server;
    apiCfg = apiServer;
  }

  apiCfg.forEach(function(api,index){
    apis[api.name] = host + api.path + '?callback=JSON_CALLBACK';
  })

  //promise factory
  apis.serve = function(serve,params,loading,delay){
    //共享第三个参数位置
    if(typeof loading == 'number'){
      delay = loading;
      loading = '';
    }

    $ionicLoading.show({
      template : loading || '加载中...'
    })

    return $timeout(function(){
      //console.log('delay '+ (delay || 0));
    },delay||0).then(function(){
      return $http.jsonp(serve,{
        params : params
      })
      .then(function(res){
        $ionicLoading.hide();
        $rootScope.CustomDatas.offline = false;
        $rootScope.CustomDatas.serveError = false;
        return res;
      },function(res){
        var status = res.status+'';
        var msg = '';

        return $timeout(function(){
          $ionicLoading.hide()
        },1000).then(function(){
          if(status.match(/^4\d{2}$/)){
            $rootScope.CustomDatas.offline = true;
            msg = '连接失败，请检查网络连接！';
          }else if(status.match(/^5\d{2}$/)){
            $rootScope.CustomDatas.serveError = true;
            msg = '数据服务无响应！';
          }
          return {data:{
            success: false,
            msg : msg
          }}
        })
      })
    })
  }

  return apis;

})

//用户管理服务
.factory('UserAccountService',function(){
  var datas = {
    loginStat : false,//登录状态
    uid : 0,//用户id
    nick : '',//用户昵称
    alipay : '',//支付宝
    token:''
  };
  return {
    isLogin : function(){
      return datas.loginStat;
    },
    getItem : function(key){
      return datas[key] || null;
    },
    getItems : function(){
      return datas;
    },
    setItem : function(key,value){
      datas[key] = value || '';
    },
    setItems : function(data){
      for(var p in data){
        if(data.hasOwnProperty(p)){
          datas[p] = data[p] || '';
        }
      }
    },
    load : function(){
      datas = JSON.parse(localStorage.getItem('userData')) || datas;
    },
    init : function(){
      this.load();
    },
    save : function(data){
      if(data){
        this.setItems(data);
      }
      localStorage.setItem('userData',JSON.stringify(datas));
    },
    clear : function(){
      this.setItem('loginStat',false);
      this.setItem('uid',0);
      this.setItem('nick','');
      this.setItem('alipay','');
      this.save();
    }
  }
})

//活动列表服务
.factory('ActivityListsService', function(ApiService) {

  var lists = [];
  var serveName = ApiService.lists;
  var pages = {
    1 : 1,
    2 : 1,
    3 : 1
  }

  return {
    serve : function(params){
      return ApiService.serve(serveName,params);
    },
    setData : function(datas,type){
      lists = datas;
      this.setPage(type);
    },
    all:function(){
      return lists;
    },
    getPage : function(type){
      return pages[type];
    },
    setPage : function(type){
      pages[type] += 1;
    },
    remove : function(list){
      lists.splice(lists.indexOf(list), 1);
    },
    get: function(listId) {
      for (var i = 0; i < lists.length; i++) {
        if (lists[i].id === parseInt(listId)) {
          return lists[i];
        }
      }
      return null;
    }
  }
})

//活动详情服务
.factory('ActivityDetailService',function(ApiService){
  var detail = [];
  var serveName = ApiService.detail;

  return {
    serve : function(params){
      return ApiService.serve(serveName,params);
    },
    setData : function(datas){
      detail = datas;
      return detail;
    }
  }
})
//活动成员服务
.factory('ActivityMembersService',function(ApiService){
  var lists = [];
  var serveName = ApiService.members;
  return {
    serve : function(params){
      return ApiService.serve(serveName,params);
    }
  }
})
//活动成员剔除服务
.factory('MemberKillService',function(ApiService){
  var serveName = ApiService.kill;
  return {
    serve : function(params){
      return ApiService.serve(serveName,params,'剔除中...',1000);
    }
  }
})

//球场资源服务
.factory('ActivityResourceService',function(ApiService){
  var serveName = ApiService.resource;
  return {
    serve : function(params){
      return ApiService.serve(serveName,params);
    }
  }
})

//创建活动服务
.factory('ActivityCreateService',function(ApiService){
  var serveName = ApiService.create;

  return {
    serve : function(params){
      return ApiService.serve(serveName,params,'创建中...',1000);
    }
  }

})

//活动创建人取消活动服务
.factory('ActivityRemoveService',function(ApiService,$cordovaDialogs,UserAccountService){
  var serveName = ApiService.cancel;

  return {
    serve : function(params){
      return ApiService.serve(serveName,params,'取消中...',1000);
    },
    remove : function(){
      var _self = this;
      return function(aid,sfn,ffn){
        $cordovaDialogs.confirm('活动取消后不可再恢复','取消活动')
        .then(function(buttonIndex){
          if(buttonIndex===1){
            _self.serve({
              uid : UserAccountService.getItem('uid'),
              aid : aid
            }).then(function(promise){
              var data = promise.data;
              if(data.success){
                sfn();
              }else{
                $cordovaDialogs.alert(data.msg,'取消失败')
                .then(ffn);
              }
            })
          }else{
            return false;
          }
        });
      }
    }
  }
})

//申请加入&退出申请
.factory('ActivityApplyService',function(ApiService){
  var confirmName = ApiService.apply;
  var cancelName = ApiService.cancelApply;

  return {
    serve : function(serveName,params,msg,delay){
      return ApiService.serve(serveName,params,msg,delay);
    },
    confirm : function(params){
      return this.serve(confirmName,params,'申请中...',1000);
    },
    cancel : function(params){
      return this.serve(cancelName,params,'退出中...',1000);
    }
  }
})

//登录服务
.factory('LoginService',function(ApiService,UserAccountService){
  var serveName = ApiService.login;

  return {
    serve : function(params){
      return ApiService.serve(serveName,params,'登录中...',1000);
    },
    save : function(data){
      UserAccountService.save({
        uid : data.uid || 0,
        loginStat : true,
        nick : data.nick || ''
      });
    }
  }
})

//注册服务
.factory('RegisterService',function(ApiService,UserAccountService){
  var serveName = ApiService.register;

  return {
    serve : function(params){
      return ApiService.serve(serveName,params,'注册中...',1000);
    },
    save : function(data){
      UserAccountService.save({
        uid : data.uid || 0,
        loginStat : true,
        nick : data.nick || ''
      });
    }
  }
})

//补充个人信息
.factory('UserInfoService',function(ApiService,UserAccountService){
  var updateServeName = ApiService.updateuserinfo;
  var getServeName = ApiService.getuserinfo;

  return {
    serve : function(serveName,params,msg,delay){
      return ApiService.serve(serveName,params,msg,delay);
    },
    get : function(params){
      return this.serve(getServeName,params);
    },
    update : function(params){
      return this.serve(updateServeName,params,'保存中...',1000);
    },
    save : function(data){
      UserAccountService.save({
        nick : data.nick || '',
        alipay : data.alipay || ''
      });
    }
  }
})

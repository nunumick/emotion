angular.module('kicker.services', [])

.factory('ApiService',function($http, $rootScope){
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
  apis.serve = function(serve,params){
    return $http.jsonp(serve,{
      params : params
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
    token:''
  };
  return {
    isLogin : function(){
      return datas.loginStat;
    },
    getItem : function(key){
      return datas[key] || null;
    },
    setItem : function(key,value){
      datas[key] = value || '';
    },
    load : function(){
      datas = JSON.parse(localStorage.getItem('userData')) || datas;
    },
    init : function(){
      this.load();
    },
    save : function(data){
      localStorage.setItem('userData',JSON.stringify(datas));
    },
    clear : function(){
      this.setItem('loginStat',false);
      this.setItem('uid',0);
      this.setItem('nick','');
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
      return ApiService.serve(serveName,params);
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
      return ApiService.serve(serveName,params);
    }
  }

})

//活动创建人取消活动服务
.factory('ActivityRemoveService',function(ApiService,$ionicPopup,UserAccountService){
  var serveName = ApiService.cancel;

  return {
    serve : function(params){
      return ApiService.serve(serveName,params);
    },
    remove : function(){
      var _self = this;
      return function(aid,sfn,ffn){
        var confirm = $ionicPopup.confirm({
          title : '取消活动',
          template : '您确定要取消这个活动吗?'
        });

        confirm.then(function(res){
          if(res){
            _self.serve({
              uid : UserAccountService.getItem('uid'),
              aid : aid
            }).then(function(promise){
              var data = promise.data;
              if(data.success){
                $ionicPopup.alert({
                  title : '取消成功',
                  template : '取消成功'
                }).then(sfn);
              }else{
                $ionicPopup.alert({
                  title : '取消失败',
                  template : data.msg
                }).then(ffn);
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
    serve : function(serveName,params){
      return ApiService.serve(serveName,params);
    },
    confirm : function(params){
      return this.serve(confirmName,params);
    },
    cancel : function(params){
      return this.serve(cancelName,params);
    }
  }
})

//登录服务
.factory('LoginService',function(ApiService,UserAccountService){
  var serveName = ApiService.login;

  return {
    serve : function(params){
      return ApiService.serve(serveName,params);
    },
    save : function(data){
      UserAccountService.setItem('uid',data.uid);
      UserAccountService.setItem('loginStat',true);
      UserAccountService.setItem('nick',data.nick || '匿名');
      UserAccountService.save();
    }
  }
})

//注册服务
.factory('RegisterService',function(ApiService,UserAccountService){
  var serveName = ApiService.register;

  return {
    serve : function(params){
      return ApiService.serve(serveName,params);
    },
    save : function(data){
      UserAccountService.setItem('uid',data.uid);
      UserAccountService.setItem('loginStat',true);
      UserAccountService.setItem('nick',data.nick || '匿名');
      UserAccountService.save();
    }
  }
})

angular.module('kicker.services', [])

.factory('ApiService',function($http){
  var host = 'http://dip.taobao.net/mock/';
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
  var apis = {};

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
    phone : '',//注册手机号
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
      datas[key] = value;
    },
    load : function(){
      datas = JSON.parse(localStorage.getItem('userData')) || datas;
    },
    init : function(){
      this.load();
    },
    save : function(data){
      localStorage.setItem('userData',JSON.stringify(datas));
    }
  }
})

//活动列表服务
.factory('ActivityListsService', function(ApiService) {

  var lists = [];
  var currentPage = 1;
  var serveName = ApiService.lists;

  return {
    serve : function(params){
      return ApiService.serve(serveName,params);
    },
    setData : function(datas){
      lists = datas;
      currentPage += 1;
    },
    all:function(){
      return lists;
    },
    getPage : function(){
      return currentPage;
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
  var serveName = ApiService.members;
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
.factory('ActivityRemoveService',function(ApiService){
  var serveName = ApiService.cancel;

  return {
    serve : function(params){
      return ApiService.serve(serveName,params);
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
      return this.serve(confirmName,params);
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
      UserAccountService.setItem('nick',data.nick || data.phoneNum);
      UserAccountService.setItem('phone',data.phoneNum);
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
      UserAccountService.setItem('nick',data.nick || data.phoneNum);
      UserAccountService.setItem('phone',data.phoneNum);
      UserAccountService.save();
    }
  }
})

angular.module('kicker.services', [])

.factory('Api',function(){
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
    }
  ];
  var apis = {};

  apiCfg.forEach(function(api,index){
    apis[api.name] = host + api.path + '?callback=JSON_CALLBACK';
  })

  console.log(apis)

  return apis;

})

.factory('Account',function(){
  var datas = {
    loginStat : false,
    uid : 0,
    phone : '',
    nick : ''
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
      console.log(datas);
    },
    save : function(){
      localStorage.setItem('userData',JSON.stringify(datas));
    }
  }
})

.factory('Lists', function($http,Api) {

  var lists = [];

  var promise = $http.jsonp(Api.lists,{
    params : {
      currentPage : 1
    }
  }).success(function(data){
    return data;
  })
  .error(function(data){
  })


  return {
    getData : function(){
      return promise;
    },
    setData : function(datas){
      lists = datas;
    },
    all:function(){
      return lists;
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

.factory('Login',function($http,Api,Account){
  return {
    req : function(data){
      var promise = $http.jsonp(Api.login, {params:{
        phoneNum : data.phone || '',
        passwd : data.pw || ''
      }})
      .success(function(data){
        return data;
      })
      return promise;
    },
    save : function(data){
      Account.setItem('uid',data.uid);
      Account.setItem('loginStat',true);
      Account.setItem('nick',data.nick || data.phoneNum);
      Account.setItem('phone',data.phoneNum);
      Account.save();
    }
  }
})

.factory('Register',function($http,Api,Account){
  return {
    req : function(data){
      var promise = $http.jsonp(Api.register,{
        params : {
          phoneNum : data.phone,
          passwd : data.pw
        }
      })
      .success(function(data){
        return data;
      })

      return promise;
    },
    save : function(data){
      Account.setItem('uid',data.uid);
      Account.setItem('loginStat',true);
      Account.setItem('nick',data.nick || data.phoneNum);
      Account.setItem('phone',data.phoneNum);
      Account.save();
    }
  }
})

.factory('Create',function($http,Api,Account){
  return{
  };
})

.factory('Detail',function(){
})

.factory('Resource',function(){
})

.factory('Cancel',function(){
})

.factory('Apply',function(){
})

.factory('CancelApply',function(){
})

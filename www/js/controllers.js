angular.module('kicker.controllers', [])

.controller('TabCtrl', function($scope, $state) {
  $scope.toActivityGround = function(){
    $state.go('tab.lists');
  }
  $scope.toDashboard = function(){
    $state.go('tab.dash');
  }
})

.controller('DashCtrl', function($rootScope, $scope, $state, UserAccountService) {
})

.controller('ActionSheet', function($rootScope, $scope, $state, $ionicActionSheet){

  var hideSheet = null;
  var buttons = {
      buttons : [
        {'text':'返回首页'},
        {'text':'分享活动'}
      ],
      cancelText : '取消',
      cancel : function(){
        hideSheet();
      },
      buttonClicked : function(index){
        if(index==0){
          $state.go('tab.lists');
        }else if(index==1){
        }
        return true;
      }
    };


  if($rootScope.CustomDatas.from == 'tab.mine'){
    buttons.destructiveText = '取消活动';
    buttons.destructiveButtonClicked = function(){
      return true;
    };
  }

  $scope.show = function(){
    hideSheet = $ionicActionSheet.show(buttons);
  }

})

.controller('ListsCtrl', function($scope, $state, ActivityListsService, UserAccountService) {

  var isListState = $state.is('tab.lists');
  $scope.title = isListState ? '活动列表' : $state.is('tab.join') ? '我加入的活动' : $state.is('tab.mine') ? '我创建的活动' : '活动';
  $scope.path = isListState ? 'lists' : 'detail';
  $scope.del = $state.is('tab.mine');

  ActivityListsService.serve({
    uid : UserAccountService.getItem('uid'),
    currentPage : ActivityListsService.getPage()
  })
  .then(function(promise){
    ActivityListsService.setData(promise.data.datas);
    $scope.lists = ActivityListsService.all();
    $scope.remove = function(list) {
      ActivityListsService.remove(list);
    }
  })

})

.controller('DetailCtrl', function($scope, $state, $ionicPopup, UserAccountService, ActivityDetailService, ActivityApplyService) {

  $scope.path = $state.is('tab.lists-detail') ? 'members' : 'dash-members';

  ActivityDetailService.serve({
    aid : $state.params.id,
    uid : UserAccountService.getItem('uid')
  })
  .then(function(promise){
    $scope.detail = ActivityDetailService.setData(promise.data.datas);
    $scope.join = function(){
      if(!UserAccountService.isLogin()){
        $state.go('admin.login');
        return;
      }
      ActivityApplyService.confirm({
        'aid' : $scope.detail.aid,
        'uid' : UserAccountService.getItem('uid')
      })
      .then(function(promise){
        var data = promise.data;
        if(data.success){
          $ionicPopup.alert({
            title : '报名成功',
            template : '快进入我加入的活动列表看看吧',
            buttons : [
              {
              text : 'OK',
              type: 'button-positive',
              onTap : function(){
                $state.go('tab.join');
                return true;
              }
            }
            ]
          });
        }else{
          $ionicPopup.alert({
            title : '报名失败',
            template : promise.data.msg,
            buttons : [
              {
              text : '知道了',
              type: 'button-positive',
              onTap : function(){
                return true;
              }
            }
            ]
          });
        }
      });
    }

    $scope.quit = function(){

      if(!UserAccountService.isLogin()){
        $state.go('admin.login');
        return;
      }

      ActivityApplyService.cancel({
        'signrecordid' : $scope.detail.signrecordid,
        'uid' : UserAccountService.getItem('uid')
      })
      .then(function(promise){
        var data = promise.data;
        if(data.success){
          $ionicPopup.alert({
            title : '取消报名成功',
            template : promise.data.msg,
            buttons : [
              {
              text : 'OK',
              type: 'button-positive',
              onTap : function(){
                $state.go('tab.join');
                return true;
              }
            }
            ]
          });
        }else{
          $ionicPopup.alert({
            title : '取消报名失败',
            template : promise.data.msg,
            buttons : [
              {
              text : '知道了',
              type: 'button-positive',
              onTap : function(){
                return true;
              }
            }
            ]
          });
        }
      });
    }
  })

})

.controller('MembersCtrl', function($rootScope, $scope, $state, $ionicHistory, UserAccountService, ActivityMembersService) {
  ActivityMembersService.serve({
    uid : UserAccountService.getItem('uid'),
    aid : $state.params.id
  })
    .then(function(promise){
    $scope.lists = promise.data.datas;
  })
})

.controller('CreateCtrl', function($ionicPopover,$rootScope, $scope, $state, $ionicHistory, $ionicPopup, UserAccountService, ActivityCreateService, ActivityResourceService) {


  $scope.formData = {
    name : '',
    startDate : '',
    endDate : '',
    uid : UserAccountService.getItem('uid'),
    limit : '',
    price : '',
    bak : '',
    type : ''
  };

  //获取资源列表
  $scope.getResources = function(){
    ActivityResourceService.serve({
      type : $scope.formData.type
    })
    .then(function(promise){
      $scope.resourcesLists = promise.data.datas;
    })
  }

  $scope.create = function(){
    ActivityCreateService.serve($scope.formData)
    .then(function(promise){
      $ionicPopup.alert({
        title : '创建成功',
        template : promise.data.msg,
        buttons : [
          {
            text : '好了',
            type: 'button-positive',
            onTap : function(){
              $state.go('tab.mine');
              return true;
            }
          },
          {
            text : '继续创建',
            type: 'button-positive',
            onTap : function(){
              $state.go('tab.create');
              return true;
            }
          }
        ]
      });
    })
  }

  $scope.goBack = function(){
    if(!$rootScope.name){
      $state.go('tab.lists');
    }else{
      $ionicHistory.goBack();
    }
  }

})

.controller('SetupCtrl', function($scope) {})

.controller('ContactCtrl', function($scope) {})

.controller('LoginCtrl', function($rootScope, $scope, $state, $ionicPopup, $ionicHistory, UserAccountService, LoginService) {
  $scope.formData = {
    phone : '',
    pw : ''
  };

  function phoneValid(phone){
    if(!phone){
      popup('错误','请输入合法的手机号码');
    }
    return (!!phone);
  }

  function popup(title,msg,fn){
    $ionicPopup.alert(
      {
        title : title,
        template : msg,
        buttons : [
          {
            text : '知道了',
            type: 'button-positive',
            onTap : function(){
              fn&&fn();
              return true;
            }
          }
        ]
      }
    )
  }

  $scope.login = function(){
    if(!phoneValid($scope.formData.phone)) return;
    LoginService.serve({
      phoneNum : $scope.formData.phone,
      passwd : $scope.formData.pw
    }).then(function(promise){
      var data = promise.data;
      if(data.success){
        popup('登录成功','欢迎您：' + data.datas.nick,function(){
          LoginService.save(data.datas);
          $state.go($rootScope.CustomDatas.from || $rootScope.CustomDatas.dash);
        });
      }else{
        popup('出错啦',data.msg);
      }
    })
  }

  $scope.goBack = function(){
    if($rootScope.CustomDatas.isFromHome){
      $state.go($rootScope.CustomDatas.home);
    }else{
      $ionicHistory.goBack();
    }
  }

})

.controller('RegisterCtrl', function($scope,$state,$ionicHistory,$ionicPopup,RegisterService) {
  $scope.formData = {
    phone : '',
    pw : '',
    pwcheck : ''
  };

  function phoneValid(phone){
    if(!phone){
      popup('错误','请输入合法的手机号码');
    }
    return (!!phone);
  }

  function pwValid(pw,pwcheck){
    if(!(pw && pw===pwcheck)){
      popup('错误','两次输入的密码必须一致');
    }
    return !!(pw&&pw===pwcheck);
  }

  function popup(title,msg,fn){
    $ionicPopup.alert(
      {
        title : title,
        template : msg,
        buttons : [
          {
            text : '知道了',
            type: 'button-positive',
            onTap : function(){
              fn&&fn();
              return true;
            }
          }
        ]
      }
    )
  }

  $scope.register = function(){
    if(!(phoneValid($scope.formData.phone)&&pwValid($scope.formData.pw,$scope.formData.pwcheck))) return;
    RegisterService.serve({
      phoneNum : $scope.formData.phone,
      passwd : $scope.formData.pw
    }).then(function(promise){
      var data = promise.data;
      if(data.success){
        popup('注册成功','感谢您的支持，现在返回首页',function(){
          RegisterService.save(promise.data.datas);
          $state.go('tab.lists');
        })
      }else{
        popup('出错啦',promise.data.msg);
      }
    })
  }

  $scope.goBack = function(){
    $ionicHistory.goBack();
  }

})

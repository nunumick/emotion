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

.controller('ActionSheet', function($rootScope, $scope, $state, $ionicActionSheet, ActivityRemoveService){

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
      ActivityRemoveService.remove()($state.params.id,function(){
        $state.go('tab.mine');
      });
      return true;
    };
  }

  $scope.show = function(){
    hideSheet = $ionicActionSheet.show(buttons);
  }

})

.controller('ListsCtrl', function($scope, $state, ActivityListsService, UserAccountService, ActivityRemoveService) {

  var type = null;
  var remove = ActivityRemoveService.remove();

  $scope.title = '活动列表';
  $scope.path = 'detail';
  $scope.del = false;

  if($state.is('tab.lists')){
    type = 1;
    $scope.path = 'lists';
  }else if($state.is('tab.join')){
    type = 3;
    $scope.title = '我加入的活动';
  }else if($state.is('tab.mine')){
    type = 2;
    $scope.title = '我创建的活动';
    $scope.del = true;
  }

  function fetch(page){
    ActivityListsService.serve({
      type : type,
      uid : UserAccountService.getItem('uid') || 0,
      currentPage : page
    })
    .then(function(promise){
      ActivityListsService.setData(promise.data.datas,type);
      $scope.lists = ActivityListsService.all();
    })
    .finally(function(){
      $scope.$broadcast('scroll.refreshComplete');
    })
  }

  $scope.remove = function(list){
    remove(list.aid,function(){
      ActivityListsService.remove(list);
    })
  };

  $scope.refresh = function(){
    fetch(1);
  }

  fetch(1);

})

.controller('DetailCtrl', function($scope, $state, $ionicPopup, UserAccountService, ActivityDetailService, ActivityApplyService) {

  $scope.path = $state.is('tab.lists-detail') ? 'members' : 'dash-members';
  var status = [
    '接受报名中',
    '活动已结束',
    '活动已失效'
  ]

  function fetch(){
    ActivityDetailService.serve({
      aid : $state.params.id,
      uid : UserAccountService.getItem('uid') || 0
    })
    .then(function(promise){
      $scope.detail = ActivityDetailService.setData(promise.data.datas);
      $scope.status = status[$scope.detail.actstatus-1];
      $scope.nick = $scope.detail.usercreate.nick || '匿名用户';
    })
    .finally(function(){
      $scope.$broadcast('scroll.refreshComplete');
    })
  }

  $scope.join = function(aid){
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

  $scope.refresh = function(){
    fetch();
  }

  fetch();

})

.controller('RemoveCtrl',function($scope, $state, $ionicPopup, UserAccountService, ActivityRemoveService){
  $scope.remove = function(aid){
    $ionicPopup.confirm({
      title : '取消活动',
      template : '您确定要取消这个活动吗?'
    }).then(function(res){
      if(res){
        ActivityRemoveService.serve({
          uid : UserAccountService.getItem('uid'),
          aid : aid
        })
        .then(function(promise){
          var data = promise.data;
          if(data.success){
            $ionicPopup.alert({
              title : '取消活动',
              template : '取消成功'
            })
          }else{
            $ionicPopup.alert({
              title : '取消活动',
              template : data.msg
            })
          }
        })
      }else{
      }
    })
  }
})

.controller('MembersCtrl', function($rootScope, $scope, $state, $ionicHistory, UserAccountService, ActivityMembersService, MemberKillService) {

  function fetch(page){
    ActivityMembersService.serve({
      uid : UserAccountService.getItem('uid'),
      aid : $state.params.id,
      currentPage : page
    })
    .then(function(promise){
      $scope.lists = promise.data.datas;
    })
    .finally(function(){
      $scope.$broadcast('scroll.refreshComplete');
    })
  }

  $scope.remove = function(list){
    MemberKillService.serve({
      aid : $state.params.id,
      uid : UserAccountService.getItem('uid'),
      partneruid : list.partnerid
    })
    .then(function(promise){
      var data = promise.data;
      if(data.success){
        $scope.lists.splice($scope.lists.indexOf(list), 1);
      }
    })
  }

  $scope.refresh = function(){
    fetch(1);
  }

  fetch(1);

})

.controller('CreateCtrl', function($ionicPopover,$rootScope, $scope, $state, $ionicHistory, $ionicPopup, UserAccountService, ActivityCreateService, ActivityResourceService) {

  var formData = $scope.formData = {
    name : '',
    startDate : '',
    endDate : '',
    uid : UserAccountService.getItem('uid'),
    rid : '',
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

  function setTimeZone(datetime){
    var timestr = datetime.getTime();
    var date = new Date(timestr+8*60*60*1000);
    return date.toISOString().replace(/T/,' ').replace(/\.\w*$/,'');
  }

  $scope.create = function(){
    ActivityCreateService.serve({
      uid : formData.uid,
      name : encodeURI(encodeURI(formData.name)),
      startDate : setTimeZone(formData.startDate),
      endDate : setTimeZone(formData.endDate),
      price : formData.price || 0,
      limit : formData.limit || 0,
      bak : encodeURI(encodeURI(formData.bak || '')),
      type : formData.type || 1,
      rid : formData.rid
    })
    .then(function(promise){
      var data = promise.data;
      if(data.success){
        $ionicPopup.alert({
          title : '创建成功',
          template : promise.data.msg,
          buttons : [
            {
              text : '知道了',
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
      }else{
        $ionicPopup.alert({
          title : '创建失败',
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

.controller('SetupCtrl', function($scope, $state, UserAccountService) {

  $scope.logout = function(){
    UserAccountService.clear();
    $state.go('tab.lists');
  }

})

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
        popup('登录成功','欢迎您：' + (data.datas.nick || '匿名用户'),function(){
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

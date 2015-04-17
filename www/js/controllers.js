angular.module('eMotion.controllers', [])

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

.controller('ActionSheet', function($rootScope, $scope, $state, $ionicActionSheet, ActivityRemoveService, UserAccountService, $cordovaDialogs){

  var hideSheet = null;
  var $detail = $scope.$parent.$parent;

  var params = {};

  var buttons = {
      buttons : [
        {'text':'所有活动'},
        {'text':'发送给朋友'},
        {'text':'分享到朋友圈'}
      ],
      cancelText : '取消',
      cancel : function(){
        hideSheet();
      },
      buttonClicked : function(index){
        switch(index){
          case 0:
          $state.go('tab.lists');
          break;

          case 1:
          params.scene = 0; //'会话'
          break;

          case 2:
          params.scene = 1; //'朋友圈'
          break;

          default:
          return;
        }

        //分享
        if(index>=1&&index<=2&&params.message){
          Wechat.share(params, function () {
            //alert("Success");
          }, function (reason) {
           $cordovaDialogs.alert('',"分享失败: " + reason);
          });
        }

        return true;
      }
    }

  $detail.$watch('detail',function(detail){
    if(detail){
      setParams(detail);
    }
  })

  function setParams(detail){

    if(!window.Wechat) return;

    var desc1 = '我发起了一个体育活动，伙伴们，让我们一起畅快运动挥洒汗水吧！';
    var desc2 = '我发现这个活动挺棒的，生命在于运动，伙伴们，约起来！';
    var ext = ['速度搞起','就等你了','萌萌哒','火爆了','手慢无','就是这个feel','一起来吧','招募中','动起来','无兄弟，不运动','约起来'];

    params.message = {
      title: detail.name + '，' + ext[Math.floor(Math.random()*ext.length)] + '！',
      description: detail.usercreate.uid == UserAccountService.getItem('uid') ? desc1 : desc2,
      thumb: "www/img/emotion.png",
      media: {}
    }

    params.message.media.type = Wechat.Type.LINK;
    params.message.media.webpageUrl = "http://121.40.28.70/h5/share.html?aid=" + detail.aid;
  }

  if($rootScope.CustomDatas.from.name == 'tab.mine'){
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

.controller('ListsCtrl', function($rootScope, $scope, $state, ActivityListsService, UserAccountService, ActivityRemoveService) {

  var type = null;
  var remove = ActivityRemoveService.remove();

  $scope.title = '所有活动';
  $scope.path = 'detail';
  $scope.del = false;
  $scope.listNums = 0;

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
      //console.log($scope.lists.length);
      //$rootScope.CustomDatas.listTitle = $scope.lists.length;
      $scope.listNums = $scope.lists.length;
      //console.log($state);
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

.controller('DetailCtrl', function($rootScope, $scope, $state, $cordovaDialogs, UserAccountService, ActivityDetailService, ActivityApplyService) {

  $scope.path = $state.is('tab.lists-detail') ? 'members' : 'dash-members';
  var status = [
    '接受报名中',
    '活动已结束',
    '活动已失效'
  ]

  function toISOString(time){
    var date = new Date(time + 8*60*60*1000);
    var str = date.toISOString();
    return str.replace(/T/,' ').replace(/\.\w*$/,'');
  }

  function fetch(){
    ActivityDetailService.serve({
      aid : $state.params.id,
      uid : UserAccountService.getItem('uid') || 0
    })
    .then(function(promise){
      var data = promise.data;
      if(data.success){
        $scope.detail = ActivityDetailService.setData(promise.data.datas);
        $scope.status = status[$scope.detail.actstatus-1];
        $scope.nick = $scope.detail.usercreate.nick || '匿名用户';
        //$scope.startDate = toISOString($scope.detail.stime);
        //$scope.endDate = toISOString($scope.detail.etime);
      }
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
    if(!UserAccountService.getItem('nick')){
      $cordovaDialogs.confirm('请先补充个人信息','提示')
      .then(function(buttonIndex){
        if(buttonIndex===1){
          $state.go('tab.setup');
        }
      })
      return;
    }
    ActivityApplyService.confirm({
      'aid' : $scope.detail.aid,
      'uid' : UserAccountService.getItem('uid')
    })
    .then(function(promise){
      var data = promise.data;
      if(data.success){
        $rootScope.$broadcast('stateChange:join');
      }else{
        $cordovaDialogs.alert(promise.data.msg,'报名失败');
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
        $rootScope.$broadcast('stateChange:join');
      }else{
        $cordovaDialogs.alert(promise.data.msg,'取消报名失败');
      }
    });
  }

  $scope.refresh = function(){
    fetch();
  }

  fetch();

})

.controller('RemoveCtrl',function($scope, $state, $cordovaDialogs, UserAccountService, ActivityRemoveService){
  $scope.remove = function(aid){
    ActivityRemoveService.serve({
      uid : UserAccountService.getItem('uid'),
      aid : aid
    })
    .then(function(promise){
      var data = promise.data;
      if(data.success){
      }else{
        $cordovaDialogs.alert(data.msg,'取消失败');
      }
    })
  }
})

.controller('MembersCtrl', function($rootScope, $scope, $state, $ionicHistory, UserAccountService, ActivityMembersService, MemberKillService) {

  $scope.listNums = 0;

  function fetch(page){
    ActivityMembersService.serve({
      uid : UserAccountService.getItem('uid'),
      aid : $state.params.id,
      currentPage : page
    })
    .then(function(promise){
      $scope.lists = promise.data.datas;
      $scope.listNums = $scope.lists.length;
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

.controller('CreateCtrl', function($rootScope, $scope, $state, $ionicHistory, $ionicModal, $cordovaDialogs, UserAccountService, ActivityCreateService, ActivityResourceService) {

  var formData = $scope.formData = {
    name : '',
    startDate : '',
    endDate : '',
    uid : UserAccountService.getItem('uid'),
    rid : 0,
    limit : '',
    price : '',
    bak : '',
    type : 1
  };

  $ionicModal.fromTemplateUrl('templates/create.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $scope.show = function(){
    if(!UserAccountService.isLogin()){
      $state.go('admin.login');
      return;
    }
    $scope.modal.show();
  }

  $scope.hide = function(){
    $scope.modal.hide();
  }

  //获取资源列表
  $scope.getResources = function(){
    ActivityResourceService.serve({
      type : $scope.formData.type
    })
    .then(function(promise){
      $scope.resourcesLists = promise.data.datas;
    })
  }
  $scope.$watch('resourcesLists',function(list){
    if(list && list.length){
      $scope.formData.rid = list[0].rid;
    }else{
      $scope.formData.rid = 0;
    }
  })

  function setTimeZone(datetime){
    var timestr = datetime.getTime();
    var date = new Date(timestr+8*60*60*1000);
    return date.toISOString().replace(/T/,' ').replace(/\.\w*$/,'');
  }

  $scope.create = function(form){

    if(form.$invalid) return false;

    ActivityCreateService.serve({
      uid : formData.uid,
      name : encodeURI(formData.name),
      startDate : setTimeZone(formData.startDate),
      endDate : setTimeZone(formData.endDate),
      price : formData.price || 0,
      limit : formData.limit || 0,
      bak : encodeURI(formData.bak || ''),
      type : formData.type || 1,
      rid : formData.rid || 0
    })
    .then(function(promise){
      var data = promise.data;
      if(data.success){
        $scope.hide();
        $rootScope.$broadcast('stateChange:mine');
      }else{
        $cordovaDialogs.alert(promise.data.msg,'创建失败');
      }
    })
  }

})

.controller('SetupCtrl', function($rootScope, $scope, $state, UserAccountService, UserInfoService) {

  $scope.logout = function(){
    UserAccountService.clear();
    $state.go('tab.lists');
  }

  function userinfoInit(){
    var nick = UserAccountService.getItem('nick') || '';
    var alipay = UserAccountService.getItem('alipay') || '';

    if(!(nick && alipay)){
      UserInfoService.get({
        uid : UserAccountService.getItem('uid') || 0
      })
      .then(function(promise){
        var data = promise.data;
        if(data.success){
          $scope.nick = data.datas.nick || '未设置';
          $scope.alipay = data.datas.alipay || '未设置';
          UserAccountService.save({
            nick : data.datas.nick || '',
            alipay : data.datas.alipay || ''
          });
        }else{
          $scope.nick = nick || '未设置';
          $scope.alipay = alipay || '未设置';
        }
      })
    }else{
      $scope.nick = nick || '未设置';
      $scope.alipay = alipay || '未设置';
    }

  }

  $scope.$on('userinfoupdate',function(){
    userinfoInit();
  })

  userinfoInit();

})

.controller('ContactCtrl', function($scope) {})

.controller('LoginCtrl', function($rootScope, $scope, $state, $cordovaDialogs, $ionicHistory, UserAccountService, LoginService) {
  $scope.formData = {
    phone : '',
    pw : ''
  };

  function phoneValid(){
    if(!$scope.formData.phone.match(/^1[3|4|5|8]\d{9}$/)){
      $cordovaDialogs.alert('请输入有效的手机号码','登录失败');
      return false;
    }else{
      return true;
    }
  }

  $scope.login = function(form){

    if(form.$invalid || !phoneValid()) return false;

    LoginService.serve({
      phoneNum : $scope.formData.phone,
      passwd : $scope.formData.pw
    }).then(function(promise){
      var data = promise.data;
      if(data.success){
          LoginService.save(data.datas);
          var from = $rootScope.CustomDatas.from.name;
          from = from == 'admin.register' ? $rootScope.CustomDatas.dash : from;
          $state.go(from || $rootScope.CustomDatas.dash, $rootScope.CustomDatas.fromParams || null);
      }else{
        $cordovaDialogs.alert(data.msg,'登录失败');
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

//注册控制器
.controller('RegisterCtrl', function($scope,$state,$ionicHistory,$cordovaDialogs,RegisterService) {
  $scope.formData = {
    phone : '',
    pw : '',
    pwcheck : ''
  };

  function phoneValid(){
    var state = $scope.formData.phone.match(/^1[3|4|5|8]\d{9}$/);
    if(!state){
      $cordovaDialogs.alert('请输入有效的手机号码','注册失败');
    }
    return state;
  }

  function pwValid(pw,pwcheck){
    var state = $scope.formData.pw&&$scope.formData.pw===$scope.formData.pwcheck
    if(!state){
      $cordovaDialogs.alert('密码不一致，请重新输入','注册失败');
    }
    return state;
  }

  $scope.register = function(form){

    if(form.$invalid || !phoneValid() || !pwValid()) return false;

    RegisterService.serve({
      phoneNum : $scope.formData.phone,
      passwd : $scope.formData.pw
    }).then(function(promise){
      var data = promise.data;
      if(data.success){
          RegisterService.save(promise.data.datas);
          $state.go('tab.setup');
      }else{
        $cordovaDialogs.alert(promise.data.msg, '注册失败');
      }
    })
  }

  $scope.goBack = function(){
    $ionicHistory.goBack();
  }

})
.controller('SetUserInfo',function($scope, $ionicModal, UserInfoService, UserAccountService){

  $scope.formData = {
    nick : UserAccountService.getItem('nick') || '',
    alipay : UserAccountService.getItem('alipay') || ''
  };

  $ionicModal.fromTemplateUrl('templates/setuserinfo.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $scope.open = function(){
    $scope.modal.show();
  }

  $scope.close = function(){
    $scope.modal.hide();
  }

  $scope.setinfo = function(){
    UserInfoService.update({
      uid : UserAccountService.getItem('uid') || 0,
      nick : encodeURI($scope.formData.nick),
      alipay : $scope.formData.alipay
    })
    .then(function(promise){
      var data = promise.data;
      if(data.success){
        UserInfoService.save($scope.formData);
        $scope.modal.hide();
        $scope.$emit('userinfoupdate');
      }else{
        console.log(data.msg);
      }
    })
  }

})

.controller('BackAction',function($rootScope, $scope, $state, $ionicHistory){
    $scope.goBack = function(){
      if($rootScope.CustomDatas.isFromHome || $rootScope.CustomDatas.from.name == 'admin.register'){
        $state.go($rootScope.CustomDatas.home);
      }else{
        if($ionicHistory.backView()){
          $ionicHistory.goBack();
        }else{
          $state.go($rootScope.CustomDatas.from.name,$rootScope.CustomDatas.fromParams);
        }
      }
    }
})

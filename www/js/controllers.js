angular.module('kicker.controllers', [])

.controller('MainCtrl', function($scope, Account) {
})

.controller('DashCtrl', function($rootScope,$scope, Account, $state) {
  $state.reload();
})

.controller('CreateCtrl', function($rootScope, $scope, $state, $ionicHistory, Create, Account) {
  $scope.goBack = function(){
    if(!$rootScope.name){
      $state.go('tab.dash');
    }else{
      $ionicHistory.goBack();
    }
  }
})

.controller('ListsCtrl', function($scope, Lists, $state) {

  var isListState = $state.is('tab.lists');
  $scope.title = isListState ? '活动列表' : $state.is('tab.join') ? '我加入的活动' : $state.is('tab.mine') ? '我创建的活动' : '活动';
  $scope.path = isListState ? 'lists' : 'detail';

  Lists.getData().then(function(promise){
    Lists.setData(promise.data.datas);
    $scope.lists = Lists.all();
    $scope.remove = function(list) {
      Lists.remove(list);
    }
  })

  if(isListState) $state.reload();
})

.controller('DetailCtrl', function($scope, Detail, Apply, Account) {
  Detail.getData().then(function(promise){
    $scope.detail = Detail.setData(promise.data);
    $scope.join = function(){
      Apply.confirm($scope.detail.aid,Account.getItem('uid')).then(function(promise){
        alert(promise.data.msg);
      });
    }
    $scope.quit = function(){
      Apply.cancel($scope.detail.aid,Account.getItem('uid')).then(function(promise){
        alert(promise.data.msg);
      });
    }
  })

})

.controller('ListsDetailCtrl', function($scope, $stateParams, Lists) {
  $scope.list = Lists.get($stateParams.id);
})

.controller('SetupCtrl', function($scope) {})

.controller('ContactCtrl', function($scope) {})

.controller('LoginCtrl', function($scope,$ionicHistory,Account,Login) {
  $scope.formData = {
    phone : Account.getItem('phone') || '',
    pw : ''
  };
  $scope.login = function(){
    Login.req($scope.formData).then(function(promise){
      var data = promise.data;
      if(data.success){
        Login.save(promise.data.datas[0]);
      }else{
      }
    })
  }
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }

})

.controller('RegisterCtrl', function($scope,$ionicHistory,Register) {
  $scope.formData = {
    phone : '',
    pw : '',
    pwcheck : ''
  };

  $scope.register = function(){
    Register.req($scope.formData).then(function(promise){
      var data = promise.data;
      if(data.success){
        Register.save(promise.data.datas[0]);
      }else{
      }
    })
  }
  $scope.goBack = function(){
    $ionicHistory.goBack();
  }
})

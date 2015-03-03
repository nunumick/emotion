angular.module('kicker.controllers', [])

.controller('MainCtrl', function($scope, Account) {
  Account.load();
})

.controller('DashCtrl', function($scope, Account, $state) {
  if(!Account.isLogin()){
    $state.go('tab.login');
  }
})

.controller('CreateCtrl', function($scope, Create, Account, $state) {
  if(!Account.isLogin()){
    $state.go('tab.login');
  }
})

.controller('ListsCtrl', function($scope, Lists) {
  Lists.getData().then(function(promise){
    Lists.setData(promise.data.datas);
    $scope.lists = Lists.all();
    $scope.remove = function(list) {
      Lists.remove(list);
    }
  })
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

.controller('LoginCtrl', function($scope,Login,Account) {
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

})

.controller('RegisterCtrl', function($scope,Register) {
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
})

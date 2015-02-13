angular.module('kicker.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ListsCtrl', function($scope, Lists) {
  $scope.lists = Lists.all();
  $scope.remove = function(list) {
    Lists.remove(list);
  }
})

.controller('ListsDetailCtrl', function($scope, $stateParams, Lists) {
  $scope.list = Lists.get($stateParams.id);
})

.controller('SetupCtrl', function($scope) {})
.controller('ContactCtrl', function($scope) {})
.controller('LoginCtrl', function($scope) {})
.controller('RegisterCtrl', function($scope) {})

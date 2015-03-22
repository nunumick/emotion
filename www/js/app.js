// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('kicker', ['ionic', 'kicker.controllers', 'kicker.services'])

.run(function($ionicPlatform,$ionicHistory,$rootScope,$state,UserAccountService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
      //$rootScope.netType = navigator.connection.type;
    }

  });

  UserAccountService.init();


   var debug = false;
   //开启调试，mock数据
   //debug = true;

   //不需要登录验证的场景
   var routesThatDontRequireAuth = [
     '/login',
     '/register',
     '/members/:id',
     '/lists',
     '/lists/:id'
   ];

   //需要隐藏tab的场景
   var routesThatNeedHideNavBar = [
     '/create',
     '/detail/:id',
     '/lists/:id',
     '/members/:id',
     '/dash-members/:id'
   ]

   //在Tab1-lists的场景
   var routesThatInLists = [
     '/lists',
     '/lists/:id',
     '/members/:id'
   ]

   //在Tab2-dash的场景
   var routesThatInDash = [
     '/create',
     '/dash-members/:id',
     '/detail/:id',
     '/setup',
     '/contact',
     '/lists-mine',
     '/lists-join'
   ]

   var routesThatInAdmin = [
     '/login',
     '/register'
   ]

   var routeCheck = function(route,routes){
     var flag = false;
     routes.forEach(function(noRoute){
       var reg = new RegExp('^'+noRoute.replace(/\//g,'\\/')+'$');
       if(route.match(reg)){
         flag = true;
         return false;
       }
     })
     //console.log(flag,route,routes);
     return flag;
   }


   $rootScope.CustomDatas = {
     debug : debug,
     host : debug ? '' : 'http://121.40.28.70/prototype',
     hideTabs : false,
     from : '',
     home : 'tab.lists',
     dash : 'tab.dash'
   }

  //在切换前
  $rootScope.$on('$stateChangeStart',function(event,next,nextParams,from,fromParams){

    //登录验证
    if(!routeCheck(next.url,routesThatDontRequireAuth) && !UserAccountService.isLogin()){
      event.preventDefault();
      $state.go('admin.login');
      return;
    }

    //隐藏tab
    if(routeCheck(next.url,routesThatNeedHideNavBar)){
      $rootScope.CustomDatas['hideTabs'] = true;
    }else{
      $rootScope.CustomDatas['hideTabs'] = false;
    }

    //显示取消按钮
    //仅在两个不同tab间切换或刷新页面导致历史丢失时
    if(from.name){
      var fromInListNextInDash = routeCheck(from.url,routesThatInLists) && routeCheck(next.url,routesThatInDash);
      var fromInDashNextInList = routeCheck(from.url,routesThatInDash) && routeCheck(next.url,routesThatInLists);
      var fromNotInAdminNextInAdmin = routeCheck(next.url,routesThatInAdmin)/* && !routeCheck(from.url,routesThatInAdmin)*/;
    }

    if(!from.name || fromInListNextInDash || fromInDashNextInList || fromNotInAdminNextInAdmin){
      $rootScope.CustomDatas['showBackAction'] = true;
    }else{
      $rootScope.CustomDatas['showBackAction'] = false;
    }

    $rootScope.CustomDatas['from'] = from;
    $rootScope.CustomDatas['fromParams'] = fromParams;
    $rootScope.CustomDatas['isFromHome'] = from.name == '' || from.name == $rootScope.CustomDatas.home;

  })

  /*$rootScope.$on('$cordovaNetwork:online',function(event, netWorkState){
    $rootScope.CustomDatas.offline = false;
  })
  $rootScope.$on('$cordovaNetwork:offline',function(event, netWorkState){
    $rootScope.CustomDatas.offline = true;
  })*/

})

//一些个性化配置
.config(function($ionicConfigProvider){
  //返回按钮中文化
  $ionicConfigProvider.backButton.text('返回');
  //统一安卓和ios的表现
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.tabs.style('standard');
  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.navBar.positionPrimaryButtons('left');
  $ionicConfigProvider.navBar.positionSecondaryButtons('right');
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'dash': {
        templateUrl: 'templates/dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.lists', {
      url: '/lists',
      views: {
        'lists': {
          templateUrl: 'templates/lists.html',
          controller: 'ListsCtrl'
        }
      }
    })
    .state('tab.lists-detail', {
      url: '/lists/:id',
      views: {
        'lists': {
          templateUrl: 'templates/detail.html',
          controller: 'DetailCtrl'
        }
      }
    })
    .state('tab.members', {
      url: '/members/:id',
      views: {
        'lists': {
          templateUrl: 'templates/members.html',
          controller: 'MembersCtrl'
        }
      }
    })
    .state('tab.dash-members', {
      url: '/dash-members/:id',
      views: {
        'dash': {
          templateUrl: 'templates/members.html',
          controller: 'MembersCtrl'
        }
      }
    })
    .state('tab.dash-detail', {
      url: '/detail/:id',
      views: {
        'dash': {
          templateUrl: 'templates/detail.html',
          controller: 'DetailCtrl'
        }
      }
    })
    .state('tab.join', {
      url: '/lists-join',
      views: {
        'dash': {
          templateUrl: 'templates/lists.html',
          //controller: 'ListsJoinCtrl'
          controller: 'ListsCtrl'
        }
      }
    })
    .state('tab.mine', {
      url: '/lists-mine',
      views: {
        'dash': {
          templateUrl: 'templates/lists.html',
          //controller: 'ListsMineCtrl'
          controller: 'ListsCtrl'
        }
      }
    })
    .state('tab.contact', {
      url: '/contact',
      views: {
        'dash': {
          templateUrl: 'templates/contact.html',
          controller: 'ContactCtrl'
        }
      }
    })
    .state('tab.setup', {
      url: '/setup',
      views: {
        'dash': {
          templateUrl: 'templates/setup.html',
          controller: 'SetupCtrl'
        }
      }
    })
    .state('tab.create', {
      url: '/create',
      views: {
        'dash': {
          templateUrl: 'templates/create.html',
          controller: 'CreateCtrl'
        }
      }
    })

    //账号管理
    .state('admin',{
      abstract : true,
      url: '/admin',
      templateUrl : 'templates/admin.html'
    })
    .state('admin.login', {
      url: '/login',
      views: {
        'admin': {
          templateUrl: 'templates/login.html',
          controller: 'LoginCtrl'
        }
      }
    })
    .state('admin.register', {
      url: '/register',
      views: {
        'admin': {
          templateUrl: 'templates/register.html',
          controller: 'RegisterCtrl'
        }
      }
    })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/lists');

});

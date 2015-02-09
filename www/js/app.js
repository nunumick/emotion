// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('kicker', ['ionic', 'kicker.controllers', 'kicker.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
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
    .state('tab.detail', {
      url: '/lists/:id',
      views: {
        'lists': {
          templateUrl: 'templates/detail.html',
          controller: 'ListsDetailCtrl'
        }
      }
    })
    .state('tab.lists-detail', {
      url: '/lists/detail/:id',
      views: {
        'dash': {
          templateUrl: 'templates/detail.html',
          controller: 'ListsDetailCtrl'
        }
      }
    })
    .state('tab.join', {
      url: '/lists-join',
      views: {
        'dash': {
          templateUrl: 'templates/lists-join.html',
          //controller: 'ListsJoinCtrl'
          controller: 'ListsCtrl'
        }
      }
    })
    .state('tab.mine', {
      url: '/lists-mine',
      views: {
        'dash': {
          templateUrl: 'templates/lists-mine.html',
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
    .state('tab.register', {
      url: '/register',
      views: {
        'account': {
          templateUrl: 'templates/register.html',
          controller: 'RegisterCtrl'
        }
      }
    })
    .state('tab.login', {
      url: '/login',
      views: {
        'account': {
          templateUrl: 'templates/login.html',
          controller: 'LoginCtrl'
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

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/lists');

});

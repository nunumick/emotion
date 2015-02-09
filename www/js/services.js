angular.module('kicker.services', [])

.factory('Account',function(){
  return {
    isLogin : function(){
      return false;
    },
    login : function(){
    },
    register : function(){
    }
  }
})

.factory('Lists', function($http) {
  // Might use a resource here that returns a JSON array

  var url = 'http://10.2.80.206/activity/squareList.do?currentPage=1&callback=JSON_CALLBACK';

  var promise = $http.jsonp(url)
  .then(function(response){
    return response.data;
  })


  /*// Some fake testing data
  var lists = [{
    id: 0,
    name: '淘宝城球场约踢',
    top: 30,
    current : 15,
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png',
    organizer : '渔隐',
    dateStart : '2015-02-08 20:30',
    dateEnd : '2015-02-08 22:30'
  }, {
    id: 1,
    name: '黄龙球场约踢',
    top: 30,
    current : 10,
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }, {
    id: 2,
    name: '淘宝城球场约踢',
    top: 30,
    current : 28,
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg',
    organizer : '渔隐',
    dateStart : '2015-02-10 14:00',
    dateEnd : '2015-02-10 16:00'
  }, {
    id: 3,
    name: '黄龙球场约踢',
    top: 30,
    current : 30,
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 4,
    name: '黄龙球场约踢',
    top: 30,
    current : 10,
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];*/

  return {
    all: function() {
      promise.then(function(data){
        return data.datas;
      });
    },
    remove: function(list) {
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

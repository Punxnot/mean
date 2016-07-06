var app = angular.module('flapperNews', ['ui.router']);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
  .state('home', {
    url: '/home',
    templateUrl: '/templates/home.html',
    controller: 'MainCtrl',
    resolve: {
      postPromise: ['posts', function(posts){
        return posts.getAll();
      }]
    }
    })
    .state('posts', {
      url: '/posts/{id}',
      templateUrl: '/templates/posts.html',
      controller: 'PostsCtrl',
      resolve: {
        post: ['$stateParams', 'posts', function($stateParams, posts) {
          return posts.get($stateParams.id);
        }]
      }
    })
    .state('profile', {
      url: '/profile',
      templateUrl: '/templates/profile.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(!auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    })
    .state('login', {
      url: '/login',
      templateUrl: '/templates/login.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    })
    .state('register', {
      url: '/register',
      templateUrl: '/templates/register.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    });

  $urlRouterProvider.otherwise('home');
}]);

app.factory('posts', ['$http', 'auth', function($http, auth){
  var currentUser = auth.currentUser();
  var o = {
    posts: []
  };

  o.getAll = function() {
    return $http.get('/posts').success(function(data){
      angular.copy(data, o.posts);
    });
  };

  o.create = function(post) {
    return $http.post('/posts', post, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      o.posts.push(data);
    });
  };

  o.upvote = function(post, currentUser) {
    if (post.upvotedBy.includes(currentUser)) { return; }
    return $http.put('/posts/' + post._id + '/upvote', null, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      post.upvotes += 1;
      post.upvotedBy.push(currentUser);
    });
  };

  o.get = function(id) {
    return $http.get('/posts/' + id).then(function(res){
      return res.data;
    });
  };

  o.addComment = function(id, comment) {
    return $http.post('/posts/' + id + '/comments', comment, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    });
  };

  o.isAlreadyUpvoted = function(post, user) {
    return post.upvotedBy.includes(currentUser);
  }

  return o;
}]);

app.factory('auth', ['$http', '$window', function($http, $window){
  var auth = {};

  auth.saveToken = function (token){
    $window.localStorage['flapper-news-token'] = token;
  };

  auth.getToken = function (){
    return $window.localStorage['flapper-news-token'];
  }

  auth.isLoggedIn = function(){
    var token = auth.getToken();

    if(token){
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };

  auth.currentUser = function(){
    if(auth.isLoggedIn()){
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.username;
    }
  };

  auth.register = function(user){
    return $http.post('/register', user).success(function(data){
      auth.saveToken(data.token);
    });
  };

  auth.logIn = function(user){
    return $http.post('/login', user).success(function(data){
      auth.saveToken(data.token);
    });
  };

  auth.logOut = function(){
    $window.localStorage.removeItem('flapper-news-token');
  };

  return auth;
}]);

app.directive('editableText', function() {
  return {
    restrict: 'E',
    scope: {},
    controller: function () {
      this.name = 'Your name';
    },
    controllerAs: 'ctrl',
    template: `<div class="editable-text-container">
                <form>
                  <input type="hidden" name="hiddenField">
                </form>
                <div class="name-container">
                  <h2 class="name editable" id="name">{{ctrl.name}}</h2>
                  <span class="ok-button"></span>
                  <span class="close-btn"></span>
                </div>
              </div>`,
    link: function(scope, elem, attrs, ctrl) {
      elem.bind('click', function() {
        elem = $(this).find(".editable");
        if (elem.css('display') == "block") {
          var okBtn = $(this).find(".ok-button");
          var closeBtn = $(this).find(".close-btn");
          var replaceWith = $("<input name='temp' type='text'>");
          var connectWith = $("input[name='name']");
          elem.hide();
          okBtn.show();
          closeBtn.show();
          elem.after(replaceWith);
          replaceWith.focus();
          replaceWith.val(ctrl.name);
          okBtn.click(function() {
            if (replaceWith.val() != "") {
              connectWith.val(replaceWith.val()).change();
              elem.text(replaceWith.val());
            }
            replaceWith.remove();
            okBtn.hide();
            closeBtn.hide();
            elem.show();
            return false;
          });
          return false;
        }
      });
    }
  }
});

angular.module('flapperNews')
.controller('MainCtrl', [
'$scope', 'posts', 'auth',
function($scope, posts, auth){

  $scope.test = 'Hello world!';

  $scope.currentUser = auth.currentUser();

  $scope.isLoggedIn = auth.isLoggedIn;

  $scope.posts = posts.posts;

  $scope.showNotice = true;

  $scope.addPost = function(){
    if(!$scope.title || $scope.title === '') { return; }
    posts.create({
      title: $scope.title,
      link: $scope.link,
    });
    $scope.title = '';
    $scope.link = '';
  };

  $scope.incrementUpvotes = function(post, currentUser) {
    posts.upvote(post, currentUser);
  };

  $scope.isAlreadyUpvoted = function(post, currentUser){
    return posts.isAlreadyUpvoted(post, currentUser);
  }

}]);

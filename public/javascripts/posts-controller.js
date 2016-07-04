angular.module('flapperNews')
.controller('PostsCtrl', [
'$scope',
'posts',
'post',
'auth',
function($scope, posts, post, auth){
  $scope.post = post;
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser();

  $scope.addComment = function(){
    if($scope.body === '') { return; }
    posts.addComment(post._id, {
      body: $scope.body,
      author: 'user',
    }).success(function(comment) {
      $scope.post.comments.push(comment);
    });
    $scope.body = '';
  };

  $scope.isAlreadyUpvoted = function(post, currentUser){
    posts.isAlreadyUpvoted(post, currentUser);
  }

  this.testMessage = "Hello, ctrl";

}]);

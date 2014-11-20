SU.controller('usersWatchingEventController', function($scope, $routeParams, apiService) {
    $scope.event_id = $routeParams.id;
    $scope.type = $routeParams.type;

    $scope.getUsers = function() {
        return apiService.get('/events/listWatchersOrAttendees?id=' + $scope.event_id + '&type=' + $scope.type, null, {
                preventNotifications: true
            })
            .then($scope.assignResultToUsers);
    };

    $scope.assignResultToUsers = function(data) {
        $scope.$apply(function() {
            $scope.users = data;
        });
    };

    if (!$scope.event_id || !$scope.type) {
        $scope.error_message = "oh no!";
    } else {
        $scope.getUsers();
    }
});
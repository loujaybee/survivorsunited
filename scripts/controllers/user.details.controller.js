SU.controller('userDetailsController', function($scope, apiService, utilityService, notifyService) {
    $scope.module = {
        title: "System users",
        description: "Edit users personal details, assigned mentors, severity etc",
    };

    $scope.users = [];
    $scope.updated = {};
    $scope.filters = [];

    $scope.clearFilter = function(notification) {
        if (notification) {
            notifyService.notify('Search filters cleared');
        }

        $scope.filters = [{
            name: "internal",
            value: "All"
        }, {
            name: "severity",
            value: "All"
        }, {
            name: "assigned_mentor",
            value: "All"
        }, {
            name: "sort",
            value: "All"
        }];

        $scope.searchText = "";
    };

    $scope.setFilter = function(name, value) {
        //TODO test
        if (!name || !value || !_.isString(name)) {
            throw new Error('Incorrect parametrs passed to SetFilter');
        }

        var index =
            _.chain($scope.filters)
            .findIndex({
                name: name
            })
            .value();

        if (index === -1) {
            throw new Error('Index for filter not found in user details controller');
        }

        $scope.filters[index].value = value;
    };

    $scope.removeUser = function(user) {

        if (!user || !user._id) {
            throw new Error('user and user id must be passed to removeUser in userDetailsController');
        }

        // TODO: COMPLETE AS DIRECTIVE
        //notifyService.question("Confirm deleting user?");

        return apiService

        // CALL API
            .post('/user/delete', {
            id: user._id
        })

        // FIND USER INDEX FROM SCOPE
        .then(function() {
            return _.findIndex($scope.users, user);
        })

        // REMOVE FROM SCOPE
        .then(function(index_to_remove) {
            $scope.$apply(function() {
                $scope.users.splice(index_to_remove, 1);
            });
        });
    };

    $scope.updatedContact = function(localScope) {
        if (!localScope.user._id) {
            throw new Error('localScope did not have all correct values to update contact in updatedContact');
        }

        var user_id = localScope.user._id;
        var changes = $scope.updated[user_id];
        changes.user_id = changes._id;
        changes = _.omit(changes, 'date_created');
        apiService.post('/user/update', changes);
    };

    // AUTOMATICALLY INVOKED
    $scope.refreshUsers = function(notification) {
        apiService.get('/users/listall', null, {
            preventNotifications: true
        })

        // GET RESULT DATA
        .then(function(result) {
            if (notification) notifyService.notify('Users refreshed');
            return result;
        })

        // ASSIGN RESULTS TO SCOPE VARIABLES
        .then(function(result) {
            $scope.$apply(function() {
                $scope.users = result;
                $scope.original_users = result;


                // TODO: FILTER BY ROLE TYPE
                $scope.mentors = _.filter(result, function(user) {
                    return user.mentor;
                });

                _.each(result, function(user) {
                    $scope.updated[user._id] = user;
                });
            });
        });
    };

    // LAUNCH INIT SCOPE FUNCTIONS
    $scope.clearFilter();
    $scope.refreshUsers();
});
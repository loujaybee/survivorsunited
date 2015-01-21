SU.controller('mainController', function($scope, apiService, $location, notifyService) {

    // WATCH FOR NAV CHANGES AND SETUP SCOPE FOR LEFT PANEL TABBING HIGHLIGHTING
    $scope.region = "Select region";

    // PREFERRED CONTACT MUST BE PRE POPULATED SO THAT IT CAN BE SET IN THE SELECT BOX
    $scope.new_account = {
        contact_method: 'Preferred contact method'
    };

    // USED FOR THE ACTIVE TABS ON THE DASHBOARD
    $scope.$on('$locationChangeSuccess', function() {
        $scope.current_location = $location.path()
            .split('/')[1];
    });

    $scope.createAccount = function() {
        var account = $scope.new_account;
        if (account.password && account.password_confirm && (account.password === account.password_confirm)) {
            apiService
                .post('/user/add', $scope.new_account, {
                    preventNotifications: true
                })
                .then(notifyService.success)
                .caught(notifyService.error);
        } else {
            notifyService.error('Passwords did not match');
        }
    };

    $scope.runSearch = function() {
        $location.path('/search')
            .search({
                search: $scope.search_text
            });
    };

    $scope.toggleSidebar = function() {
        $scope.toggle = !$scope.toggle;
    };

    $scope.routeToLogin = function() {
        $location.path('/login');
    };

    $scope.successfulLogin = function(input) {
        $scope.$apply(function() {
            $location.path('/dashboard');
            $scope.anonymous_user = false;
        });
        return input;
    };

    $scope.bindUserToScope = function(user) {
        $scope.$apply(function() {
            $scope.user_details = user;
        });
    };

    $scope.bootstrapDashboard = function() {
        return apiService
            .get('/user/current', null, {
                preventNotifications: true
            })
            .then($scope.successfulLogin)
            .then($scope.bindUserToScope)
            .caught($scope.routeToLogin);
    };

    $scope.mainLogOut = function() {
        return apiService
            .get('/auth/logout', null, {
                preventNotifications: true
            })
            .then($scope.routeToLogin);
    };

    $scope.mainLogin = function(user) {
        return apiService
            .post('/auth/login', user, {
                preventNotifications: true
            })
            .then($scope.successfulLogin)
            .caught(notifyService.error);
    };

    $scope.bootstrapDashboard();
});
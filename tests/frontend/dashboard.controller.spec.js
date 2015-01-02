describe('dashboardController', function() {

    var scope;
    var chartService;
    var createController;
    var notifyService;
    var apiService;
    var utilityService;
    var userDataService;

    //INCLUDE APP
    beforeEach(module('SU'));

    //INCLUDE APP DEPENDENCIES
    beforeEach(function() {
        module('ngRoute');
        module('angularCharts');
        module('ui.calendar');
    });

    beforeEach(inject(function(_$rootScope_, $controller, _$location_, _utilityService_, _apiService_, _userDataService_) {
        $location = _$location_;
        scope = _$rootScope_.$new();
        $rootScope = _$rootScope_;
        userDataService = _userDataService_;

        apiService = _apiService_;
        utilityService = _utilityService_;

        // MOCK A RETURNED PROMISE
        spyOn(apiService, 'get')
            .and.returnValue(new Promise(function(resolve) {
                return resolve({
                    user: []
                });
            }));
        spyOn(apiService, 'post')
            .and.returnValue(new Promise(function(resolve) {
                return resolve();
            }));

        spyOn(userDataService, 'countStatus');

        createController = function() {
            return $controller('dashboardController', {
                '$scope': scope
            });
        };
    }));

    describe('passScopeToSetup', function() {
        it('functions', function() {
            var controller = createController();
            var results = {
                user: [],
                tasks: []
            };

            scope.passScopeToSetup(results);
            expect(userDataService.countStatus.calls.count())
                .toBe(2);
        });
    });


    describe('updateTask', function() {
        it('throws errors with incorrect parameters', function() {
            var controller = createController();
            expect(function() {
                    scope.updateTask(null, null);
                })
                .toThrow();

            expect(function() {
                    scope.updateTask(null, 'open');
                })
                .toThrow();

            expect(function() {
                    scope.updateTask('id', null);
                })
                .toThrow();
        });
        it('functions properly', function() {
            var controller = createController();
            spyOn(scope, 'bootstrap');
            spyOn(scope, 'passScopeToSetup');
            scope.updateTask('id', 'open');
            expect(apiService.post)
                .toHaveBeenCalled();
        });
    });
});
'use strict';

angular.module('wrwdApp')
  .directive('wrwdLayout', () => ({
    templateUrl: 'components/wrwd/wrwd.html',
    restrict: 'E',
    controller: 'WrwdController',
    controllerAs: 'wrwdCtrl'
  }));

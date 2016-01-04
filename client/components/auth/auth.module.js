'use strict';

angular.module('wrwdApp.auth', [
  'wrwdApp.constants',
  'wrwdApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });

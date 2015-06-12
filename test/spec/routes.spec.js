/**
*   Router Spec Test
*/


define(function(require) {
  'use strict';

  var router = require('client/scripts/routes');

  describe('Router', function() {

    it('provides the "Router" instance', function() {
      // Expect it to exist
      expect(router).to.be.ok;
    });

  });
});

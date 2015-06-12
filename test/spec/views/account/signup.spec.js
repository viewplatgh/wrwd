/**
*   Signup View Spec Test
*/


define(function(require) {
  'use strict';

  var SignupView = require('client/scripts/views/account/signup');

  describe('Signup View', function() {

    beforeEach(function() {
      this.signupView = new SignupView();
    });

    it('provides the "Signup View" instance', function() {
      // Expect it to exist
      expect(this.signupView).to.be.ok;
    });

  });
});

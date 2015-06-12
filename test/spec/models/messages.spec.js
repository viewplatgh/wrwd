/**
*   Messages Model Spec Test
*/


define(function(require) {
  'use strict';

  var messagesModel = require('client/scripts/models/messages');

  describe('Messages Model', function() {

    it('provides the "Messages Model" instance', function() {
      // Expect it to exist
      expect(messagesModel).to.be.ok;
    });

  });
});

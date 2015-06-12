/**
*   Messages View Spec Test
*/


define(function(require) {
  'use strict';

  var MessagesView = require('client/scripts/views/modules/messages');

  describe('Messages View', function() {

    beforeEach(function() {
      this.messagesView = new MessagesView();
    });

    it('provides the "Messages View" instance', function() {
      // Expect it to exist
      expect(this.messagesView).to.be.ok;
    });

  });
});

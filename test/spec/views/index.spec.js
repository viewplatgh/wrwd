/**
*   Index View Spec Test
*/


define(function(require) {
  'use strict';

  var IndexView = require('client/scripts/views/index');

  describe('Index View', function() {

    beforeEach(function() {
      this.indexView = new IndexView();
    });

    it('provides the "Index View" instance', function() {
      // Expect it to exist
      expect(this.indexView).to.be.ok;
    });

  });
});

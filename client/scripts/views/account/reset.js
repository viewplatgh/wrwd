define(function(require) {
  'use strict';

  var user = require('../../models/user');

  var Reset = Backbone.View.extend({

    el: '.content',

    template: JST['client/templates/account/reset.hbs'],

    events: {
      'submit form': 'formSubmit'
    },

    initialize: function() {
      this.render();
    },

    formSubmit: function(e) {
      e.preventDefault();
      var $form = $(e.currentTarget);
      user.reset($form);
    },

    render: function() {
      this.$el.html(this.template);
      return this;
    }

  });

  return Reset;

});

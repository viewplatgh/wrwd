define(function(require) {
  'use strict';

  var user = require('../../models/user');

  var Forgot = Backbone.View.extend({

    el: '.content',

    template: JST['client/templates/account/forgot.hbs'],

    events: {
      'submit form': 'formSubmit'
    },

    initialize: function() {
      this.render();
    },

    formSubmit: function(e) {
      e.preventDefault();
      var $form = $(e.currentTarget);
      user.forgot($form);
    },

    render: function() {
      this.$el.html(this.template);
      return this;
    }

  });

  return Forgot;

});

define(function(require) {
  'use strict';

  var user = require('../../models/user');
  var messages = require('../../models/messages');

  var Settings = Backbone.View.extend({

    el: '.content',

    template: JST['client/templates/account/settings.hbs'],

    events: {
      'submit #profile-form': 'formInfo',
      'submit #password-form': 'formPassword',
      'submit #delete-form': 'formDelete',
    },

    initialize: function() {
      this.render();
    },

    formInfo: function(e) {
      e.preventDefault();
      var $form = $(e.currentTarget);
      user.updateSettings($form);
    },

    formPassword: function(e) {
      e.preventDefault();
      var $form = $(e.currentTarget);
      user.updatePassword($form);
    },

    formDelete: function(e) {
      e.preventDefault();
      user.destroy({
        success: function(res) {
          user.logout();
          Backbone.history.navigate('/', {trigger: true});
        },
        complete: function(res) {
          messages.setMessages(res.responseJSON);
        }
      });
    },

    render: function() {
      this.$el.html(this.template({
        user: user.toJSON()
      }));
      return this;
    }

  });

  return Settings;

});

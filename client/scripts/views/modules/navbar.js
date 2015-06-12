define(function(require) {
  'use strict';

  var user = require('../../models/user');

  var Navbar = Backbone.View.extend({

    el: '.main-nav',

    template: JST['client/templates/modules/navbar.hbs'],

    events: {
      'click #logoutLink': 'handleLogout'
    },

    initialize: function() {
      // Re-render template when user model changes
      this.listenTo(user, 'change', this.render);
      this.render();
    },

    handleLogout: function(e) {
      e.preventDefault();
      user.logout();
    },

    render: function() {
      this.$el.html(this.template({
        loggedIn: user.get('loggedIn'),
        user: user.toJSON()
      }));
      return this;
    }

  });

  return Navbar;

});

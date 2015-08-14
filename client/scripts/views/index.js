define(function() {
  'use strict';

  var IndexView = Backbone.View.extend({

    el: '.content',

    template: JST['client/templates/index.hbs'],

    events: {},

    initialize: function() {
      //this.render();
    },

    render: function() {
      this.$el.html(this.template);
      return this;
    }

  });

  return IndexView;
});

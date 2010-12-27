
(function($) {
	
/* KEY constant copied from jquery autocomplete: 
 * http://bassistance.de/jquery-plugins/jquery-plugin-autocomplete/
*/
var KEY = {
  UP: 38,
  DOWN: 40,
  DEL: 46,
  TAB: 9,
  ENTER: 13,
  ESC: 27,
  COMMA: 188,
  PAGEUP: 33,
  PAGEDOWN: 34,
  BACKSPACE: 8
};
 
$.fn.livesearch_input_dropdown = function(options) {
  options = options || {};
  return $(this).each(function() {
    var input_dropdown = $(this).data('livesearch.input_dropdown');
		if (!input_dropdown) {
		  input_dropdown = new InputDropdown($(this), options);
			$(this).data('livesearch.input_dropdown', input_dropdown);
		}
  });
};

function InputDropdown($elem, options) {
	this.$elem = $elem;
  
  this.options = $.extend({
    update_input: true,
    no_results_html: 'Sorry, we couldn\'t find anything.'
  }, options);

  if(this.$elem.siblings('.results').length) {
    this.$results = this.$elem.siblings('.results');
    this.$results.find('div.no_results').remove();
  } else {
    this.$results = $('<div class="results"></div>');
    this.$elem.after(this.$results);
  }
  if(!this.$results.find('ul.result_list').length) {
    this.$results.append('<ul class="result_list"></ul>');
  }
  this.$no_results = $('<div class="no_results">' + this.options.no_results_html + '</div>');
  this.$no_results.hide();
  this.$results.append(this.$no_results);

  // css should do this
  //this.$results.hide();
  //this.$results.width(this.$elem.outerWidth());

  this.livesearch = $elem.livesearch(this.options).data('livesearch');
  this._attach();
}

$.extend(InputDropdown.prototype, {
  _attach: function() {
    var _this = this;
    this.$elem.bind('livesearch:results', function(e, results) {
      _this.show_results(results);
    });

    this.bind_results();

    this.$elem.bind(($.browser.opera ? "keypress" : "keydown") + ".autocomplete", function(e) {
      var something_selected = !!_this.$results.find('.selected').length;
      switch(e.keyCode) {
        case KEY.UP:
          if(something_selected) {
            var $prev = _this.$results.find('.selected').prev(':not(.not_result)');
            if(!$prev.length) $prev = _this.$results.find('li:not(.not_result)').last();
            _this.select($prev, false);
          } else {
            _this.select(_this.$results.find('li:not(.not_result)').last(), false);
          }
          e.preventDefault();
          break;
        case KEY.DOWN:
          if(something_selected) {
            var $next = _this.$results.find('.selected').next(':not(.not_result)');
            if(!$next.length) $next = _this.$results.find('li:not(.not_result)').first();
            _this.select($next, false);
          } else {
            _this.select(_this.$results.find('li:not(.not_result)').first(), false);
          }
          e.preventDefault();
          break;
        case KEY.ENTER:
            // we want to trigger the selected event
            _this.select(_this.$results.find('.selected'), true);
            e.preventDefault();
          break;
        default:
          break;
      }
    });
  },

  bind_results: function() {
    var _this = this;

    this.$results.find('li').bind('click', function() {
      _this.select($(this), true);
    });
    
    this.$results.find('li').bind('mouseover', function() {
      _this.select($(this));
      _this.unselect_on_mouseout = true;
    });

    this.$results.bind('mouseout', function() {
      if(_this.unselect_on_mouseout) {
        _this.unselect_currently_selected();
      }
    });
  },

  /* Accepts an array of results, and returns an array of result
   * names (strings)
   */
  build_result_names_list: function(results) {
    var result_names = [];
    var _this = this;
    $.each(results, function() {
      var name = this;
      if(_this.options.return_name_from_result) {
        name = _this.options.return_name_from_result(this);
      } else if(this != 'string') {
        name = this[0];
      }
      result_names.push(name);
    });

    return result_names;
  },

  show_results: function(results) {
    var _this = this;

    var $results_ul = this.$results.children('ul');
    this.unselect_currently_selected();
    $results_ul.empty();

    if(!results.length) {
      this.$no_results.show();
      $results_ul.hide();
    } else {
      this.$no_results.hide();
      $results_ul.show();
    }

    var result_names = this.build_result_names_list(results);

    $.each(result_names, function(index) {
      var name = this;
      var $li = $('<li>' + name + '</li>');
      $li.data('livesearch_result', results[index]);
      $results_ul.append($li);
    });

    this.bind_results();

    this.$results.slideDown();
  },

  unselect_currently_selected: function() {
    var $results_ul = this.$results.children('ul');
    var $last_selected = $results_ul.children('li.selected');
    $last_selected.trigger('livesearch:unselect');
    $last_selected.removeClass('selected');
    // We're here because of a mouseout, or because the user selected something with
    // the keyboard, or clicking. In either case, we don't want to unselect on the
    // next mouseout.
    this.unselect_on_mouseout = false;
  },

  // There are two kinds of selects:
  // - Hard selects, these are triggered by clicks or the enter key. They
  //   trigger the select event.
  // - Soft selects, these are triggered by arrowing up or down. They do not
  //   trigger the select event.
  select: function($li, trigger) {
    var _this = this;
    if($li.is('.not_result')) return;
    var $results_ul = this.$results.children('ul');

    this.unselect_currently_selected();

    $li.addClass('selected');

    if(this.options.update_input) {
      this.livesearch.suspend_while(function() {
        _this.$elem.val($li.text());
        _this.$elem.focus();
      });
    }
    $li.trigger('livesearch:soft_select');
    if(trigger) $li.trigger('livesearch:selected', [$li.data('livesearch_result')]);
  }
});

})(jQuery);

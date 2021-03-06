(function ($) {

/*
 * Behavior:
 *
 * A user starts typing into an input, when they stop typing, a list of matching pages are
 * displayed. The user can select an entry with the up and down arrow key and hit enter,
 * or they can click a result. When a result is selected, the corresponding url is navigated
 * to.
 *
 * Requirements:
 *
 * jquery.livesearch
 * jquery.livesearch.input_dropdown
 * jquery.livesearch.pretty_input_dropdown
 *
 * Expected markup:
 *
 * <form>
 *   <div>
 *     <span class='ss-icon ss-search'></span>
 *     <span class='ss-icon ss-delete'></span>
 *     <input></input>
 *     <div class='results'></div>
 *   </div>
 * </form>
 *
 * Expected JSON response from the XHR:
 *
 * [
 *   ['Title of page', 'http://url/'],
 *   ['Title of another page', 'http://url2/']
 * ]
 *
 */

  $.fn.livesearch_navigator = function (options) {
    options = options || {};
    return $(this).each(function () {
      var $form = $(this);

      $form.livesearch_pretty_input_dropdown(options);

      $form.on('livesearch:selected', function (e, data) {
        if (data) {
          window.location = data[1];
        }
      });
    });
  };

}(jQuery));

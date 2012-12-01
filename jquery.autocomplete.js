/**
* jQuery Autocomplete by Avais Sethi
* See README.md for details
*/

(function($) {

	//attach method to jQuery
	$.fn.autocomplete = function(settings) {
		
		//set some variables
		var selected_li = -1;
		var $this = this;

		//default config
		var config = {
			top: this.position().top + $this.height() + 15,
			left: this.position().left,
			minWidth: this.width(),
			listClass: 'jquery-autocomplete-list',
			selectedClass: 'jquery-autocomplete-selected'
		};

		//override config with user settings
		$.extend(config, settings);

		//create the ul element
		this.after('<ul />');

		//do some styling!
		this.siblings('ul').first()
			.addClass(config.listClass)
			.css('position', 'absolute')
			.css('top', config.top)
			.css('left', config.left)
			.css('min-width', config.minWidth);

		//to clear the list if the textbox is left
		this.focusout(function() {
			$this.siblings('ul').first().html('');
		});

		//here's the meat and potatoes of the plugin
		this.keydown(function(event) {

			$this.prop('autocomplete', 'off');  //turn of the browser's autocomplete

			//we'll be using these variables throughout the function
			var current_li = selected_li;
			var ul = $this.siblings('ul').first();
			var lis = ul.children('li');

			try {

				switch ( event.keyCode ) {  //what key is being pressed?

					case 38:  //up arrow
						
						lis.eq(current_li).removeClass(config.selectedClass);  //remove class from current item
						current_li--;  //decrement since we're moving up the list
						
						//check if we've hit the top
						if ( current_li < 0 ) {
							current_li = -1;
						} else {
							lis.eq(current_li).addClass(config.selectedClass);  //add class to new current item
						}
					
					break;

					case 40:  //down arrow
						
						lis.eq(current_li).removeClass(config.selectedClass);  //remove class from current item
						current_li++;  //increment since we're moving down the list
						if ( current_li > (lis.length - 1) ) current_li = lis.length - 1;  //check if we've hit the bottom
						lis.eq(current_li).addClass(config.selectedClass).focus();  //add class to new current item
					
					break;

					case 13:  //enter
						
						if ( current_li >= 0 ) {  //make sure an item is selected
							$this.val(lis.eq(current_li).text());  //set the value of the textbox to the value of the selected item
							if ( config.enter ) config.enter(lis.eq(current_li).data('key'));  //return the key to the callback function if there is one
						} 

						ul.html('');  //clear the list
					
					break;

					//some keys to ignore
					case 93:
					case 18:
					case 91:  
					case 9: 
						//do nothing
					break;

					default:  //any other key

						//get items from config if set
						//items can be either a callback function or an array of objects so we need to do some checking
						var items = function() {  
							
							if ( config.items ) {
								if ( $.isFunction(config.items) ) {
									return config.items($this.val());
								} else {
									return config.items;
								}
							} else {
								return [];
							}
						
						}();

						var html = '';  //the inner html of the ul

						if ( config.ajax ) {  //check if an ajax object was provided
							
							$.ajax({
								
								//set up our ajax request
								url: config.ajax.url,
								type: config.ajax.method || 'get',
								data: config.ajax.query($this.val())  //query must be a call back function the create a query string and can use the value of the textbox
								
							}).done(function(data) {  //success!
								
								try {
									
									if ( data != false ) {  //make sure there is some data

										var data = JSON.parse(data);  //decode
										items = items.concat(data);  //concat with items array

										//loop through the items and create some lis
										for ( var i = 0; i < items.length; i++ ) { 
											html += '<li data-id="'+items[i].id+'">'+items[i].value+'</li>';
										}

										ul.html(html);  //fill the ul
									} 

								} catch (e) {
									console.log(data);
								}
							
							});

						} else {  //if there is no ajax object just use the items array

							//loop through the items and create some lis
							for ( var i = 0; i < items.length; i++ ) {
								html += '<li data-id="'+items[i].id+'">'+items[i].value+'</li>';
							}

							ul.html(html);  //fill the ul

						}

					break;

				}
			} catch (e) {
				console.log(e.message);
			}

			selected_li = current_li;
				
		});

		return this;  //make sure to maintain chainability!

	}

})(jQuery);
$(function() {
   $('#login').click(function(event){
	//login
	inpherapi_login($('#username').val(),$('#password').val(), function (data) {
		window.location ="../index.html";
	});

	event.preventDefault(); // avoid to execute the actual submit of the form.
	});
});

$(function() {
   $('#register').click(function(event){
	//login
	inpherapi_anon_post('/register',{username: $('#username').val(), password: $('#password').val()}, function (data) {
		inpherapi_login($('#username').val(),$('#password').val(), function (data) {
			window.location ="../index/file-list.html";
		});
	});

	event.preventDefault(); // avoid to execute the actual submit of the form.
	});
});
$(function() {
	$('#listDir').click(function (argument) {
		$('#page-wrapper').load('pages/file-list.html');
	});
	$('#page-wrapper').load('pages/file-list.html');
});


$(function() {

	$('#side-menu').metisMenu();

});

//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
$(function() {
	$(window).bind("load resize", function() {
		var topOffset = 50;
		var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
		if (width < 768) {
			$('div.navbar-collapse').addClass('collapse');
			topOffset = 100; // 2-row-menu
		} else {
			$('div.navbar-collapse').removeClass('collapse');
		}

		var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
		height = height - topOffset;
		if (height < 1) height = 1;
		if (height > topOffset) {
			$("#page-wrapper").css("min-height", (height) + "px");
		}
	});

	var url = window.location;
	var element = $('ul.nav a').filter(function() {
		return this.href == url;
	}).addClass('active').parent().parent().addClass('in').parent();
	if (element.is('li')) {
		element.addClass('active');
	}
});



$(function(){
	$('.button-checkbox').each(function(){
		var $widget = $(this),
			$button = $widget.find('button'),
			$checkbox = $widget.find('input:checkbox'),
			color = $button.data('color'),
			settings = {
					on: {
						icon: 'glyphicon glyphicon-check'
					},
					off: {
						icon: 'glyphicon glyphicon-unchecked'
					}
			};

		$button.on('click', function () {
			$checkbox.prop('checked', !$checkbox.is(':checked'));
			$checkbox.triggerHandler('change');
			updateDisplay();
		});

		$checkbox.on('change', function () {
			updateDisplay();
		});

		function updateDisplay() {
			var isChecked = $checkbox.is(':checked');
			// Set the button's state
			$button.data('state', (isChecked) ? "on" : "off");

			// Set the button's icon
			$button.find('.state-icon')
				.removeClass()
				.addClass('state-icon ' + settings[$button.data('state')].icon);

			// Update the button's color
			if (isChecked) {
				$button
					.removeClass('btn-default')
					.addClass('btn-' + color + ' active');
			}
			else
			{
				$button
					.removeClass('btn-' + color + ' active')
					.addClass('btn-default');
			}
		}
		function init() {
			updateDisplay();
			// Inject the icon if applicable
			if ($button.find('.state-icon').length == 0) {
				$button.prepend('<i class="state-icon ' + settings[$button.data('state')].icon + '"></i> ');
			}
		}
		init();
	});
});
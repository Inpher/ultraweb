var INPHER_REST_URL="https://api.inpher.io/ultraRest";

/** Simple function to print an error message in the console */
function print_error(error) {
    console.log("An error occured:", error);
    $('#alertContainer').bs_alert(error.responseText);

}
/**
 * Simple function to print its argument in the console (may be used as
 * a debug (or default) callback
 */
function dump(data) {
    console.log("Result:",data);
}

/**
 * anonymous ajax call:
 * - INPHER_REST_URL is prepended to path
 * - callback is called when done
 * - options are passed to JQuery ajax call
 */
function inpherapi_anon_ajax(path, callback, options) {
    var opt = (options===undefined)?{}:options;
    opt.url = INPHER_REST_URL + path;
    console.log("Sending Ajax Request: ",opt);
    $.ajax(opt).done(callback).fail(print_error);
}

/**
 * Same, but with the auth_token header
 */
function inpherapi_auth_ajax(path, callback, options) {
    var opt = (options===undefined)?{}:options;
    if (opt.headers===undefined) opt.headers={};
    options.headers.auth_token=sessionStorage.getItem('auth_token');
    if (!options.headers.auth_token) return print_error('Not Logged In!');
    opt.url = INPHER_REST_URL + path;
    console.log("Sending Ajax Request: ",opt);
    $.ajax(opt).done(callback).fail(print_error);
}

/**
 * anonymous ajax get.
 * data is appended url-encoded to the query string
 */
function inpherapi_anon_get(path, data, callback, options) {
    var opt = (options===undefined)?{}:options;
    opt.data=data;
    opt.method='GET';
    inpherapi_anon_ajax(path, callback, opt);
}

/**
 * anonymous ajax post.
 * data is sent url-encoded as the body
 */
function inpherapi_anon_post(path, data, callback, options) {
    var opt = (options===undefined)?{}:options;
    opt.data=data;
    opt.method='POST';
    inpherapi_anon_ajax(path, callback, opt);
}

/**
 * anonymous ajax post.
 * data serialized and sent as application/json as the body
 */
function inpherapi_anon_post_json(path, data, callback, options) {
    var opt = (options===undefined)?{}:options;
    opt.method='POST';
    opt.contentType='application/json';
    opt.data=JSON.stringify(data);
    inpherapi_anon_ajax(path, callback, opt);
}

function inpherapi_auth_get(path, data, callback, options) {
    var opt = (options===undefined)?{}:options;
    opt.data=data;
    opt.method='GET';
    inpherapi_auth_ajax(path, callback, opt);
}

function inpherapi_auth_post(path, data, callback, options) {
    var opt = (options===undefined)?{}:options;
    opt.data=data;
    opt.method='POST';
    inpherapi_auth_ajax(path, callback, opt);
}

function inpherapi_auth_delete(path, data, callback, options) {
    var opt = (options===undefined)?{}:options;
    //warning, data will be passed in the query string
    opt.data=undefined;
    opt.method='DELETE';
    inpherapi_auth_ajax(path+'?'+$.param(data), callback, opt);
}

function inpherapi_auth_post_json(path, data, callback, options) {
    var opt = (options===undefined)?{}:options;
    opt.method='POST';
    opt.contentType='application/json';
    opt.data=JSON.stringify(data);
    inpherapi_auth_ajax(path, callback, opt);
}

/**
 * logs-in:
 *  Calls the login function, add username and auth_token to the
 *  sessionStorage, and calls the callback upon success
 */
function inpherapi_login(username, password, callback) {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('auth_token');
    return inpherapi_anon_post('/login',{username:username,password:password},next);
    function next(data) {
	sessionStorage.setItem('username',data.username);
	sessionStorage.setItem('auth_token',data.auth_token);
	if (callback!==undefined) return callback(data);
    }
}

/**
 * logs-out:
 *  Calls the logout function, remove username and auth_token from the
 *  sessionStorage, and calls the callback upon success
 */
function inpherapi_logout(callback) {
    return inpherapi_auth_post('/logout',{},next);
    function next(data) {
	sessionStorage.removeItem('username');
	sessionStorage.removeItem('auth_token');
	if (callback!==undefined) return callback(data);
    }
}

function inpherapi_listGroups(callback) {
    inpherapi_auth_get("/listGroups", undefined, callback, undefined );
}


function inpherapi_createSharingGroup(name, usersList, callback){
  var replace = {groupName:name, usernames:usersList};
  inpherapi_auth_post_json("/createSharingGroup", {groupName:name, usernames:usersList}, callback, undefined);
}

(function($){
    $.fn.extend({
        bs_alert: function(message, title){
            var cls='alert-danger';
            var html='<div class="alert '+cls+' alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
            if(typeof title!=='undefined' &&  title!==''){
                html+='<h4>'+title+'</h4>';
            }
            html+='<span>'+message+'</span></div>';
            $(this).html(html);
        },
        bs_warning: function(message, title){
            var cls='alert-warning';
            var html='<div class="alert '+cls+' alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
            if(typeof title!=='undefined' &&  title!==''){
                html+='<h4>'+title+'</h4>';
            }
            html+='<span>'+message+'</span></div>';
            $(this).html(html);
        },
        bs_info: function(message, title){
            var cls='alert-info';
            var html='<div class="alert '+cls+' alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
            if(typeof title!=='undefined' &&  title!==''){
                html+='<h4>'+title+'</h4>';
            }
            html+='<span>'+message+'</span></div>';
            $(this).html(html);
        }
    });
})(jQuery);


$(function() {

    $('#registerTgl').on('shown.bs.tab', function (e) {
        $('#registerForm').validator();
    });

   $('#loginForm').submit(function(event){
	//login
	inpherapi_login($('#usernameLogin').val(),$('#passwordLogin').val(), function (data) {
		window.location ="list.html";
	});
    event.stopPropagation();
	event.preventDefault(); // avoid to execute the actual submit of the form.
   });

   $('#registerForm').submit(function(event){
	//register
	inpherapi_anon_post('/register',{username: $('#usernameRegister').val(), password: $('#passwordRegister').val()}, function (data) {
		if(data.status != 'success'){
            $('#alertContainer').bs_alert(data);
		}

        // login
		inpherapi_login($('#usernameRegister').val(),$('#passwordRegister').val(), function (data) {
			window.location ="list.html";
		});
	});

    event.stopPropagation();
	event.preventDefault(); // avoid to execute the actual submit of the form.
   });
   $('#logout').click(function(event){
    //login
    inpherapi_auth_post('/logout','', function (data) {
        window.location ="login.html";
    });

    event.preventDefault(); // avoid to execute the actual submit of the form.
   });
});

var state = {};
var ui = {};
ui.loadedDiv = null;
ui.loadedDivId = null;

function showDiv(id) {
    if (id == ui.loadedDivId) return;
    var nextDiv = $('#'+id);
    if (nextDiv.length==0) return console.log('this div does not exist',id);
    if (ui.loadedDivId) ui.loadedDiv.hide();
    ui.loadedDiv = nextDiv;
    ui.loadedDivId = id;
    nextDiv.show();
}

$(function() {
    $('#main-container>div').hide();
    showDiv('file-list-page');
});

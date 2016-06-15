var INPHER_REST_URL="https://api.inpher.io/ultraRest";

function print_error(error) {
    console.log("An error occured:",error);
}
function dump(data) {
    console.log("Result:",data);
}

function inpherapi_anon_ajax(path, callback, options) {
    var opt = (options===undefined)?{}:options;
    opt.url = INPHER_REST_URL + path;
    console.log("Sending Ajax Request: ",opt);
    $.ajax(opt).done(callback).fail(print_error);    
}

function inpherapi_auth_ajax(path, callback, options) {
    var opt = (options===undefined)?{}:options;
    if (opt.headers===undefined) opt.headers={};
    options.headers.auth_token=sessionStorage.getItem('auth_token');
    if (!options.headers.auth_token) return print_error('Not Logged In!');
    opt.url = INPHER_REST_URL + path;
    console.log("Sending Ajax Request: ",opt);
    $.ajax(opt).done(callback).fail(print_error);    
}

function inpherapi_anon_get(path, data, callback, options) {
    var opt = (options===undefined)?{}:options;
    opt.data=data;
    opt.method='GET';
    inpherapi_anon_ajax(path, callback, opt);
}

function inpherapi_anon_post(path, data, callback, options) {
    var opt = (options===undefined)?{}:options;
    opt.data=data;
    opt.method='POST';
    inpherapi_anon_ajax(path, callback, opt);
}

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

function inpherapi_auth_post_json(path, data, callback, options) {
    var opt = (options===undefined)?{}:options;
    opt.method='POST';
    opt.contentType='application/json';
    opt.data=JSON.stringify(data);
    inpherapi_auth_ajax(path, callback, opt);
}

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

function inpherapi_logout(callback) {
    return inpherapi_auth_post('/logout',{},next);
    function next(data) {
	sessionStorage.removeItem('username');
	sessionStorage.removeItem('auth_token');
	if (callback!==undefined) return callback(data);
    }
}



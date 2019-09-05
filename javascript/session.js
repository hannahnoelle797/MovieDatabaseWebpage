$(document).ready(function(){

// ========================================
//      VARIABLES
// ========================================

	var api_key = "31efca270b7ea62e0ed3f071ee5c5d59";
	var token_url = "https://api.themoviedb.org/3/authentication/token/new?api_key=";
	var session_url = "https://api.themoviedb.org/3/authentication/session/new?api_key=";
	var account_url = "https://api.themoviedb.org/3/account?api_key=";
	var authe_url = "https://www.themoviedb.org/authenticate/";
	var redir_url = "https://tmdb.snuffleupagus.us/dev/atomason/";
	var location = window.location.href;

// ========================================
//      CHECK ON LOAD
// ========================================	

	// else if "denied=true"
	if (location.includes("approved=true")) {
		var request_url = session_url + api_key;
		var request_token = getCookie("request_token");
		
		$.ajax({
			"async": true,
			"crossDomain": true,
			"url": request_url,
			"method": "POST",
			"headers": {"content-type": "application/json"},
			"processData": false,
			"data": `{"request_token": "${request_token}"}`,
		
		}).done(function(response, status, xhr) {	
			createCookie("session_id", response.session_id, 0);
			var session_id = "&session_id=" + getCookie("session_id");
			var request_url = account_url + api_key + session_id;
		
			$.getJSON({
				url: request_url,
			
			}).done(function(response, status, xhr) {
				createCookie("username", response.username, 0);
				createCookie("account_id", response.id, 0);
				window.location.replace(redir_url);
			
			}).fail(function(xhr, status, error) {
				console.error("Error:", error);
			});
			
		}).fail(function(xhr, status, error) {
			console.error("Error:", error);
		
		});
	};
	
	if (getCookie("session_id")) {
		$("#menu-item-login").hide();
		$("#menu-item-logout").show();
		$("#menu-item-favorites").show();
		$("#menu-item-watchlist").show();
	};
	
// ========================================
//      EVENTS
// ========================================

	$("#menu-item-link-login").click(function() {
		$.getJSON({
			url: token_url + api_key,
		
		}).done(function(response, status, xhr) {
			var token = response.request_token;
			createCookie("request_token", token, 0);
			window.location.replace(authe_url + token + "?redirect_to=" + redir_url);
		
		}).fail(function(xhr, status, error) {
			console.error("Error:", error);
		
		});	
	});
	
	$("#menu-item-link-logout").click(function() {
		destroyCookie("username");
		destroyCookie("account_id");
		destroyCookie("session_id");
		window.location.href = redir_url;
	});

// ========================================
//      COOKIES - NAHM NAHM NAHM =P
// ========================================
	
	function createCookie(key, value, days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			var expires = "; expires=" + date.toGMTString();
		} else {
			var expires = "";
		};
		document.cookie = key + "=" + value + expires + "; path=/";
	};
	
	function getCookie(key) {
		var key = key + "=";
		var cookie_array = document.cookie.split(';');
		for(var i = 0; i < cookie_array.length; i++) {
			var cookie = cookie_array[i];
			while (cookie.charAt(0)==' ') {
				cookie = cookie.substring(1, cookie.length);
			};
			if (cookie.indexOf(key) == 0) {
				return cookie.substring(key.length, cookie.length);
			};
		};
		return null;
	};
	
	function destroyCookie(key) {
		createCookie(key, "", -1);
	};
});
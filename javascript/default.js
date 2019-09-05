var request;
var response;
var theme;

$(document).ready(function(){

	// RESET ON PAGE REFRESH.
	$("#search-category").prop('selectedIndex', 0);
	$("#search-input").prop('value', "");
	
// ========================================
//      VARIABLES
// ========================================

	var api_key = "31efca270b7ea62e0ed3f071ee5c5d59"
	var language = "&language=en-US";

	var search_array = [
		"https://api.themoviedb.org/3/search/multi?api_key=",
		"https://api.themoviedb.org/3/search/movie?api_key=",
		"https://api.themoviedb.org/3/search/tv?api_key=",
		"https://api.themoviedb.org/3/search/person?api_key=",
	];
	
	var movie_array = [
		"https://api.themoviedb.org/3/movie/popular?api_key=",
		"https://api.themoviedb.org/3/movie/upcoming?api_key=",
		"https://api.themoviedb.org/3/movie/now_playing?api_key=",
		"https://api.themoviedb.org/3/movie/top_rated?api_key=",
	];
	
	var tv_array =[
		"https://api.themoviedb.org/3/tv/airing_today?api_key=",
		"https://api.themoviedb.org/3/tv/on_the_air?api_key=",
		"https://api.themoviedb.org/3/tv/popular?api_key=",
		"https://api.themoviedb.org/3/tv/top_rated?api_key=",
	];
	
	var people_array = [
		"https://api.themoviedb.org/3/person/popular?api_key=",
	];
	
	var favorite_array = [
		"https://api.themoviedb.org/3/account/{account_id}/favorite/movies?api_key=",
		"https://api.themoviedb.org/3/account/{account_id}/favorite/tv?api_key=",
	];
	
	var watchlist_array = [
		"https://api.themoviedb.org/3/account/{account_id}/watchlist/movies?api_key=",
		"https://api.themoviedb.org/3/account/{account_id}/watchlist/tv?api_key=",
	];
	
// ========================================
//      EVENTS
// ========================================
	
	$("#theme-switch-link").click(function() {
		if ($("body").attr('class') == "light_stars") {
			$("#theme-switch-link").html("<i class=\"fas fa-toggle-on\"></i>Dark Theme");
			$("body").attr('class', "dark_stars");
		} else {
			$("#theme-switch-link").html("<i class=\"fas fa-toggle-off\"></i>Dark Theme");
			$("body").attr('class', "light_stars");
		};
	});
	
	$("a.menu-subitem-link").click(function() {
		var index = $(this).attr('data-index');
		var parent = $(this).attr('data-parent');
		var parent_array = eval(parent + "_array");
		request = parent_array[index];
		
		if (["favorite", "watchlist"].indexOf(parent) >= 0) {
			var account_id = getCookie("account_id");
			request = request.replace("{account_id}", account_id);
		};
		
		request += api_key + language;
		
		if (["favorite", "watchlist"].indexOf(parent) >= 0) {
			var session_id = getCookie("session_id");
			request += "&session_id=" + session_id;
		};
		
		request = request + "&page=";
		getQueryResults(request, 1, true);
	});
	
	$("#search-input").keypress(function(event) {
		if (event.which == 13) {
			event.preventDefault();
			if ($("#search-input").val()) {
				var query = "&query=" + $("#search-input").val().replace(/\s+/g, '+');
				request = search_array[$("#search-category").prop('selectedIndex')];
				request = request + api_key + language + query + "&page=";
				getQueryResults(request, 1, true);
			} else {return};
		};
	});
	
	$("#search-button").click(function() {
		if ($("#search-input").val()) {
			var query = "&query=" + $("#search-input").val().replace(/\s+/g, '+');
			request = search_array[$("#search-category").prop('selectedIndex')];
			request = request + api_key + language + query + "&page=";
			getQueryResults(request, 1, true);
		} else {return};
	});
	
	$("#view").on('click', "a", function() {
		var selected_view = $(this).text().toLowerCase();
		var current_view = $("section#results").prop('class');
		$("section#results").removeClass(current_view).addClass(selected_view);
		$("a.selected-view").toggleClass("selected-view");
		$(this).toggleClass("selected-view");
	});
	
	$("section#results").on('click', 'a.result-detail-link', function() {
		var title = $(this).attr('data-id');
		var type  = $(this).attr('data-type');
		
		var query = "https://api.themoviedb.org/3/{type}/{id}?api_key=";
		query = query.replace("{type}", type);
		query = query.replace("{id}", title);
		query = query + api_key + language;
		getQueryDetails(query, type)
	});
	
	$("section#details").on('click', "a.detail-favorite, a.detail-watchlist", function() {
		var query_type = $(this).attr('class').split("-")[1];
		var account_id = getCookie("account_id");
		var session_id = getCookie("session_id");
	
		var request_url = "https://api.themoviedb.org/3/account/";
		request_url += `${account_id}/${query_type}?api_key=`;
		request_url += api_key + "&session_id=" + session_id;
		
		var data_id = $(this).attr('data-id');
		var data_type = $(this).attr('data-type');
		var data_append = ($(this).attr('data-append') == "true");
		
		$.ajax({
			"async": true,
			"crossDomain": true,
			"url": request_url,
			"method": "POST",
			"headers": {"content-type": "application/json"},
			"processData": false,
			"data": `{
				"media_type": "${data_type}",
				"media_id": ${data_id},
				"${query_type}": ${data_append}}`
				
		}).done(function(data, status, xhr) {
			var class_name = "";
			var section_name = "";
			var section_icon = "";
			
			if (query_type == "favorite") {
				class_name = ".detail-favorite";
				section_name = "Favorites";
				section_icon = [
					"fas fa-star",
					"far fa-star",
				];
			} else {
				class_name = ".detail-watchlist";
				section_name = "Watch List";
				section_icon = [
					"fas fa-bookmark",
					"far fa-bookmark",
				];
			};
		
			if (data_append) {
				$(`${class_name}`).attr('data-append', false);
				$(`${class_name}`).prop('title', `Remove from ${section_name}`);
				$(`${class_name}`).html(`<i class="${section_icon[0]}"></i>`);
			} else {
				$(`${class_name}`).attr('data-append', true);
				$(`${class_name}`).prop('title', `Add to ${section_name}`);
				$(`${class_name}`).html(`<i class="${section_icon[1]}"></i>`);
			};
			
			var section = request.split("/")[6]
			if (["favorite", "watchlist"].indexOf(section) >= 0) {
				getQueryResults(request, 1, true);
			};
		
		}).fail(function(xhr, status, error) {
			console.error("Error:", error);
		
		});
		
	});
	
	$("section#details").on('click', "a.detail-close", function() {
		$("a.detail-favorite").empty();
		$("section#details").empty();
		$("section#details").hide();
	});
	
	$("section#details").on('click', 'a.detail-cast-link', function() {
		var member = $(this).attr('data-id');
		
		var query = "https://api.themoviedb.org/3/person/{id}?api_key=";
		query = query.replace("{id}", member);
		query = query + api_key + language;
		
		$.getJSON({
			url: query,
		
		}).done(function(data, status, xhr) {
			
			var template = "./templates/cast-details.htm";
			$.get(template, function(template) {
				$("#details-cast").html(Mustache.render(template, data));
			});
			
			$("section#details").hide();
			$("section#details-cast").show();
			
		}).fail(function(xhr, status, error) {
			console.error("Error:", error);
		});
	});
	
	$("section#details-cast").on('click', "a.detail-cast-close", function() {
		$("section#details-cast").empty();
		$("section#details-cast").hide();
		$("section#details").show();
	});
	
// ========================================
//      JSON QUERIES
// ========================================
	
	function getQueryResults(request, page, pagination) {
		$.getJSON({
			url: request + page,
		
		}).done(function(data, status, xhr) {
			response = data;
			
			$("section#results").empty();
			$("section#pagination").hide();
			$.each(data.results, function(index, result) {
				var category = request.split("/")[4];
				
				if (!result.hasOwnProperty('media_type')) {
					if (category == "search") {
						result.media_type = request.split("/")[5].split("?")[0];
					} else if (category == "account") {
						if (request.split("/")[7].split("?")[0] == "movies") {
							result.media_type = "movie";
						} else {
							result.media_type = request.split("/")[7].split("?")[0];
						};
					} else {
						result.media_type = request.split("/")[4];
					};
				};
				
				template = result.media_type + "-result.htm";
				$.get("./templates/" + template, function(template) {
					$("#results").append(Mustache.render(template, result));
				});
			});
			
			if (pagination) {
				getPaginationPages();
			};
			
		}).fail(function(xhr, status, error) {
			console.error("Error:", error);
		});
	};
	
	function getQueryDetails(query, type) {
		$.getJSON({
			url: query,
		
		}).done(function(details, status, xhr) {
			getQueryCastMembers(details, type);
			
		}).fail(function(xhr, status, error) {
			console.error("Error:", error);
		});
	};
	
	function getQueryCastMembers(details, type) {
		if (type.includes("movie") || type.includes("tv")) {
			var cast_url = "https://api.themoviedb.org/3/";
			cast_url += `${type}/${details.id}/credits?api_key=`;
			cast_url += api_key + language;
			
			$.getJSON({
				url: cast_url,

			}).done(function(data, status, xhr) {
				details.cast = data.cast.slice(0, 5);
				renderDetailsTemplate(details, type);
				getAccountInformation(details, type);
			
			}).fail(function(xhr, status, error) {
				console.error("Error:", error);
			
			});
		
		} else {
			renderDetailsTemplate(details, type)
			getAccountInformation(details);
		};
	};
	
// ========================================
//      PAGINATION
// ========================================
	
	function getPaginationPages() {
		var total_pages = (response.total_pages >= 5) ? 5 : response.total_pages;
		
		$("#pagination-pages").empty()
		if (total_pages > 1) {		
			for (var i = 1; i <= total_pages; ++i) {
				$("#pagination-pages").append("<a>" + i + "</a>");
			};
			$("#pagination-pages").children().first().addClass("selected-link");
			$("#pagination").show();
		};
	};

	$("#first-page").click(function() {
		var total_pages = (response.total_pages >= 5) ? 5 : response.total_pages;
		
		$("#pagination-pages").empty()
		if (total_pages > 1) {
			for (var i = 1; i <= total_pages; ++i) {
				$("#pagination-pages").append("<a>" + i + "</a>");
			};
			setPageIndicator(0);
		};
	});

	$("#prev-page").click(function() {
		var current_index = $("#pagination-pages").children(".selected-link").index();
		if (current_index > 0) {
			setPageIndicator(current_index - 1);
		} else {return};
	});

	$("#pagination-pages").on('click', "a:not(.selected-link)", function() {
		setPageIndicator($(this).index());
	});

	$("#next-page").click(function() {
		var current_index = $("#pagination-pages").children(".selected-link").index();
		var last_index = $("#pagination-pages").children().last().index();
		if (current_index < last_index) {
			setPageIndicator(current_index + 1);
		} else {return};
	});

	$("#last-page").click(function() {
		var total_pages = response.total_pages;
		var count = (total_pages >= 5) ? total_pages - 4 : 1;
		var index = $("#pagination-pages")

		$("#pagination-pages").empty()
		for (var i = count; i <= total_pages ; ++i) {
			$("#pagination-pages").append("<a>" + i + "</a>");
		}; setPageIndicator($("#pagination-pages").children().last().index());
	});

	function setPageIndicator(index) {
		var first_page = parseInt($("#pagination-pages").children().first().text());
		var last_page = parseInt($("#pagination-pages").children().last().text());
		var page = parseInt($("#pagination-pages").children().eq(index).text());
		
		if (index == 0 && first_page != 1) {
			var page_number = first_page - 1;
			$("#pagination-pages").prepend('<a>' + page_number + '</a>');
			$("#pagination-pages").children().last().remove();
			index = index + 1;
		} else if (index == 4 && last_page < response.total_pages) {
			var page_number = last_page + 1;
			$("#pagination-pages").append('<a>' + page_number + '</a>');
			$("#pagination-pages").children().first().remove();
			index = index - 1;
		};
		
		getQueryResults(request, page, false);
		$(".selected-link").toggleClass("selected-link");
		$("#pagination-pages").children().eq(index).toggleClass("selected-link");
	};

// ========================================
//      MISCELLANEOUS FUNCTIONS
// ========================================	

	function getAccountInformation(details, type) {
		if (getCookie("session_id")) {
			var fquery = (type == "tv") ? favorite_array[1] : favorite_array[0];
			fquery = fquery.replace("{account_id}", getCookie("account_id"));
			fquery += api_key + language + "&session_id=" + getCookie("session_id");
			
			var wquery = (type == "tv") ? watchlist_array[1] : watchlist_array[0];
			wquery = wquery.replace("{account_id}", getCookie("account_id"));
			wquery += api_key + language + "&session_id=" + getCookie("session_id");
			
			var fquery_data;
			var wquery_data;
			
			$.when(
			
				$.getJSON(fquery, function(data, status, xhr) {
					fquery_data = data;
				}),
				
				$.getJSON(wquery, function(data, status, xhr) {
					wquery_data = data;
				}),
			
			).then(function() {
			
				$(".detail-favorite").prop('title', "Add to Favorites");
				$(".detail-favorite").html('<i class="far fa-star"></i>');
				$(".detail-watchlist").prop('title', "Add to Watch List");
				$(".detail-watchlist").html('<i class="far fa-bookmark"></i>');
				
				$.each(fquery_data.results, function(index, result) {
					if (details.id == result.id) {
						$(".detail-favorite").attr('data-append', false);
						$(".detail-favorite").prop('title', "Remove from Favorites");
						$(".detail-favorite").html('<i class="fas fa-star"></i>');
					};
				});
				
				$.each(wquery_data.results, function(index, result) {
					if (details.id == result.id) {
						$(".detail-watchlist").attr('data-append', false);
						$(".detail-watchlist").prop('title', "Remove from Watch List");
						$(".detail-watchlist").html('<i class="fas fa-bookmark"></i>');
					};
				});
			});
		};
	};
	
	function renderDetailsTemplate(details, type) {
		var template = "./templates/" + type + "-details.htm";
		$.get(template, function(template) {
			$("#details").html(Mustache.render(template, details));
		}); $("#details").show();
	};

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

$(function () {
	$('#search-form').submit(handleSearchFormSubmit);
    $('#daterange').daterangepicker({
	});	
	$('#searchResults').click(function(e){
	  	var t = $(event.target);
	  	while (!t.is(this)) {
	    	if (t.is("tr")) break;
		    if (t.is("table")) return;
		    if (t.hasClass('delbtn')){
		    	return delItem(t.attr('data-path'));
		    }
		    t = t.parent();
	  	}
		if (!t.parent().is("tbody")) {
			return;
		}
		if (t.children().length == 1) return;
		var path = t.find("div[data-path]").attr("data-path");
		download(path);
	});
	$('#keywords').keypress(function(e) {
		if(e.which == 13) {
			handleSearchFormSubmit(e);
		}
  	});
	var table = $('#searchResults').DataTable({
		searching:false,  
		bRetrieve:true,
		dom: 'frtip',
		rowCallback: function( row, data, index ) {
		},
		columns: [
			{ "data": "path" },
			{ "data": "score" }
		],
		deferLoading: 0,
		processing: true,
        serverSide: true,
		ajax:{
			url: INPHER_REST_URL + "/searchPaged",
			type: "POST",
			beforeSend: function (request) {
        		request.setRequestHeader("auth_token", sessionStorage.getItem('auth_token'));
    		},
			data: function(data) {
				var req = {
					'page': data.start/data.length,
					'numRes': data.length,
					'query': getQuery()
				};
				return req;
			},
			dataFilter: function(data) {
				var json = jQuery.parseJSON( data );
				json.recordsTotal = json.totalHits;
				json.recordsFiltered = json.totalHits;
				json.data = [];
				for (var i = 0; i < json.results.length; i++) {
					json.data.push({
						'path': searchPathCol(json.results[i]),
						'score': Math.round(json.results[i].score * 1000) / 100
					})
				}
				return JSON.stringify(json);;
			}
		}
	});
});

function getQuery() {
	var startDate = $('#daterange').data('daterangepicker').startDate.startOf('day');
	var endDate = $('#daterange').data('daterangepicker').endDate.startOf('day');
	if(startDate.isSame(endDate))
		return $('#keywords').val();
	var textQuery = '';
	if($('#keywords').val() != ''){
		textQuery = '('.concat($('#keywords').val());
		textQuery = textQuery.concat(') AND');
	}
	textQuery = textQuery.concat(' (');
	for(var date = moment(startDate); date.isSameOrBefore(endDate); date.add(1, 'days')){
		textQuery = textQuery.concat(moment(date).format('L'));
		if(date.isBefore(endDate)){
			textQuery = textQuery.concat(' OR ');
		}
	}
	textQuery = textQuery.concat(')');
	return textQuery;
}

function searchPathCol(element) {
	var reps = $('<div>&emsp;</div>');
	reps.attr('data-path', element.path);
	if ( element.path.indexOf('/' + sessionStorage.getItem('username') + '/') != 0 ) {
       reps.prepend($('<i>').addClass("fa fa-users"));
	}
	var icon = $('<i>').addClass('fa fa-file-text');
	return outerHTML(reps.prepend(icon).append(document.createTextNode(element.path)));
}

function handleSearchFormSubmit(event) {
    event.stopPropagation();
    event.preventDefault();
    $('#keywords').blur();
    inpherapi_search();
}

function inpherapi_search() {
	var table = $('#searchResults').DataTable();
	table.ajax.reload(nextSearchReloaded, true);
	function nextSearchReloaded(data) {
		if (data.results.length > 0) {
			$('#noResults').hide();
			$('.searchdata_wrapper').show();
		} else {
			$('#noResults').show();
			$('.searchdata_wrapper').hide();
		}
	}
};

function inpherapi_search_res_to_row(el, i) {
	var reps = $('<div>&emsp;</div>');
	var icon = $('<i>').addClass('fa fa-file-text');
	reps.attr('data-path', el.path).prepend(icon).append(document.createTextNode(el.path));
	return [outerHTML(reps), el.score];
}
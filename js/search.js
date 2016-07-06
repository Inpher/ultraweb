
$(function () {
	$('#search-form').submit(handleSearchFormSubmit);
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
    	inpherapi_search();
    }
  });
	var table = $('#searchResults').DataTable({
		'searching':false,  
		'bRetrieve':true,
		'bPaginate':false
	});
});

function handleSearchFormSubmit(event) {
    event.stopPropagation();
    event.preventDefault();
    inpherapi_search();
}

function inpherapi_search() {
	var words = $('#keywords').val();
	inpherapi_auth_post("/search", {query: words}, function(data){
		var table = $('#searchResults').dataTable();
		table.fnClearTable();
		$('#noResults').hide();
		if (data.totalHits > 0) {
			$('.searchdata_wrapper').show();
			table.fnAddData(data.results.map(inpherapi_search_res_to_row));
		} else {
			$('#noResults').show();
			$('.searchdata_wrapper').hide();
		}
	});
};

function inpherapi_search_res_to_row(el, i) {
	var reps = $('<div>&emsp;</div>');
	var icon = $('<i>').addClass('fa fa-file-text');
	reps.attr('data-path', el.path).prepend(icon).append(document.createTextNode(el.path));
	return [outerHTML(reps), el.score];
}
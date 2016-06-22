function update_currentPath(newPath) {
  var rootname = newPath.split('/')[1];
  if (state.currentPath) {
      state.lastCurrentPath[rootname]=newPath;
  }
  state.currentPath = newPath;
  console.log(newPath.split('/').length);
  if (rootname === state.username) {
     showUpload();
  }
  else if (newPath.split('/').length > 2) {
     showUpload();
  }
  else {
     hideUpload();
  }
  update_path_nav();
  update_table();
}

function update_path_nav() {
  var pathFragments = state.currentPath.split("/");
  var aggregatedPath = "";
  var pathNav = $('#pathNav');
  pathNav.html('');
  for(var i = 1; i < pathFragments.length; i++) {
    aggregatedPath += "/" + pathFragments[i];

    // var li = $('<li>').attr('data-path',aggregatedPath).text(pathFragments[i]);
    var a = $('<a>').text(pathFragments[i]).attr('href', '#');
    var li = $('<li>').attr('data-path', aggregatedPath);
    li.append(a);
    pathNav.append(li);
  }
  pathNav.children().click(function() {
    var path = $(this).attr("data-path");
    update_currentPath(path);
  });
}

function onPathNavClick(event) {
  var li = $(event.target).closest("li[data-path]",this);
  if (li.length==0) return; //did not click in a li item
  var path = li.attr("data-path");
  update_currentPath(path);
}

function onFileTableClick(event) {
  // TODO: check if it is a file or a directory
  var t = $(event.target);
  while (!t.is(this)) {
    if (t.is("tr")) break;
    if (t.is("table")) return;
    if (t.hasClass('delbtn')){
      return delItem(t.attr('data-path'));
    }
    if (t.hasClass('shareItem')) {
      return shareItem(t.attr('data-path'), t.attr('data-group'));
    }
    if (t.hasClass('dropdown')){
      return;
    }
    t = t.parent();
  }
  if (!t.parent().is("tbody")) {
    return;
  }
  if (t.children().length == 1) return;
  var currentDataIndex = t.find("div[data-index]").attr("data-index");
  if (elementIsDocument(currentListData[currentDataIndex].type)) {
    download(currentListData[currentDataIndex].path);
  } else {
    update_currentPath(currentListData[currentDataIndex].path);
  }
}

function download(path) {
  inpherapi_auth_get("/download", {fileName: path}, function(data, status, request){
    console.log(request);
    var blob = new Blob([data], {type: "txt"});
    saveAs(blob, "file.txt");
  })
}

function shareItem(path, group) {
  $('#createShareModal').modal("show");
  $('#createShareSubmit').on("click", function(){
    var shareName = $('#createShareName').val();
    inpherapiShareElement(path, group, shareName);
  })
}

function inpherapiShareElement(path, group, shareName) {
  var queryParam = {
    "groupName" : group,
    "filePath" : path,
    "shareName" : shareName,
  };
  inpherapi_auth_post("/shareElement", queryParam, function(data, status) {
    if(status === "success")
            $('#alertContainer').bs_info("element shared succefully");
    else 
            $('#alertContainer').bs_alert(data);
  });
}

$(function () {
  // Load the table content
  state.currentPath = '/' + sessionStorage.getItem('username');
  state.username = sessionStorage.getItem('username');
  update_path_nav();
  init_table();
  $('#pathNav').click(onPathNavClick);
  $('#files').click(onFileTableClick);
  $('#uploadFileModal').submit(fileUploadForm);
});

function fileUploadForm(e){
	e.preventDefault();
  e.stopPropagation();
  var obj = $('#file-list-page');
 	handleFileUpload($('#uploadFileModal input[type=file]')[0].files, obj);
 	$('#uploadFileModal').modal('hide');
}

function init_table() {
  $("#files").DataTable({
  	'searching':false,
  	dom: 'Bfrtip',
    buttons: [
	      {
	        text:      '<button class="btn btn-success btn-circle"><i class="fa fa-upload"></i></button>',
	        titleAttr: 'Upload',
		        action: function ( e, dt, node, config ) {
		            $('#uploadFileModal').modal();
		        }
	      },
	      {
	        text:      '<button class="btn btn-success btn-circle"><i class="fa fa-plus"></i></button>',
	        titleAttr: 'Create Folder',
		        action: function ( e, dt, node, config ) {
		            showAddFolder();
		        }
	      }
		]
  });
  update_table();
}

function showAddFolder() {
	$('#mkdir-footer').toggleClass('hidden');
}

function update_table() {
  inpherapi_list(state.currentPath, function(data, status) {
    if (status !== "success"){
              $('#alertContainer').bs_alert(data);
    }
    currentListData = data.list;
    var table = $('#files').dataTable();
    table.fnClearTable();
    if (data.list.length > 0) {
      var tableData = [];
      for (var i = 0; i < data.list.length; i++) {
        tableData.push(inpherapi_list_res_to_row(data.list[i], i));
      }
      table.fnAddData(tableData);
    }
  });
}

/**
* This function returns the outerHTML jQuert element which is not connected to the DOM
* (Unpredictable behaviour if the element is in the DOM)
*/
function outerHTML(element) {
  var try1 = element[0].outerHTML;
  if (try1) return try1;
  return element.wrapAll('<div>').parent().html();
}

function inpherapi_list_res_to_row(a, i) {
  var delbtn = $('<button type="button" class="btn btn-danger btn-circle delbtn"><i class="fa fa-trash-o"></i></button>');
  delbtn.attr('data-path', a.path);
  return [
    outerHTML(fsElementIconAndNameHtml(a.type, a.path, i)),
    a.size,
    a.groups,
    outerHTML($("<div>").append(delbtn).append(createShareElementButton(a.path)))
  ];
}

function fsElementIconAndNameHtml(elementType, path, i) {
  var name = path.substring(path.lastIndexOf("/") + 1, path.length);
  var reps = $('<div>&emsp;</div>');
  return reps.attr('data-index',i).prepend(fsElementTypeHtmlIcon(elementType)).append(document.createTextNode(name));
}

function elementIsDocument(elementType) {
  return elementType === "DOCUMENT";
}

function fsElementTypeHtmlIcon(elementType) {
  var reps=$('<i>').addClass('fa');
  if (elementIsDocument(elementType)) {
    return reps.addClass('fa-file-text');
  } else {
    return reps.addClass('fa-folder');
  }
}

function createShareElementButton(path) {
  var dropdown = $("<div>").attr("class", "dropdown");
  var button = $("<button>").attr("class", "btn btn-primary btn-circle").attr("type", "button").attr("data-toggle", "dropdown");
  button.append('<i class="fa fa-share"/>')
  dropdown.append(button);
  var listHtml = $("<ul class='dropdown-menu'/>");
  var listGroups = inpherListGroups();
  for(var i = 0; i < listGroups.length; i++) {
    var li = $("<li class='shareItem'>").append(listGroups[i]);
    li.attr("data-group", listGroups[i]).attr("data-path", path);
    listHtml.append(li);
  }
  dropdown.append(listHtml);
  return dropdown;
}

function inpherListGroups() {
  return state.sharingGroupList;
}

function inpherapi_list(path, callback) {
  inpherapi_auth_get("/listDir", {dir: path}, callback);
}


function delItem(path) {
  return inpherapi_auth_delete('/delete', {path: path, recursive: true},update_table);
}

// ------------------------------------------------
// Upload shit below
function sendFileToServer(formData,status) {
  var options = {
    type: "POST",
    contentType:false,
    processData: false,
    cache: false,
    data: formData,
  };
  options.xhr = function() {
    var xhrobj = $.ajaxSettings.xhr();
    if (xhrobj.upload) {
      xhrobj.upload.addEventListener('progress', function(event) {
        var percent = 0;
        var position = event.loaded || event.position;
        var total = event.total;
        if (event.lengthComputable) {
          percent = Math.ceil(position / total * 100);
        }
        //Set progress
        status.setProgress(percent);
      }, false);
    }
    return xhrobj;
  };
  return inpherapi_auth_ajax('/upload', next1, options);
  function next1(data) {
    status.setProgress(100);
    $("#status1").append("File upload Done<br>");
    update_table(state.currentPath);
  }
}

var rowCount=0;
function createStatusbar(obj)
{
  rowCount++;
  var row="odd";
  if(rowCount %2 ==0) row ="even";
  this.statusbar = $("<div class='statusbar "+row+"'></div>");
  this.filename = $("<div class='filename'></div>").appendTo(this.statusbar);
  this.size = $("<div class='filesize'></div>").appendTo(this.statusbar);
  this.progressBar = $("<div class='progressBar'><div></div></div>").appendTo(this.statusbar);
  this.abort = $("<div class='abort'>Abort</div>").appendTo(this.statusbar);
  obj.after(this.statusbar);

  this.setFileNameSize = function(name,size) {
    var sizeStr="";
    var sizeKB = size/1024;
    var sizeMB = sizeKB/1024;
    if(sizeMB > 1) {
      sizeStr = sizeMB.toFixed(2)+" MB";
    } else {
      sizeStr = sizeKB.toFixed(2)+" KB";
    }
    this.filename.text(name);
    this.size.text(sizeStr);
  };
  this.setProgress = function(progress) {
    var progressBarWidth =progress*this.progressBar.width()/ 100;
    this.progressBar.find('div').animate({ width: progressBarWidth }, 10).text(progress + "% ");
    if(parseInt(progress) >= 100)
    {
      this.abort.hide();
    }
  };
  this.setAbort = function(jqxhr) {
    var sb = this.statusbar;
    this.abort.click(function() {
      jqxhr.abort();
      sb.hide();
    });
  };
}

function handleFileUpload(files,obj) {
  for (var i = 0; i < files.length; i++) {
    var fd = new FormData();
    fd.append('content', files[i]);
    fd.append('name', state.currentPath + '/' + files[i].name);

    var status = new createStatusbar(obj); //Using this we can set progress.
    status.setFileNameSize(files[i].name,files[i].size);
    sendFileToServer(fd,status);
  }
}

function handleMkdir(event) {
  if (event.isDefaultPrevented()) {
    // TODO: failure
  } else {
    event.stopPropagation();
    event.preventDefault();
    var dirname = $("#mkdirname").val();
    inpherapi_auth_post('/mkdir', { dir: state.currentPath + "/"  + dirname }, update_table);
    $('#mkdir-footer').toggleClass('hidden');
  }
}


$(function() {
  $("#mkdir-form").validator().submit(handleMkdir);

	var dragging = 0;
  var obj = $(".dragandrophandler");
  obj.on('dragenter', function (e) {
  	dragging++;
    e.stopPropagation();
    e.preventDefault();
    $('#dragandrophandler').removeClass('hidden');
    $('#uploadFileModal').modal('hide');
    console.log('dragenter');
  });
  obj.on('dragover', function (e) {
    e.stopPropagation();
    e.preventDefault();
    $('#uploadFileModal').modal('hide');
  });
  obj.on('drop', function (e) {
  	dragging = 0;
    e.preventDefault();
    var files = e.originalEvent.dataTransfer.files;
    $('#dragandrophandler').addClass('hidden');
    console.log('drop');
    //We need to send dropped files to Server
    handleFileUpload(files, $('#file-list-page'));
  });
  obj.on('dragleave', function (e) {
  	dragging--;
    e.stopPropagation();
    e.preventDefault();
  	if (dragging === 0) {
  		$('#dragandrophandler').addClass('hidden');
  	}
  	console.log('dragleave');
  });
  var doc = $(document);
  doc.on('dragenter', function (e) {
    e.stopPropagation();
    e.preventDefault();
  });
  doc.on('dragover', function (e) {
    e.stopPropagation();
    e.preventDefault();
  });
  doc.on('drop', function (e) {
    e.stopPropagation();
    e.preventDefault();
  });

});
// ------------------------------------------------
// Upload shit above
// ------------------------------------------------

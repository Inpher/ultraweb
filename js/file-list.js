function update_currentPath(newPath) {
  state.currentPath = newPath;
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
    var li = $('<li>').attr('data-path',aggregatedPath).text(pathFragments[i]);
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
    t = t.parent();
  }
  if (!t.parent().is("tbody")) {
    return;
  }
  if (t.children().length == 1) return;
  update_currentPath(t.find("div[data-path]").attr("data-path"));
}

$(function () {
  // Load the table content
  state.currentPath = '/' + sessionStorage.getItem('username');
  update_path_nav();
  init_table();
  $('#pathNav').click(onPathNavClick);
  $('#files').click(onFileTableClick);
});

function init_table() {
  inpherapi_list(state.currentPath, function(data, status) {
    if (status !== "success") {
      alert("error " + status);
    }
    $("#files").DataTable( {
      data: data.list.map(inpherapi_list_res_to_row)
    } );
  });
}

function update_table() {
  inpherapi_list(state.currentPath, function(data, status) {
    if (status !== "success") {
      alert("errror " + status);
    }
    var table = $('#files').dataTable();
    table.fnClearTable();
    if (data.list.length > 0) {
      table.fnAddData(data.list.map(inpherapi_list_res_to_row));
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

function inpherapi_list_res_to_row(a) {
  var delbtn = $('<button type="button" class="btn btn-danger btn-circle delbtn"><i class="fa fa-times-circle"></i></button>');
  delbtn.attr('data-path', a.path);
  return [outerHTML(fsElementIconAndNameHtml(a.type, a.path)), a.size, a.groups,outerHTML(delbtn)];
}

function fsElementIconAndNameHtml(elementType, path) {
  var name = path.substring(path.lastIndexOf("/") + 1, path.length);
  var reps = $('<div>&emsp;</div>');
  return reps.attr('data-path',path).prepend(fsElementTypeHtmlIcon(elementType)).append(document.createTextNode(name));
}

function fsElementTypeHtmlIcon(elementType) {
  var reps=$('<i>').addClass('fa');
  if (elementType === "DOCUMENT") {
    return reps.addClass('fa-file-text');
  } else {
    return reps.addClass('fa-folder');
  }
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
  var dirname = $("#mkdirname").val();
  inpherapi_auth_post('/mkdir', { dir: state.currentPath + "/"  + dirname }, update_table);
}


$(function() {
  $("#mkdirbtn").click(handleMkdir);

  var obj = $("#dragandrophandler");
  obj.on('dragenter', function (e) {
    e.stopPropagation();
    e.preventDefault();
    obj.css('border', '2px solid #0B85A1');
  });
  obj.on('dragover', function (e) {
    e.stopPropagation();
    e.preventDefault();
  });
  obj.on('drop', function (e) {
    obj.css('border', '2px dotted #0B85A1');
    e.preventDefault();
    var files = e.originalEvent.dataTransfer.files;

    //We need to send dropped files to Server
    handleFileUpload(files,obj);
  });
  var doc = $(document);
  doc.on('dragenter', function (e) {
    e.stopPropagation();
    e.preventDefault();
  });
  doc.on('dragover', function (e) {
    e.stopPropagation();
    e.preventDefault();
    obj.css('border', '2px dotted #0B85A1');
  });
  doc.on('drop', function (e) {
    e.stopPropagation();
    e.preventDefault();
  });

});
// ------------------------------------------------
// Upload shit above
// ------------------------------------------------

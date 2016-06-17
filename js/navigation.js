state.sharingGroupList={};

function updateListGroupsCallback(data, status) {
    if(status!="success") return;
    state.sharingGroupList=data;
    var sharingGroupNav = $("#sharingGroupList");
    sharingGroupNav.html('');
    ui.sharingGroupNavLi = {};
    for (var i = 0; i < data.length; i++) {
	var a = $("<a>").text(data[i]);
	var li = $("<li>").attr("data-group",data[i]).append(a);
	sharingGroupNav.append(li);
    }
}

function updateListGroups(){
  inpherapi_listGroups(updateListGroupsCallback);
}

function handleListGroupsClick(event) {
    var li = $(event.target).closest('li[data-group]',this);
    if (li.length==0) return console.log("we didn't click on a group name");
    var groupName = li.attr('data-group');
    update_currentPath('/'+groupName); 
}

function handleCreateSharingGroupSubmit() {
  var groupName = $("#createSharingGroupName").val();
  var tmpmembers = $("#createSharingGroupMembers").val();
  var myself = $("#createSharingGroupAddMyself").is(':checked')
  if (myself) tmpmembers += ';'+state.username;
  groupName = groupName.trim();
  if(groupName == '') return console.log("Group name is empty, we'll do nothing");
  var separator = new RegExp("[ ,;]+","g");
  tmpmembers = tmpmembers.trim().split(separator);
  var set = {};
  var finalMembers = [];
  for (var i = 0; i < tmpmembers.length; i++) {
      var mname = tmpmembers[i];
      if (mname=='') continue;
      if (set[mname]) continue;
      set[mname]=1;
      finalMembers.push(mname);
  }
  if(finalMembers.length == 0) return console.log("members are empty, we'll do nothing");
  return inpherapi_createSharingGroup(groupName, finalMembers, next1);
  function next1(data, status) {
      if (status!="success") 
	  return $('#alertContainer').bs_alert("Failed to create sharing group");
      else
	  return updateListGroups();
  }
}

function showCreateSharingGroupModal() {
   $('#createSharingGroupModal').modal('show');
}

function hideCreateSharingGroupModal() {
   $('#createSharingGroupModal').modal('hide');
}

$(function() {
  state.sharingGroupList={};
  updateListGroups();

  $("#createSharingGroupSubmit").click(handleCreateSharingGroupSubmit);
  $("#sharingGroupList").click(handleListGroupsClick);
});



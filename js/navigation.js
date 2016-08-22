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

function showPathInFileView(userOrGroupName) {
    showDiv('file-list-page');
    var lastPath=state.lastCurrentPath[userOrGroupName]; 
    if (lastPath!==undefined){
      return update_currentPath(lastPath);
    }
    update_currentPath('/' + userOrGroupName); 
}

function handleListGroupsClick(event) {
    var li = $(event.target).closest('li[data-group]',this);
    if (li.length==0) return console.log("we didn't click on a group name");
    var groupName = li.attr('data-group');
    activateNavTab(event);
    hideUpload();
    showPathInFileView(groupName);
}

function hideUpload(){
    $('.dt-buttons').hide();
    $("#dragandrophandler").hide();
}

function showUpload(){
    $('.dt-buttons').show();
    $("#dragandrophandler").show();
}


function handleNavListUserDir(event) {
    activateNavTab(event);
    showUpload();
    showPathInFileView(state.username);
}
function activateNavTab(event){
  $('#side-menu li > a.active').removeClass('active');
  $(event.target).addClass('active');
}

function handleNavListSearchClick(event) {
    showDiv('search-page');
    activateNavTab(event);
}

function handleCreateSharingGroupSubmit(event) {
  event.stopPropagation();
  event.preventDefault();
  var groupName = $("#createSharingGroupName").val();
  var tmpmembers = $("#createSharingGroupMembers").val();
  var myself = $("#createSharingGroupAddMyself").is(':checked')
  if (myself) tmpmembers += ';'+state.username;
  groupName = groupName.trim();
  if(groupName == '') return $('#alertContainer').bs_alert("Group name is empty, we'll do nothing");
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
  if(finalMembers.length == 0) return $('#alertContainer').bs_alert("members are empty, we'll do nothing");
  return inpherapi_createSharingGroup(groupName, finalMembers, next1);
  function next1(data, status) {
      if (status!="success") 
	  return $('#alertContainer').bs_alert("Failed to create sharing group");
      hideCreateSharingGroupModal();
      $('#alertContainer').bs_info("Sharing Group Created!");
      return updateListGroups();
  }
}

function handleAddNewMemberToExistingGroupSubmit(event) {
  event.stopPropagation();
  event.preventDefault();
  var groupName = $("#addToGroupname").val();
  var username = $("#addToUsername").val();

  if(groupName == '') return $('#alertContainer').bs_alert("Group name is empty, we'll do nothing");

  if(username == '') return $('#alertContainer').bs_alert("Username is empty, we'll do nothing");
  
  return inpherapi_addToSharingGroup(groupName, username, next1);
  function next1(data, status) {
      if (status!="success") {
        return $('#alertContainer').bs_alert("Failed to add to sharing group");
      }
      hideAddNewMemberToExistingGroup();
      $('#alertContainer').bs_info("Member Added to Group Successfully!");
  }
}

function handleSharingGroupCreateButtonClicked(event) {
    event.preventDefault();
    event.stopPropagation();
    showCreateSharingGroupModal();
}

function handleAddNewMemberToExistingGroup(event){
  event.preventDefault();
  event.stopPropagation();
  showAddNewMemberToExistingGroup();
}

function showAddNewMemberToExistingGroup(){
  $("#addToGroupname").val('');
  $("#addToUsername").val('');
  $('#addMemberModal').modal('show');
}

function hideAddNewMemberToExistingGroup(){
  $('#addMemberModal').modal('hide');
}

function showCreateSharingGroupModal() {
   $("#createSharingGroupName").val('');
   $("#createSharingGroupMembers").val('');
   $("#createSharingGroupAddMyself").prop('checked',true);
   $('#createSharingGroupModal').modal('show');
}

function hideCreateSharingGroupModal() {
   $('#createSharingGroupModal').modal('hide');
}

$(function() {
  state.sharingGroupList={};
  state.lastCurrentPath={};
  updateListGroups();

  $("#createSharingGroupForm").submit(handleCreateSharingGroupSubmit);
  $("#sharingGroupList").click(handleListGroupsClick);
  $("#navListUserDir").click(handleNavListUserDir);
  $("#createSharingGroupButton").click(handleSharingGroupCreateButtonClicked);
  $("#navListSearch").click(handleNavListSearchClick);
  $('#addMemberForm').submit(handleAddNewMemberToExistingGroupSubmit);
  $('#addMemberButton').click(handleAddNewMemberToExistingGroup);
});


/*
  Meteor startup stuff
*/
Messages = new Meteor.Collection("messages");
Rooms = new Meteor.Collection("rooms");

Meteor.autorun(function(){
  Meteor.subscribe("messages");
  Meteor.subscribe("rooms");
  var firstRoom = Rooms.find({}, {sort: {roomName: 1}}).fetch()[0];
  if (firstRoom){
    Session.setDefault("room", firstRoom._id);
  }
});

/*
  UI Adjustments for Window Size
*/
  $(window).load(function(){
    uiChanges();
  });
  $(window).resize(function(){
    uiChanges();
  });

  var uiChanges = function(){
    var windowHeight = $(window).height() - $('.navbar').outerHeight(true);
    $('.row-fluid .leftHolder').height(windowHeight);
    $('.rightHolder').height(windowHeight);
    $('.messageDiv').height(windowHeight - $('.messageBoxDiv').height());
  };
/*
  User logged in/out status stuff
*/
Template.user_loggedout.events({
  "click #login": function(e, tmpl){
    Meteor.loginWithGithub({
      requestPermissions: ['user', 'public_repo']
    }, function(err){
      if (err){
        //error handling
      }else {
        //show err
    }
    });
  }
});

Template.user_loggedin.events({
  "click #logout": function(e, tmpl){
    Meteor.logout(function(err){
      if (err){
        //err handling
      } else {
        //show err
      }
    });
  }
});

/*
  Handles events for room changing/selection
*/
Template.rooms.events = {
  "click #addRoom": function(){
    var roomName = window.prompt("Name The Room", "My Room") || "Anonymous Room";
    if (roomName){
      if(Rooms.find({roomName: roomName}).count() === 0){
        Rooms.insert({roomName: roomName});
      } else {
        window.alert("There is already a room with that name. Please try again.");
      }
    }
  }
};

Template.header.currentRoom = function(){
  var curRoom = Rooms.find({_id: Session.get("room")}).fetch()[0];
  if (curRoom){
    return curRoom.roomName;
  }
  return "Anonymous";
};

Template.rooms.availableRooms = function(){
  return Rooms.find({}, {sort:{roomName: 1}});
};

Template.rooms.rendered = function(){
  if (Rooms.find({}).count() === 1 ){
    $('.delete').css('display', 'none');
  } else{
    $('.delete').css('display', 'inline');
  }
};

Template.roomItem.rendered = function(){
  if (this.data._id === Session.get("room")){
    $(this.firstNode).addClass('currentRoom');
  }
};

Template.roomItem.events = {
  "click #enter": function(){
    Session.set("room", this._id);
    $('.currentRoom').removeClass('currentRoom');
    $('.roomItem:contains(\''+this.roomName+'\')').first().addClass("currentRoom");
  },
  "click #delete": function(){
    Rooms.remove({_id: this._id});
  }
};

Template.room.roomName = function(){
  var room = Rooms.findOne({_id: Session.get("room")});
  return room && room.name;
};

Template.room.rendered = function(){
  uiChanges();
};

Template.room.messages = function() {
  return Messages.find({room: Session.get("room"), time: {$gt: Date.now()/1000}});
};

/*
  Chat events
*/



var okCancelEvents = function (selector, callbacks) {
  var ok = callbacks.ok || function () {};
  var cancel = callbacks.cancel || function () {};

  var events = {};
  events['keyup '+selector+', keydown '+selector+', focusout '+selector] =
    function (evt) {
      if (evt.type === "keydown" && evt.which === 27) {
        // escape = cancel
        cancel.call(this, evt);
      } else if (evt.type === "keyup" && evt.which === 13 ||
                 evt.type === "focusout") {
        // blur/return/enter = ok/submit if non-empty
        var value = String(evt.target.value || "");
        if (value)
          ok.call(this, value, evt);
        else
          cancel.call(this, evt);
      }
    };
  return events;
};
Template.entry.events(okCancelEvents(
  '#messageBox', {
    ok: function(text, event){
      var nameEntry;
      if (Meteor.user()){
        nameEntry = Meteor.user().profile.name;
      } else {
        nameEntry = "Anonymous";
      }
      if (nameEntry !== ''){
        var ts = Date.now() / 1000;
        Messages.insert({name: nameEntry, message: text, time: ts, room: Session.get("room")});
        event.target.value = "";
        Meteor.flush();
        $('#messageDiv').scrollTop($('#messageDiv')[0].scrollHeight);
      }
    }
  }
));
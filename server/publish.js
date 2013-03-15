Messages = new Meteor.Collection("messages");
Rooms = new Meteor.Collection("rooms");

Meteor.publish("messages", function(){
  return Messages.find({});
});

Meteor.publish("rooms", function(){
  return Rooms.find({}, {sort:{roomName: 1}});
});

Meteor.startup(function(){
  if (Rooms.find().count() === 0){
    Rooms.insert({roomName: "Default Room", createdBy: "Server"});
  }
});
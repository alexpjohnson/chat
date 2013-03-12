Messages = new Meteor.Collection("messages");
Rooms = new Meteor.Collection("rooms");

Meteor.publish("messages", function(){
  return Messages.find({});
});

Meteor.publish("rooms", function(){
  return Rooms.find({});
});

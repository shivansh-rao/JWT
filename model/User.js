var mongoose=require("mongoose");
var passportLocalMongoose=require('passport-local-mongoose');
//var passportLocalMongoose=require("passport-local-mongoose");
var UserSchema=new mongoose.Schema({
	email: String,
	username: String,
	password: String,
	phone: Number
});
UserSchema.plugin(passportLocalMongoose);
module.exports =mongoose.model("User",UserSchema);
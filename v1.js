const express = require('express');
const app = express();
const port = 3001;
// var session=require('express-session');
// FileStore = require('session-file-store')(session);
var bodyparser=require("body-parser");
var cookieParser = require('cookie-parser');
const path=require('path');
var cors = require('cors');
var passport=require('passport');
var localStrategy=require('passport-local').Strategy;
var jwt=require('jsonwebtoken');
var JwtStrategy= require('passport-jwt').Strategy;
var passportLocalMongoose=require('passport-local-mongoose');
var Campground=require('./model/camp.js');
var Comment=require('./model/comment.js');
var User=require('./model/User.js');
var mongoose =require('mongoose');
mongoose.connect("mongodb+srv://shivansh:shivansh@cluster0-fpqlm.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser:true,useCreateIndex:true,useUnifiedTopology: true});
mongoose.connection.once('open',()=>{
  console.log("mongoDbs connected");
});



app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use(passport.initialize());
  passport.use(new localStrategy(User.authenticate()));
// passport.use(new localStrategy(
//   function(username, password, done) {
//     User.findOne({ username: username }, function(err, user) {
//       if (err) { return done(err); }
//       if (!user) {
//         return done(null, false, { message: 'Incorrect username.' });
//       }
//       if (user.password!=password) {
//         return done(null, false, { message: 'Incorrect password.' });
//       }
//       return done(null, user);
//     });
//   }
// ));
 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());

// app.use(bodyparser.json());
 

// app.use(function(req,res,next){
// 	res.locals.user=req.user;
// 	next();
// });



// app.use(express.urlencoded({ extended: false }));

// app.use(express.static(path.join(__dirname, 'public')));


app.post("/login",function (req, res, next) {
    console.log("login")
    passport.authenticate('local', {session: false},function (err, user, info) {
        console.log(user);
        if (err||!user) {
          console.log("error")
            return res.status(400).json({
                message: info ? info.message : 'Login failed',
                user   : user
            });
        }

        req.login(user, {session: false}, (err) => {
            if (err) {
              console.log("bada error")
                res.send(err);
            }
              // console.log(user)
            const token = jwt.sign(user.toJSON(), 'your_jwt_secret');
              console.log(token);
            return res.json({user, token});
        });
    })
    (req, res);

});

app.post("/register",function(req,res){
  console.log("register request")
	var newUser=new User({username: req.body.username,email:req.body.email,phone:req.body.ph,password:req.body.password});
	User.Register(newUser,function(err,user){
		if(err)
			{
				console.log("err hai");
			  res.json(err);
      }
      else
		{

      console.log("done")
			res.json({user:null});
		}});
  });

app.get("/logout",function(req,res){
  console.log("logged out")
	req.logout();
	res.json("logged out");
});

app.get('/campgrounds',isLoggedIn,function(req, res, next) {
  console.log("almost done")
  jwt.verify(req.token,'your_jwt_secret',(err,authUser)=>{
    if(err)
    res.json(err)
    else{
      console.log("Get request aa gaya");
      Campground.find()
      .then(con=>res.json(con))
      .catch(err=>res.json(err));
    }
  })
});

app.post("/campgrounds/new",isLoggedIn,function(req,res){
  jwt.verify(req.token,'your_jwt_secret',(err,authUser)=>{
    if(err)
    res.json(err)
    else{
      console.log("post kr re")
// console.log(req.user)
// console.log(req.session)
	var name=req.body.name;
	var image=req.body.image;
	var desc=req.body.description;
	
  var camps={name: name,image: image,description: desc};
    // ,author:{id:req.user._id,username:req.user.username}};
    console.log("aa gaye");
	Campground.create(camps,function(err,newlyCreated){
		if(err)
		console.log(err);
	else
		{
			res.json(newlyCreated);
		}
	})
    }
  })

	
 });


 app.get("/campgrounds/:id",isLoggedIn,function(req,res){
   console.log("swagat hai");
   jwt.verify(req.token,'your_jwt_secret',(err,authUser)=>{
    if(err)
    res.json(err)
    else{
      Campground.findById(req.params.id).populate("comment").exec(function(err,fcamps){
		if(err)
		console.log(err);
	else
		{
			console.log(fcamps);
			res.json(fcamps);
		}
	});
    }
  })
	
});

app.post("/campgrounds/:id/comment",isLoggedIn,function(req,res){

  jwt.verify(req.token,'your_jwt_secret',(err,authUser)=>{
    if(err)
    res.json(err)
    else{
     Campground.findById(req.params.id,function(err,camp){
        if(err)
        res.json(err);
        else
        {
            
             Comment.create({text:req.body.comment},function(err,comm){
                    if(err)
                    res.json(err);
                    else{
                        console.log(comm);
                        comm.save();
                        camp.comment.push(comm);
                        camp.save();
                        res.json(comm);
                    }
            })
        }
    })
    }
  })
    
    
})

app.delete("/campgrounds/delete/",isLoggedIn,function(req,res){
  console.log("delete request")
  jwt.verify(req.token,'your_jwt_secret',(err,authUser)=>{
    if(err)
    res.json(err)
    else{
      Campground.findByIdAndDelete(req.query.id,function(err,camp){
		if(err){
			res.json(err);
		}
		else{
			res.json(req.query.id);
		}
	})
    }
  })
	
});

app.put("/campgrounds/update/:id",isLoggedIn,function(req,res){
  jwt.verify(req.token,'your_jwt_secret',(err,authUser)=>{
    if(err)
    res.json(err)
    else{
       var name=req.body.name;
	var image=req.body.image;
	var desc=req.body.description;
	
  var camps={name: name,image: image,description: desc};
  Campground.findByIdAndUpdate(req.params.id,camps,function(err,camp){
          if(err)
          res.json(err)
          else
          res.json(camp)
  })
    }
  })
 
})


function isLoggedIn(req,res,next){
  console.log(req.headers['authentication'])
  if(req.headers['authentication']!=undefined)
  {const token=req.headers['authentication'];
  // const abc=bearer.split(' ');
  req.token=token;
  next();
}
  else
  res.json("login first")
}

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
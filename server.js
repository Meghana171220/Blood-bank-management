const express=require('express');
const bodyParser=require('body-parser');
const mysql=require('mysql');
const bcrypt=require('bcryptjs');
const cookieParser=require('cookie-parser')
const {check,validationResult}=require('express-validator');
const session=require('express-session');
const saltRounds=10;
const passwordHash=require('password-hash');
const fileUpload=require('express-fileupload');
const mysqlConnection=require('./database');
const { Router } = require('express');
//const validateUser = require("./validation");
// const session=require('express-session');
// const usersRouter =require('./routes/users');
 var app=express();
 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({extended: true}));
 app.use(express.static(__dirname+'/public'));
 app.use(cookieParser());
 app.use(fileUpload());
// app.use(express.methodOverride());
// app.use(express.multipart())
 app.use(session({
             key:["username","inputPassword","u_id"],
             secret: "Shh, its a secret",
				 resave:true,
             saveUninitialized:true,
            cookie:{
               expires:60*60*24*365,
            }}));
//  app.use('/users',usersRouter);
 app.set('view engine','ejs');
 app.set('views',__dirname+'/views');
 app.engine('html',require('ejs').renderFile)
//  app.get('/',function(req,res){
//     res.render('login');
//  })
//  app.post('/',function(req,res){
//    res.render('login');
// })

var obj={};
app.get('/adminpage',function(req,res){
    if(req.session.users){
   
   mysqlConnection.query('select donor.u_id,donor.b_group,donor.weight,donor.bp,donor.temp,donor.pulse,user.u_id,user.fname,user.status,user.lname,user.email,user.phno,user.address,user.city,user.gender,user.dob,user.age FROM donor,user WHERE donor.u_id=user.u_id;',function(err,result){
      if(err){
         throw err;
      }
      else{
         obj={print:result};
         res.render('adminpage',obj);
      }
      })
   }
   })

app.get('/admin',function(req,res){
    var message='';
    res.render('admin',{message:message});
   

})
app.post('/adminpage',function(req,res){
   mysqlConnection.query("select *from user",function(err,result,fields){
      if(err){
         throw err;
      }else{
         res.send(result);
      }

   })
   // mysqlConnection.query("update table user set status='req.body.select'"+"where u_id=user.u_id")
})
app.get('/pending',function(req,res){
   if(req.session.users){
   
      mysqlConnection.query('select donor.u_id,donor.b_group,donor.weight,donor.bp,donor.temp,donor.pulse,user.u_id,user.image,user.fname,user.status,user.lname,user.email,user.phno,user.address,user.city,user.gender,user.dob,user.age FROM donor,user WHERE donor.u_id=user.u_id and status="pending";',function(err,result){
         if(err){
            throw err;
         }
         else{
            obj={print:result}; 
            res.render('pending',obj);
         }
         })
      }
      
})
app.post('/pending',function(req,res){
   res.render('/pending');
})
app.get('/accepted',function(req,res){
   if(req.session.users){
   
      mysqlConnection.query('select donor.u_id,donor.b_group,donor.weight,donor.bp,donor.temp,donor.pulse,user.u_id,user.image,user.fname,user.status,user.lname,user.email,user.phno,user.address,user.city,user.gender,user.dob,user.age FROM donor,user WHERE donor.u_id=user.u_id and status="accepted";',function(err,result){
         if(err){
            throw err;
         }
         else{
            obj={print:result}; 
            res.render('accepted',obj);
         }
         })
      }
      
})
app.post('/accepted',function(req,res){
   res.render('/accepted');
})
app.get('/rejected',function(req,res){
   if(req.session.users){
   
      mysqlConnection.query('select donor.u_id,donor.b_group,donor.weight,donor.bp,donor.temp,donor.pulse,user.u_id,user.fname,user.status,user.lname,user.email,user.phno,user.address,user.city,user.gender,user.dob,user.age FROM donor,user WHERE donor.u_id=user.u_id and status="Reject";',function(err,result){
         if(err){
            throw err;
         }
         else{
            obj={print:result}; 
            res.render('accepted',obj);
         }
         })
      }
      
})
app.post('/rejected',function(req,res){
   res.render('/rejected');
})
app.get('/dropdown/:u_id',function(req,res){
   res.render('adminpage')
})
app.post('/dropdown/:u_id',function(req,res){
   const u_id=req.params.u_id;
  
   console.log(req.body.selected);
   mysqlConnection.query("update user set status='"+req.body.selected+"' where u_id=?;",[u_id],function(err,result){
      if(err){
         console.log(err)
      }
      
   })
   
})

app.post('/admin',function(req,res){
   var message='';
   const inputusername=req.body.inputusername;
   const inputPassword=req.body.inputPassword;
  
   mysqlConnection.query("select *from admin where inputusername=?;",[inputusername],(err,result)=>{
      if(result.length>0){
         
         req.session.users=result;
         console.log(req.session.users);
         res.redirect('/adminhome');
      }else if(err){
         console.log(err)
      }
      else{
         message="username or password is incorrect";
         res.render('admin',{message:message})
      }
   })
})
app.get('/adminhome',function(req,res){
   res.render('adminhome');
})
app.post('/adminhome',function(req,res){
   res.render('adminhome');
})

 app.get('/login',function(req,res){
   var message='';
    res.render('index',{message:message});
 })
 app.get('/home',function(req,res){
   // if(req.session.user){
      var message='';
      mysqlConnection.query("select *from userdonor",(err,rows,fields)=>{
       if(err){
          console.log(err);  
       }else{
      res.render('home',{userdonor:rows})
       }
      })
   // } 
   })

 app.post('/login',function(req,res){
   const username=req.body.username;
   const email=req.body.email;
   const password=req.body.password;
   // const passwordhash=bcrypt.hash(password,saltRounds);
  
   mysqlConnection.query("select *from users where username=? AND email=?;",
 [username,email],
 (err,result)=>{
    if(err){
       res.send({err:err})
    }
   //  console.log(result.length);
   //  else if(result.length>0){
   //     console.log("megh");
   //    //  bcrypt.compare(password,result[0].password,(error,response)=>{
   //       console.log(password);
   //       console.log(result[0].password);
   //       console.log(passwordHash.verify(req.body.password,result[0].password));
   //       passwordHash.verify(password,result[0].password,(error,response)=>{
   //       // console.log(password);
   //       // console.log(result[0].password);
   //        if(response){
   //          //  if(req.session.user){
   //          //  req.session.user=result;
   //          // console.log(req.session.user);
           
   //         res.redirect('/home');
   //             }
          
   //        else{
   //           message="password is incorrect";
   //           res.render('index',{message:message})
   //          // console.log(error)
   //        }
   //       // }
   //     })
   //    }
   //  else{
   //          message="user does not exists";
   //          res.render('index',{message:message})
   //           }
    res.redirect('/home');
 })

})
//  app.get('/home',function(req,res){
//      if(req.session.user){
//         var message='';
//         mysqlConnection.query("select *from userdonor",(err,rows,fields)=>{
//          if(err){
//             console.log(err);  
//          }else{
//         res.render('home',{userdonor:rows})
//          }
//       })
      // mysqlConnection.query('select donor.u_id,donor.b_group,donor.weight,donor.bp,donor.temp,donor.pulse,user.u_id,user.image,user.fname,user.status,user.lname,user.email,user.phno,user.address,user.city,user.gender,user.dob,user.age FROM donor,user WHERE donor.u_id=user.u_id and status="pending";',function(err,result){
      //    if(err){
      //       throw err;
      //    }
      //    else{
      //       obj={print:result}; 
      //       res.render('home',obj);
      //    }
      //    })
      // mysqlConnection.query("select *from userdonor ",(err,rows,fields)=>{
      //    if(err){
      //       console.log(err);  
      //    }else{
      //   res.render('home',{userdonor:rows})
      //    }
      // })
      
//     }else{
   //   res.redirect('/login');}
//  })
 app.get('/user',function(req,res){
   // if(req.session.user){
      var message='';
    res.render('user',{message:message})
 })
   //  else{
   //     res.redirect('/login')
   //  }
    
//  })
 app.get('/aboutus',function(req,res){
   res.render('about')
 })
 app.post('/aboutus',function(req,res){
    res.render('about')
 })

 app.get('/choice',function(req,res){
   res.render('choice')
 })
 app.post('/choice',function(req,res){
    res.render('choice');
 })
 app.get('/donor',function(req,res){
      var message='';
       res.render('donor',{message:message})
    
 })
 
 app.post('/donor',function(req,res){
    var message='';
   
    const b_group=req.body.b_group;
    const weight=req.body.weight;
    const bp=req.body.bp;
    const temp=req.body.temp;
    const pulse=req.body.pulse;
    mysqlConnection.query('insert into donor(b_group,weight,bp,temp,pulse) values(?,?,?,?,?)',[b_group,weight,bp,temp,pulse],
    (err,result)=>{
      console.log(err)
    }),
    message="success";
    res.render('donor',{message:message})
 })
 app.post('/user',function(req,res){
    var message='';
    const fname=req.body.fname;
    const lname=req.body.lname;
    const email=req.body.email;
    const phno=req.body.phno;
    const address=req.body.address;
    const city=req.body.city;
    const gender=req.body.gender;
    const dob=req.body.dob;
    const age=req.body.age;
    const status=req.body.status;
   //  const image=req.files.image;
   
    mysqlConnection.query('select *from user where email=?',[email],(err,result)=>{
      if(err){
         return console.log(err);
      }
       if(result.length>0){
          message="user with this email already exists please choose a different one";
          res.render('user',{message:message})
         }
         else{
            if(!req.files){
               return res.status(400).send('no files were uploaded')
            }
            var file=req.files.image;
            var img_name=file.name;
            if(file.mimetype=="image/jpeg"||file.mimetype=="image/png"||file.mimetype=="image/gif"){
               file.mv('public/images/'+file.name,function(err){
                  if(err)
                     return res.sendStatus(500).send(err);
    mysqlConnection.query('insert into user(fname,lname,email,phno,address,city,gender,dob,age,image) values(?,?,?,?,?,?,?,?,?,?)',[fname,lname,email,phno,address,city,gender,dob,age,req.files.image.name],
    (err,result)=>{
    res.redirect('/donor');
     
    })
   })
}
else{
   message="please upload .png,.jpeg";
   res.render('user',{message:message})
}
}
    
})
 })
app.get('/delete/:id',function(req,res,next){
   var id=req.params.id;
   var sql='DELETE FROM user WHERE u_id=?';
   mysqlConnection.query(sql,[id],function(err,data){
      if(err) throw err;
      console.log(data.affectedRows+"records(s) updated")
   });
   res.redirect('/adminpage')
})
app.post('/delete/:id',function(req,res){

})
app.get('/update/:u_id',function(req,res){
   var u_id=req.params.u_id;
   var message='';
 var sql=("select *from userdonors where u_id='"+u_id+"'")
 mysqlConnection.query(sql,[u_id],function(err,rows,fields){

 
      if(err){
         console.log(err)
      }else{
      res.render('update',{userdonors:rows});
      }
   })
})
app.post('/update/:u_id',function(req,res){
   var message='';
   var u_id=req.params.u_id;
   const fname=req.body.fname;
   const lname=req.body.lname;
   const email=req.body.email;
   const phno=req.body.phno;
   const address=req.body.address;
   const city=req.body.city;
   const gender=req.body.gender;
   const dob=req.body.dob;
   const age=req.body.age;
   const b_group=req.body.b_group;
   const weight=req.body.weight;
   const bp=req.body.bp;
   const temp=req.body.temp;
   const pulse=req.body.pulse;
   var query="update userdonors set fname=?,lname=?,email=?,phno=?,address=?,city=?,gender=?,dob=?,age=? where u_id='"+u_id+"'";
   mysqlConnection.query(query,[fname,lname,email,phno,address,city,gender,dob,age],function(err,rows,fields){
      if(err){
         console.log(err)
      }
      res.send('success')
      
   })
})
app.get('/deleteinfo/:email',function(req,res,next){
   var email=req.params.email;
   var sql='DELETE FROM acceptorinfo WHERE email=?';
   mysqlConnection.query(sql,[email],function(err,data){
      if(err) throw err;
      console.log(data.affectedRows+"records(s) updated")
   });
   res.redirect('/viewrequests')
})
app.post('/delete/:id',function(req,res){

})


app.get('/acceptor',function(req,res){
   var message="";
   res.render('acceptor',{message:message})
})
app.post('/acceptor',function(req,res){
   var message="";
   const a_email=req.body.a_email;
   const a_group=req.body.a_group;
   const a_temp=req.body.a_temp;
   mysqlConnection.query('insert into acceptor(a_email,a_group,a_temp) values(?,?,?)',[a_email,a_group,a_temp],
   (err,result)=>{
      console.log(result)
   }),
   message="success";
   res.render('acceptor',{message:message})
})
app.get('/viewrequests',function(req,res){
   mysqlConnection.query('select acceptor.a_email,acceptor.a_group,acceptor.a_temp,acceptorinfo.fname,acceptorinfo.lname,acceptorinfo.email,acceptorinfo.phno,acceptorinfo.city FROM acceptor,acceptorinfo WHERE acceptor.a_email=acceptorinfo.email;',function(err,result){
      if(err){
         throw err;
      }
      else{
         obj={print:result};
         res.render('viewrequests',obj);
      }
      })
   })

app.post('/viewrequests',function(req,res){
   res.render('viewrequests')
})

 app.post('/home',function(req,res){
    res.render('home')
 })
 app.get('/register',function(req,res){
    var message="";
   const username=req.body.username;
   const email=req.body.email;
   const password=req.body.password;
   res.render('register',{message:message});
 })
 app.get('/donorinfo',function(req,res){
   mysqlConnection.query("select *from userdonor",(err,rows,fields)=>{
      if(err){
         console.log(err);  
      }else{
     res.render('donorinfo',{userdonor:rows})
      }
   })
})
 app.post('/donorinfo',function(req,res){
      

      
      res.render('donorinfo')
   })
 app.get('/acceptorinfo',function(req,res){
   var message='';
   res.render('acceptorinfo',{message:message})
 })
 app.post('/acceptorinfo',function(req,res){
   var message='';
    
    const fname=req.body.fname;
    const lname=req.body.lname;
    const email=req.body.email;
    const phno=req.body.phno;
   
    const city=req.body.city;
   
    mysqlConnection.query('select *from acceptorinfo where email=?',[email],(err,result)=>{
      if(err){
         return console.log(err);
      }
       if(result.length>0){
          message="user with this email already exists please choose a different one";
          res.render('user',{message:message})
         }
         else{
         
            
    mysqlConnection.query('insert into acceptorinfo(fname,lname,email,phno,city) values(?,?,?,?,?)',[fname,lname,email,phno,city],
    (err,result)=>{
    res.redirect('/acceptor');
     
    })
   
            
         }
      })
   })
 

 app.post('/register',[
   check('username',"This username must be atleast 3 characters long")
   .exists()
   .isLength({min:3}),
   check('email',"Email Invalid")
   .isEmail()
   .normalizeEmail(),
   check('password',"This password must be atleast 3 characters long")
   .exists()
   .isLength({min:3})

 ],function(req,res){
   //const name=req.body.name;
   var message="";
   const errors=validationResult(req)
   if(!errors.isEmpty()){
      // return res.status(422).jsonp(errors.array())
      const alert=errors.array();
      res.render('register',{
         alert,message:message
      })
   }else{
   const username=req.body.username;
   const email=req.body.email;
   const password=req.body.password;
   console.log(req.body.username);
   console.log(req.body.email)
   console.log(req.body.password)
   const hash=passwordHash.generate(password);
   // bcrypt.hash(password,saltRounds,(err,hash)=>{
      // passwordHash.generate(password,(err,hash)=>{
      // if(err){
      //    console.log(err);
      // }
       mysqlConnection.query('select *from users where username=?',[username],(err,result)=>{
         if(err){
            return console.log(err);
         }
          if(result.length>0){
           message="username exists";
           res.render('register',{message:message});

            }

         else{
            mysqlConnection.query("insert into users(username,email,password) values(?,?,?)",[username,email,hash],
            (err,result)=>{
              res.redirect('/login')
               // }res.redirect('/login')
            })
         }
       })
   // })
}
})
// app.get('/side',function(req,res){
//    res.render('side')
// })
// app.post('/side',function(req,res){
//    res.render('side')
// })
// app.get('/viewinfo/:u_id',function(req,res){
//    var u_id=req.params.u_id;
//  var sql=("select *from userdonor where u_id='"+u_id+"'")
//  mysqlConnection.query(sql,function(err,rows,fields){

 
//       if(err){
//          console.log(err)
//       }else{
//       res.render('viewinfo',{userdonor:rows});
//       }
//    })
// })
app.get('/viewinfo/:u_id',function(req,res){
   var u_id=req.params.u_id;
 var sql=("select *from userdonors where u_id='"+u_id+"'")
 mysqlConnection.query(sql,function(err,rows,fields){

 
      if(err){
         console.log(err)
      }else{
      res.render('viewinfo',{userdonors:rows});
      }
   })
})
app.post('/viewinfo/:u_id',function(req,res){

})
app.get('/pendingreq/:u_id',function(req,res){
   var u_id=req.params.u_id;
 var sql=("select *from userdonors where u_id='"+u_id+"'")
 mysqlConnection.query(sql,function(err,rows,fields){

 
      if(err){
         console.log(err)
      }else{
      res.render('viewinfo',{userdonors:rows});
      }
   })
})
app.post('/pendingreq/:u_id',function(req,res){

})
app.get('/view/:email',function(req,res){
   var email=req.params.email;
 var sql=("select *from acceptorinfo where email='"+email+"'")
 mysqlConnection.query(sql,function(err,rows,fields){

 
      if(err){
         console.log(err)
      }else{
      res.render('view',{accept:rows});
      }
   })
})
app.post('/view/:email',function(req,res){
   res.render('view')
})
app.post('/viewinfo/:u_id',function(req,res){
   res.render('viewinfo')
})
   app.get('/checkforavailability',function(req,res){
      mysqlConnection.query('select donor.u_id,donor.b_group,donor.weight,donor.bp,donor.temp,donor.pulse,user.u_id,user.fname,user.lname,user.email,user.phno,user.address,user.city,user.gender,user.dob,user.age FROM donor,user WHERE donor.u_id=user.u_id AND user.status="accepted";',function(err,result){
         if(err){
            throw err;
         }
         else{
            obj={print:result};
            res.render('checkforavailability',obj);
         }
         })
      })
   app.post('/checkforavailability',function(req,res){
     res.render('checkforavailability')
      })
      app.get('/logout',function(req,res){
         req.session.destroy();
         res.redirect('/login');
      });
   app.get('/feedback',function(req,res){
      var message=''
      res.render('feedback',{message:message})
      
   })
   app.post('/feedback',function(req,res){
      const name=req.body.name;
      var message=''
      const review=req.body.review;
      mysqlConnection.query("insert into feedback(name,review) values(?,?);",[name,review],
      (err,result)=>{
         if(err){
            console.log(err)
         }else{
            message: "Successfully posted your feedback"
            res.render('feedback',{message:message})
         }
      })
   })
   app.get('/feedbackpage',function(req,res){
      if(req.session.users){
         mysqlConnection.query("select *from feedback",(err,rows,fields)=>{
            if(err){
               console.log(err);  
            }else{
           res.render('feedbackpage',{feedback:rows})
            }
         })
      }else{
         res.redirect('/admin')
      }
   })
   app.post('/feedbackpage',function(req,res){

   })
  
 app.listen(3000,(req,res)=>{
   console.log('server running in port 3000');
 })
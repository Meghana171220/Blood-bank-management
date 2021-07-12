router.get('/delete/:id',function(req,res,next){
    var id=user.u_id;
    var sql='DELETE FROM users WHERE id=?';
    mysqlConnection.query(sql,[id],function(err,data){
       if(err) throw err;
       console.log(data.affectedRows+"records(s) updated")
    });
    res.redirect('/adminpage')
 })

const mysql=require('mysql');
const mysqlConnection=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"dbmsmini",
    connectionLimit:10
})
mysqlConnection.connect((err)=>{
    if(!err){
        console.log('connected');
    }
    else{
        console.log('not connected');
    }
})

module.exports=mysqlConnection;
var express = require('express');
var router = express.Router();
// 获取mongodb
var MongoClient = require('mongodb').MongoClient;

// mongodb地址
var url = 'mongodb://127.0.0.1:27017';

/* GET users listing. */

router.get('/',function(req,res,next){

  MongoClient.connect(url,{useNewUrlParser:true},function(err,client){
    if(err){
      //连接数据库失败
      console.log('连接数据失败',err);
        // 有错误，渲染 error。ejs
        res.render('error',{
          message:'连接失败',
          status:err
        });
        return;
    }
    // 连接数据库，
    var db = client.db('user');//连接数据库 数据库名

    db.collection('users').find().toArray(function(err,data){
      if(err){
        console.log('查询用户数据失败',err);
        // 有错误，渲染 error。ejs
        res.render('error',{
          message:'查询失败',
          status:err
        })
      }else{
        console.log(data);
        res.render('users',{
          list:data
        });
      }
      //记得关闭数据库的连接
      client.close();
    })
  });
})
module.exports = router;

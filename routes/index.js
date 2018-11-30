var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
// router.get('/users.html',function(req,res){
//   res.render('users');
// })
// 品牌管理
router.get('/brand.html',function(req,res){
  res.redirect('/users/brand');
})
// 手机管理
router.get('/phone.html',function(req,res){
  res.redirect('/users/phone')
})
// 登录管理
router.get('/logon.html',function(req,res){
  res.render('logon')
})
// 注册管理
router.get('/register.html',function(req,res){
  res.render('register')
})

module.exports = router;

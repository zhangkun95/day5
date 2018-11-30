var express = require('express');
var router = express.Router();
var multer = require('multer');
// 获取async 异步请求
var async = require('async');
// mongodb ID格式转换
var ObjectId = require('mongodb').ObjectId;
// 获取mongodb数据库
var MongoClient = require('mongodb').MongoClient;

// mongodb地址
var url = 'mongodb://127.0.0.1:27017';

var upload = multer({ dest: 'C:/tmp' });
var fs = require('fs');
var path = require('path');


/* GET users listing. */

router.get('/', function (req, res, next) {
  var page = parseInt(req.query.page) || 1; // 页码
  var pageSize = parseInt(req.query.pageSize) || 5; // 每页显示的条数
  var totalSize = 0;  // 总条数
  // var data = [];
  // 连接数据库
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    if (err) {
      //连接数据库失败
      console.log('连接数据失败', err);
      // 有错误，渲染 error。ejs
      res.render('error', {
        message: '连接失败',
        status: err
      });
      return;
    }
    // 连接数据库，
    // 连接mongodb 访问数据库user
    var db = client.db('user');//连接数据库 数据库名

    async.series([
      function (cb) {
        // 查询数据库里面表users中有多少条记录
        db.collection('users').find().count(function (err, num) {
          if (err) {
            cb(err);
          } else {
            totalSize = num;
            cb(null);
          }
        })
      },
      function (cb) {
        // 查询指定位置的数据，并将结果转为数组
        db.collection('users').find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function (err, data) {
          if (err) {
            cb(err)
          } else {
            // data = data;
            cb(null, data)
          }
        })
      }
    ], function (err, results) {
      //  results 是async 每一个函数cb出的结果，如果没有输出undefined
      if (err) {
        res.render('error', {
          message: '错误',
          error: err
        })
      } else {
        var totalPage = Math.ceil(totalSize / pageSize); // 总页数 向上取整
        // console.log(req.cookies.username)
        res.render('users', {
          //  results 是async 每一个函数cb出的结果，如果没有输出undefined
          list: results[1],
          // totalSize: totalSize,
          totalPage: totalPage,
          pageSize: pageSize,
          currentPage: page,
          isAdmin: req.cookies.isAdmin,
          username: req.cookies.username
        })
      }
    })

    // db.collection('users').find().toArray(function (err, data) {
    //   if (err) {
    //     console.log('查询用户数据失败', err);
    //     // 有错误，渲染 error。ejs
    //     res.render('error', {
    //       message: '查询失败',
    //       status: err
    //     })
    //   } else {
    //     console.log(data);
    //     res.render('users', {
    //       list: data
    //     });
    //   }
    //   //记得关闭数据库的连接
    //   client.close();
    // })
  });
})
// 查询搜索内容
router.post('/search', function (req, res, next) {
  var page = parseInt(req.query.page) || 1; // 页码
  var pageSize = parseInt(req.query.pageSize) || 5; // 每页显示的条数
  var totalSize = 0;  // 总条数
  var search = req.body.search;
  searcht = new RegExp(search);
  console.log(search);
  // var data = [];
  // 连接数据库
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    if (err) {
      //连接数据库失败
      console.log('连接数据失败', err);
      // 有错误，渲染 error。ejs
      res.render('error', {
        message: '连接失败',
        status: err
      });
      return;
    }
    // 连接数据库，
    // 连接mongodb 访问数据库user
    var db = client.db('user');//连接数据库 数据库名
    async.series([
      function (cb) {
        // 查询数据库里面表users中有多少条记录
        db.collection('users').find({ username: searcht }).count(function (err, num) {
          if (err) {
            cb(err);
          } else {
            totalSize = num;
            cb(null);
          }
        })
      },
      function (cb) {
        // 查询指定位置的数据，并将结果转为数组
        db.collection('users').find({ username: searcht }).limit(pageSize).skip(page * pageSize - pageSize).toArray(function (err, data) {
          if (err) {
            cb(err)
          } else {
            // data = data;
            cb(null, data)
          }
        })
      }
    ], function (err, results) {
      //  results 是async 每一个函数cb出的结果，如果没有输出undefined
      if (err) {
        res.render('error', {
          message: '错误',
          error: err
        })
      } else {
        var totalPage = Math.ceil(totalSize / pageSize); // 总页数 向上取整
        res.render('users', {
          //  results 是async 每一个函数cb出的结果，如果没有输出undefined
          list: results[1],
          // totalSize: totalSize,
          totalPage: totalPage,
          pageSize: pageSize,
          currentPage: page,
          isAdmin: req.cookies.isAdmin,
          username: req.cookies.username
        })
      }
    })

    // db.collection('users').find().toArray(function (err, data) {
    //   if (err) {
    //     console.log('查询用户数据失败', err);
    //     // 有错误，渲染 error。ejs
    //     res.render('error', {
    //       message: '查询失败',
    //       status: err
    //     })
    //   } else {
    //     console.log(data);
    //     res.render('users', {
    //       list: data
    //     });
    //   }
    //   //记得关闭数据库的连接
    //   client.close();
    // })
  });
})
// 新增手机
router.post('/xphone', upload.single('img'), function (req, res) {
  // res.send(req.body.brand)
  var filename = 'images/' + new Date().getTime() + '_' + req.file.originalname;
  var newFileName = path.resolve(__dirname, '../public/', filename);
  try {
    var data = fs.readFileSync(req.file.path);
    fs.writeFileSync(newFileName, data);
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
      var db = client.db('user');
      db.collection('phone').insertOne({
        name: req.body.name,
        brand: req.body.brand,
        brandyj: req.body.brandyj,
        brandej: req.body.brandej,
        img: filename
      }, function (err) {
        res.redirect('/users/phone');
      })
    })
  } catch (error) {
    res.render('error', {
      message: '新增手机失败',
      error: error
    })
  }

})

// 手机管理数据库信息获取
router.get('/phone', function (req, res, next) {
  var page = parseInt(req.query.page) || 1; // 页码
  var pageSize = parseInt(req.query.pageSize) || 4; // 每页显示的条数
  var totalSize = 0;  // 总条数
  // var data = [];
  // 连接数据库
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    if (err) {
      //连接数据库失败
      console.log('连接数据失败', err);
      // 有错误，渲染 error。ejs
      res.render('error', {
        message: '连接失败',
        status: err
      });
      return;
    }
    // 连接数据库，
    // 连接mongodb 访问数据库user
    var db = client.db('user');//连接数据库 数据库名

    async.series([
      function (cb) {
        // 查询数据库里面表users中有多少条记录
        db.collection('phone').find().count(function (err, num) {
          if (err) {
            cb(err);
          } else {
            totalSize = num;
            cb(null);
          }
        })
      },
      function (cb) {
        // 查询指定位置的数据，并将结果转为数组
        db.collection('phone').find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function (err, data) {
          if (err) {
            cb(err)
          } else {
            // data = data;
            cb(null, data)
          }
        })
      }
    ], function (err, results) {
      //  results 是async 每一个函数cb出的结果，如果没有输出undefined
      if (err) {
        res.render('error', {
          message: '错误',
          error: err
        })
      } else {
        var totalPage = Math.ceil(totalSize / pageSize); // 总页数 向上取整
        // res.send(result[1]);
        console.log({ list: results[1] })
        res.render('phone', {
          //  results 是async 每一个函数cb出的结果，如果没有输出undefined
          list: results[1],
          // totalSize: totalSize,
          totalPage: totalPage,
          pageSize: pageSize,
          currentPage: page,
          isAdmin: req.cookies.isAdmin,
          username: req.cookies.username
        })

      }
    })
  });
})

// 清楚COOKIE
router.get('/cookie',function(req,res,next){
  res.clearCookie("username");
  res.clearCookie("isAdmin");
  res.render('logon');
})

//手机品牌数据增加

router.post('/xbrand', upload.single('img'), function (req, res) {
  // res.send(req.body.brand)
  var filename = 'images/' + new Date().getTime() + '_' + req.file.originalname;
  var newFileName = path.resolve(__dirname, '../public/', filename);
  try {
    var data = fs.readFileSync(req.file.path);
    fs.writeFileSync(newFileName, data);
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
      var db = client.db('user');
      db.collection('brand').insertOne({
        name: req.body.name,
        img: filename
      }, function (err) {
        // res.send('11111111111')
        res.redirect('/users/brand');
      })
    })
  } catch (error) {
    res.render('error', {
      message: '新增手机失败',
      error: error
    })
  }

})

// 手机品牌数据获取渲染
router.get('/brand', function (req, res, next) {
  var page = parseInt(req.query.page) || 1; // 页码
  var pageSize = parseInt(req.query.pageSize) || 4; // 每页显示的条数
  var totalSize = 0;  // 总条数
  // var data = [];
  // 连接数据库
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    if (err) {
      //连接数据库失败
      console.log('连接数据失败', err);
      // 有错误，渲染 error。ejs
      res.render('error', {
        message: '连接失败',
        status: err
      });
      return;
    }
    // 连接数据库，
    // 连接mongodb 访问数据库user
    var db = client.db('user');//连接数据库 数据库名

    async.series([
      function (cb) {
        // 查询数据库里面表users中有多少条记录
        db.collection('brand').find().count(function (err, num) {
          if (err) {
            cb(err);
          } else {
            totalSize = num;
            cb(null);
          }
        })
      },
      function (cb) {
        // 查询指定位置的数据，并将结果转为数组
        db.collection('brand').find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function (err, data) {
          if (err) {
            cb(err)
          } else {
            // data = data;
            cb(null, data)
          }
        })
      }
    ], function (err, results) {
      //  results 是async 每一个函数cb出的结果，如果没有输出undefined
      if (err) {
        res.render('error', {
          message: '错误',
          error: err
        })
      } else {
        var totalPage = Math.ceil(totalSize / pageSize); // 总页数 向上取整
        //  res.send(results[1]);
        // console.log({list:results[1]})
        res.render('brand', {
          //  results 是async 每一个函数cb出的结果，如果没有输出undefined
          list: results[1],
          // totalSize: totalSize,
          totalPage: totalPage,
          pageSize: pageSize,
          currentPage: page,
          isAdmin: req.cookies.isAdmin,
          username: req.cookies.username
        })

      }
    })
  });
})

//手机品牌数据增加

router.post('/xgbrand', upload.single('img'), function (req, res) {
  // res.send(req.body)
  var filename = 'images/' + new Date().getTime() + '_' + req.file.originalname;
  var newFileName = path.resolve(__dirname, '../public/', filename);
  try {
    var data = fs.readFileSync(req.file.path);
    fs.writeFileSync(newFileName, data);
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
      var db = client.db('user');
      // res.send(ObjectId(req.body._id))
      db.collection('brand').update({_id:ObjectId(req.body._id)},{$set:{img: filename,name:req.body.name}
      }, function (err) {
        // res.send('11111111111')
        res.redirect('/users/brand');
      })
    })
  } catch (error) {
    res.render('error', {
      message: '新增手机失败',
      error: error
    })
  }

})



// 获取cookie返回首页
router.get('/index', function (req, res) {
  res.render('index', {
    isAdmin: req.cookies.isAdmin,
    username: req.cookies.username
  });
})



// 登录
router.post('/logon', function (req, res) {
  console.log(req.body);
  // post方式使用req.body获取出传递的内容
  var username = req.body.name;
  var passward = req.body.pwp;
  if (!username) {
    res.render('error', {
      message: '用户名不能为空',
      error: new Error('用户名不能为空')
    })
    return;
  }
  if (!passward) {
    res.render('error', {
      message: '密码不能为空',
      error: new Error('密码不能为空')
    })
    return;
  }
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    if (err) {
      res.render('error', {
        message: '连接失败',
        error: err
      })
      return;
    }
    var db = client.db('user');
    db.collection('users').find({
      username: username,
      password: passward
    }).toArray(function (err, data) {
      if (err) {
        res.render('error', {
          message: '查询失败',
          error: err
        })
      } else if (data.length <= 0) {
        res.render('error', {
          message: '登录失败',
          error: new Error('登录失败')
        })
      } else {
        res.cookie('username', data[0].username, {
          maxAge: 10 * 60 * 1000
        });
        res.cookie("isAdmin", data[0].isAdmin, {
          maxAge: 10 * 60 * 1000
        });
        res.redirect('/users/index');
      }
      // 关闭连接数据库
      client.close();
    })
  })
})


// 注册操作
router.post('/register', function (req, res) {
  var name = req.body.name;
  var pwp = req.body.pwp;
  var nickname = req.body.nickname;
  var phone = req.body.phone;
  var isAdmin = req.body.isAdmin == 'yes' ? true : false;
  console.log(isAdmin)
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    if (err) {
      res.render('error', {
        message: '连接失败',
        error: err
      })
      return;
    }
    var db = client.db('user');
    async.series([
      function (cb) {
        db.collection('users').find({ username: name }).count(function (err, num) {
          if (err) {
            cb(err)
          } else if (num > 0) {
            cb(new Error('用户名已被使用'));
          } else {
            cb(null);
          }
        })
      },
      function (cb) {
        db.collection('users').insertOne({
          username: name,
          password: pwp,
          nickname: nickname,
          phone: phone,
          isAdmin: isAdmin
        }, function (err) {
          if (err) {
            cb(err);
          } else {
            cb(null);
          }
        })

      }
    ], function (err, result) {
      if (err) {
        res.render('error', {
          message: '错误',
          error: err
        })
      } else {
        // 设置响应头即http
        res.redirect('/logon.html');
      }
      client.close();
    })
  })
})

// 删除操作
router.get('/delete', function (req, res) {
  // get 方式获取传递的信息
  var id = req.query.id;
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    if (err) {
      res.render('error', {
        message: '连接失败',
        error: err
      })
      return;
    }
    var db = client.db('user');
    db.collection('users').deleteOne({
      _id: ObjectId(id)
    }, function (err) {
      if (err) {
        res.render('error', {
          message: '删除失败',
          error: err
        })
      } else {
        res.redirect('/users');
      }
      client.close();
    })
  })
})

// 删除操作phone
router.get('/deletep', function (req, res) {
  // get 方式获取传递的信息
  var id = req.query.id;
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    if (err) {
      res.render('error', {
        message: '连接失败',
        error: err
      })
      return;
    }
    var db = client.db('user');
    db.collection('phone').deleteOne({
      _id: ObjectId(id)
    }, function (err) {
      if (err) {
        res.render('error', {
          message: '删除失败',
          error: err
        })
      } else {
        res.redirect('/users/phone');
      }
      client.close();
    })
  })
})

// 删除操作brand
router.get('/deleteb', function (req, res) {
  // get 方式获取传递的信息
  var id = req.query.id;
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    if (err) {
      res.render('error', {
        message: '连接失败',
        error: err
      })
      return;
    }
    var db = client.db('user');
    db.collection('brand').deleteOne({
      _id: ObjectId(id)
    }, function (err) {
      if (err) {
        res.render('error', {
          message: '删除失败',
          error: err
        })
      } else {
        res.redirect('/users/brand');
      }
      client.close();
    })
  })
})

// 暴露接口router
module.exports = router;

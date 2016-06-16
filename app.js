var Twig = require('twig');
var express = require('express');

var app = express();

app.set('views', './views');
app.use(express.static('.'));

app.get('/', function(req,res) {
  return res.render('login.twig',{});
});

app.get('/list.html', function(req,res) {
  return res.render('list.twig',{});
});

app.get('/login.html', function(req,res) {
  return res.render('login.twig',{});
});

app.listen(3000);


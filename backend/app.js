var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const router = require('./routes');
const fs = require('fs')
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
var app = express();

const db = require('./db');

db(
  `mongodb+srv://db_admin_nodebackend:3FnBbWRvQFrWX1Zg@cluster0-blzmi.mongodb.net/pysa?retryWrites=true&w=majority`
);

const uploadsPath = `./uploads`;
fs.mkdirSync(uploadsPath, { recursive: true });
app.use(cors());
console.log('servidor encendido');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/default', express.static(path.join(__dirname, 'public/images/')));
app.use('/static', express.static(path.join(__dirname, 'uploads')));
// app.use(express.static(path.join(__dirname, 'public')));

router(app);

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

module.exports = app;

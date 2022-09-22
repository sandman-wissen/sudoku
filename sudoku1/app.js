const express = require("express");
const router = require('./router');
const app = express();
const port = 3000;

app.use(express.urlencoded({extended: false}));
app.use(express.json());

//Static Files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))

//Set Views
app.set('views', './views');
app.set('view engine', 'ejs')

//Router
app.use('/', router);

app.listen(port, ()=> {
    console.log("App running on: http://localhost:3000/")
});
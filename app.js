/* Arquivo central - contém as configurações principais do projeto */

//Carregando módulos 
const express = require("express");
const handlebars = require("express-handlebars");
const bodyparser = require("body-parser");
const app = express();
const admin = require("./Routes/admin");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const usuarios = require('./Routes/usuarios');
const passaport = require('passport');
require('./Config/auth')(passaport);
const db = 'mongodb+srv://rafaelzf:nega123@blogapp-dfbej.mongodb.net/test?retryWrites=true&w=majority';

//configurações

//////// sessão
app.use(session({
    secret: "LizVF2011",
    resave: true,
    saveUninitialized: true
}));
//passport tem que embaixo da definição de sessão e em cima da definição do Flash
app.use(passaport.initialize());
app.use(passaport.session());

//////// Flash - tem que ficar sempre abaixo da sessão
app.use(flash());

//////// Configurando Midleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash('error');
    res.locals.signupMessage = req.flash('signupMessage');
    res.locals.user = req.user || null;
    next();
});
//////// body-parser
app.use(bodyparser.urlencoded({ extended: true }))
app.use(bodyparser.json());
//Handlebars
app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//////// Mongoose
mongoose.Promise = global.Promise;
mongoose.connect(db, {
    useNewUrlParser: true
}).then(() => {
    console.log("Conexão com banco realizada...");
}).catch((err) => {
    console.log("Conexão com banco não realizada: " + err);
});

//////// Public
app.use(express.static(path.join(__dirname, "Public")))
    //rotas
app.use('/', admin);

app.use('/usuarios', usuarios)

//outros
//////// Abre o servidor http  
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log("servidor rodando...");
});
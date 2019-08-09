const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


//MODEL DE USUÁRIO
require('../Modules/usuario');
const Usuario = mongoose.model('usuarios');

module.exports = function(passport) {

    passport.use(new localStrategy({ usernameField: 'inputEmail', passwordField: 'inputPassword', passReqToCallback: true }, (req, email, senha, done) => {
        Usuario.findOne({ email: email }).then((usuario) => {

            if (!usuario) {
                console.log('Esta conta não existe');
                return done(null, false, { message: "Esta conta não existe" })
            }

            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                if (batem) {
                    return done(null, usuario, req.flash('signupMessage', 'Você está logado ao site'));
                } else {

                    console.log('Senha incorreta');
                    return done(null, false, { message: "Senha incorreta" })
                }
            });
        });
    }));


    //Funções que salvam o dado do usuario na sessão 

    passport.serializeUser((usuario, done) => {
        done(null, usuario.id);

    });

    //Procura um usuário pelo ID
    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, usuario) => {
            done(err, usuario);
        })
    })


};
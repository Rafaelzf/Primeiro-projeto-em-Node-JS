const express = require('express');
const router = express.Router();
const mongoosee = require('mongoose');
require('../Modules/usuario');
const usuario = mongoosee.model('usuarios');
const bycrypt = require('bcryptjs');
const passaport = require('passport');


router.get('/registro', (req, res) => {
    res.render('Usuarios/registro');
})

router.post('/registro', (req, res) => {
    var erros = [];

    if (!req.body.inputName || typeof req.body.inputName == undefined || req.body.inputName == null) {
        erros.push({ texto: "Nome iválido" })
    };

    if (!req.body.inputEmail || typeof req.body.inputEmail == undefined || req.body.inputEmail == null) {
        erros.push({ texto: "E-mail iválido" })
    };

    if (!req.body.inputPassword || typeof req.body.inputPassword == undefined || req.body.inputPassword == null) {
        erros.push({ texto: "Senha iválida" })
    };

    if (req.body.inputPassword < 4) {
        erros.push({ texto: "Senha muito curta" })
    };

    if (req.body.inputPassword != req.body.inputRepitaPassword) {
        erros.push({ texto: "As senhas estão diferentes, tente novamente" })
    };

    if (erros.length > 0) {
        res.render('usuarios/registro', { erros: erros });

    } else {
        usuario.findOne({ email: req.body.inputEmail }).then((usuarios) => {

            if (usuarios) {
                req.flash('error_msg', 'Já existe uma conta cadastrada com esse e-mail');
                res.redirect('/usuarios/registro');
            } else {

                const novoUsuario = new usuario({
                    nome: req.body.inputName,
                    email: req.body.inputEmail,
                    senha: req.body.inputPassword
                        //eAdmin: 1
                });

                //Encriptando a senha
                bycrypt.genSalt(10, (erro, salt) => {
                    bycrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash('erro_msg', 'Houve um erro durante o registro do usuário');
                            res.redirect('/');
                        }
                        //"Hashiando" a senha
                        novoUsuario.senha = hash;

                        //Salvando os dados do usuário no banco
                        novoUsuario.save().then(() => {
                            req.flash('success_msg', 'Usuário cirado com sucesso');
                            res.redirect('/');
                        }).catch((err) => {
                            req.flash('erro_msg', 'Houve um erro durante a criação do usuário :' + err);
                            res.redirect('/usuarios/registro');
                        });
                    });
                });
            };
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno');
            // res.redirect('/');
        });
    };
});

router.get('/login', (req, res) => {
    res.render('Usuarios/login')
});

//Rota de AUTENTICAÇÃO DE USUARIO
router.post('/login', (req, res, next) => {
    passaport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next);

});

router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('signupMessage', 'Deslogado com sucesso');
    res.redirect('/');
})

module.exports = router;
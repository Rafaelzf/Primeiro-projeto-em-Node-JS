// Rotas de admin
const express = require("express");
// Cria objeto de rota
const router = express.Router();
const bodyparser = require("body-parser");
//mongoose chamando model
const mongoose = require("mongoose");

//model de categoria
require("../Modules/Categoria/Categoria")
const Categoria = mongoose.model("categorias");

//model de postagem
require("../Modules/Postagem")
const Postagem = mongoose.model("postagens");

//helper
const { eAdmin } = require('../Helpers/eAdmin');

//Definição das rotas
router.get('/', (req, res) => {
    Postagem.find().populate('categorias').then((postagens) => {
        res.render('index', { postagens: postagens });
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno');
        res.redirect('/404');
    });
});


//Rota de erro
router.get('/404', (req, res) => {
    res.send('Erro 404!');
});

//rota da index de admin
router.get('/admin', eAdmin, (req, res) => {
    res.render('admin/index');
});


//Postagem comum
router.get('/postagem/:id', (req, res) => {

    Postagem.findOne({ _id: req.params.id }).then((postagens) => {
        if (postagens) {
            res.render('Postagem/index', { postagens: postagens });
        } else {
            req.flash('error_msg', 'Essa postagem não existe');
            // res.redirect('/');
        };

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno');
        res.redirect('/');
    });
});

//categorias geral lista as categorias
router.get('/categorias', (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('Categorias/index', { categorias: categorias });
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as categorias');
        res.redirect('/');
    })
});

//lista os posts de determinada categoria
router.get('/categorias/:slug', (req, res) => {

    Categoria.findOne({ slug: req.params.slug }).then((categorias) => {

        if (categorias) {
            Postagem.find({ categoria: categorias._id }).then((postagens) => {

                res.render('Categorias/Postagens', { postagens: postagens, categorias: categorias });

            }).catch((err) => {

                req.flash('error_msg', 'Houve um erro ao carregar os posts');
                res.redirect('/');
            });

        } else {
            req.flash('error_msg', 'Essa categoria não existe');
            res.redirect('/');
        };

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno ao carregar a página dessa categoria');
        res.redirect('/');
    })


});



//categorias painel admin
router.get('/admin/categorias', eAdmin, (req, res) => {
    Categoria.find().sort({ data: "desc" }).then((categorias) => {

        res.render('admin/categorias', { categorias: categorias });

    }).catch(() => {
        req.flash('error_msg', 'Erro ao listar as categorias');
        res.redirect('/admin');
    })
});

router.get('/admin/categorias/add', (req, res) => {
    res.render('admin/addcategorias');
});


///CATEGORIA NOVA
router.post('/admin/categorias/nova', eAdmin, (req, res) => {
    //validando o formulário
    erro = [];

    //Validação de slug existente no banco (slug repetido)
    Categoria.findOne({ slug: req.body.slug }).then((categorias) => {
        //
        if (categorias) {
            erro.push({ texto: "Slug Existente tente um novo" });
        }

    }).catch((err) => {
        req.flash('error_msg', 'Erro ao verificar slug existente: ' + err);
        res.redirect('/admin');

    }).then(() => {
        //Validação de categoria existente
        Categoria.findOne({ nome: req.body.nome }).then((categorias) => {
            //
            if (categorias) {
                erro.push({ texto: "Categoria Existente tente uma nova" });
            }

        }).catch((err) => {

            req.flash('error_msg', 'Erro ao verificar categoria existente: ' + err);
            res.redirect('/admin');

        }).then(() => {
            enviaNovaCategoria();
        });

    });


    function enviaNovaCategoria() {
        if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
            erro.push({ texto: "Nome inválido" });
        };

        if (req.body.nome.length < 4) {
            erro.push({ texto: "Nome da categoria muito pequeno" });
        };

        if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
            erro.push({ texto: "Slug inválido" });
        }

        if (erro.length > 0) {
            res.render('admin/addcategorias', { erro: erro });

        } else {

            //Guardando dentro do objeto NovaCategoria nome e slug que vem do formulário
            const NovaCategoria = {
                    nome: req.body.nome,
                    slug: req.body.slug
                }
                // insere no banco uma nova categoria
            new Categoria(NovaCategoria).save().then(() => {
                req.flash('success_msg', 'Categoria criada com sucesso!');
                //Caso o registro for feito com sucesso redireciona para a página de categorias
                res.redirect('/admin/categorias');
            }).catch((err) => {
                req.flash('error_msg', 'Erro ao cadastrar categoria');
                res.redirect('/admin');
            });
        };
    };
});

router.get('/admin/categorias/edit/:id', eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.params.id }).then((categorias) => {
        res.render('admin/editCategorias', { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe");
        res.redirect('/admin/categorias');
    })
});

router.post('/admin/categorias/edit', eAdmin, (req, res) => {

    //validando o formulário
    erro = [];

    Categoria.findOne({ _id: req.body.id }).then((categorias) => {
        categorias.nome = req.body.nome;
        categorias.slug = req.body.slug;

    }).catch((err) => {
        req.flash("error_msg", "Erro ao editar a categoria");
        res.redirect('/admin/categorias');

    }).then(() => {
        //Valida se o nomme da categoria já existe 
        Categoria.findOne({ nome: req.body.nome }).then((categorias) => {
            if (categorias) {
                erro.push({ texto: "Categoria Existente tente uma nova" });
            }

        }).catch((err) => {
            req.flash('error_msg', 'Erro ao verificar categoria existente: ' + err);
            res.redirect('/admin');

        }).then(() => {
            Categoria.findOne({ slug: req.body.slug }).then((categorias) => {
                //
                if (categorias) {
                    erro.push({ texto: "Slug Existente tente um novo" });
                }
            }).catch((err) => {
                req.flash('error_msg', 'Erro ao verificar o slug existente: ' + err);
                res.redirect('/admin');
            }).then(() => {
                enviaNovaCategoria();
            })
        })
    })

    function enviaNovaCategoria() {
        if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
            erro.push({ texto: "Nome inválido" });
        };

        if (req.body.nome.length < 4) {
            erro.push({ texto: "Nome da categoria muito pequeno" });
        };

        if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
            erro.push({ texto: "Slug inválido" });
        }

        if (erro.length > 0) {
            res.render('admin/editCategorias', { erro: erro });

        } else {

            categorias.save().then(() => {
                req.flash('success_msg', 'Categoria editada com sucesso');
                res.redirect('/admin/categorias');
            }).catch((err) => {
                req.flash('error_msg', 'Erro ao editar a categoria');
                res.redirect('/admin/categorias');
            });
        }
    }
});

router.post('/admin/categorias/deletar', eAdmin, (req, res) => {
    Categoria.remove({ _id: req.body.id }).then((categorias) => {
        req.flash('success_msg', 'Categoria deletada com sucesso');
        res.redirect('/admin/categorias');
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar a categoria");
        res.redirect('/admin/categorias');
    })

});

//Postagens
//categorias painel admin
router.get('/admin/postagens', eAdmin, (req, res) => {
    Postagem.find().populate('categoria').sort({ data: 'desc' }).then((postagens) => {
        res.render('admin/postagens', { postagens: postagens });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar as postagens " + err);
        res.redirect('/admin');
    });

});

//carrega o formulário na tela e traz irfomações do banco para o select
router.get('/admin/postagens/add', eAdmin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('admin/addpostagem', { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o fomulário");
        res.redirect('/admin');
    })

});

router.post('/admin/postagens/nova', eAdmin, (req, res) => {
    // não esquecer de validar
    var erros = [];

    if (req.body.categoria === "0") {
        erros.push({ texto: "Categoria inválida" });
    };

    if (erros.length > 0) {
        res.render('admin/addpostagem', { erros: erros });

    } else {

        //Guardando dentro do objeto NovaPostagem pega os dados do formulário
        const NovaPostagem = {
                titulo: req.body.titulo,
                slug: req.body.slug,
                descricao: req.body.descricao,
                conteudo: req.body.conteudo,
                categoria: req.body.categoria
            }
            // insere no banco uma nova categoria
        new Postagem(NovaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso!');
            //Caso o registro for feito com sucesso redireciona para a página de categorias
            res.redirect('/admin/postagens');
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao Postar');
            res.redirect('/admin/postagens');
        });
    }

});

//Editar postagem
router.get('/admin/postagens/edit/:id', eAdmin, (req, res) => {
    //Faz uma busca em postagens para preencher os campos das postagens exceto categoria
    Postagem.findOne({ _id: req.params.id }).then((postagens) => {
        // faz uma busca em categoria para preencher o campo de categoria (select)
        Categoria.find().then((categorias) => {
            res.render('admin/editPostagens', { postagens: postagens, categorias: categorias });

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar a categoria desta postagem");
            res.redirect('/admin/postagens');
        });


    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar esta postagem");
        res.redirect('/admin/postagens');
    })
});


router.post('/admin/postagens/edit', eAdmin, (req, res) => {
    //Não esquecer de validar
    Postagem.findOne({ _id: req.body.id }).then((postagens) => {

        postagens.titulo = req.body.titulo;
        postagens.slug = req.body.slug;
        postagens.descricao = req.body.descricao;
        postagens.conteudo = req.body.conteudo;
        postagens.categoria = req.body.categoria;

        postagens.save().then(() => {
            req.flash('success_msg', 'Postagem editada com sucesso');
            res.redirect('/admin/postagens');
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao editar a postagem');
            res.redirect('/admin/postagens');
        });

    }).catch((err) => {
        req.flash("error_msg", "Erro ao editar a postagem");
        res.redirect('/admin/postagens');
    });
});

//Deletar postagem
router.post('/admin/postagens/deletar', eAdmin, (req, res) => {
    Postagem.remove({ _id: req.body.id }).then((postagens) => {
        req.flash('success_msg', 'Postagem deletada com sucesso');
        res.redirect('/admin/postagens');
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar a postagem");
        res.redirect('/admin/postagens');
    })

});

//exporta o objeto para torná-lo acessível a outros arquivos
module.exports = router;
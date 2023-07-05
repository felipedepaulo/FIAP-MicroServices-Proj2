const express = require("express");
const bcrypt = require("bcrypt");
const gerarToken = require("../utils/gerartoken");
const verificarToken = require("../middleware/verificartoken");
const Conta = require("../models/conta");
const Cliente = require("../models/cliente");
const config = require("../config/settings");

const router = express.Router();

router.get("/getContas", (req, res) => {
    Conta.find()
    .then((result) => {
        res.status(200).send({ output: "Requisição processada com sucesso", payload: result });
    }).catch((erro) => {
        res.status(500).send({ output: `Erro ao processar dados -> ${erro}` });
    });
});

router.get("/getClientes", (req, res) => {
    Cliente.find()
    .then((result) => {
        res.status(200).send({ output: "Requisição processada com sucesso", payload: result });
    }).catch((erro) => {
        res.status(500).send({ output: `Erro ao processar dados -> ${erro}` });
    });
});

router.post("/cadastrar/:id", verificarToken, (req, res) => {
    Cliente.findById(req.params.id).then((result) => {
        if(!result){
            return res.status(404).send({ output: `Usuário não encontrado, tente novamente` });
        }
        const nomecompleto = result.nomecompleto
        const email = result.email
        Conta.findOne({email:email}).then((result) => {
            if(result){
                return res.status(400).send({ output: `Email em uso.`});
            }
            req.body.nome_titular = nomecompleto;
            req.body.email = email;
            req.body.apikey = req.headers.token;
            const dados = new Conta(req.body);
            dados.save().then((result) => {
                res.status(201).send({ output: `Conta cadastrada com exito`, payload: result });
            }).catch((erro) => {
                res.status(500).send({ output: `Erro ao cadastrar conta, tente novamente -> ${erro}` });
            });
        });
    });
})

router.put("/atualizar/:id", verificarToken, (req, res) => {
    Conta.findByIdAndUpdate(req.params.id, req.body, {new:true}).then((result) => {
        if(!result){
            return res.status(400).send({ output: `Não foi possível atualizar` });
        }
        res.status(202).send({ output: `Atualizado`, payload:result });
    }).catch((erro) => {
        res.status(500).send({ output: `Erro ao processar a solicitação -> ${erro}` });
    });
});

router.use((req, res) => {
    res.type("application/json");
    res.status(404).send({msg:`404 - Page Not Found`});
});

module.exports = router;
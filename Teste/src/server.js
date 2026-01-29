require('dotenv').config({path: '../.env'});

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

const app = express();
app.use(bodyParser.json());
app.use(cors());

dotenv.config();
const {DB_HOST, DB_PORT, DB_DATABASE, DB_USER, DB_PASSWORD} = process.env;

const conn = mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_DATABASE,
    user: DB_USER,
    password: DB_PASSWORD
});

conn.connect(error => {
    if (error) {
        console.error('Erro ao conectar ao banco de dados' + error.stack);
        return;
    }
    console.log('sucesso ao entrar no banco de dados!');
});

app.get('/users', (req, res) => {
    conn.query('SELECT * FROM users', (error, results) => {
        if (error) {
            res.status(500).send('Erro ao obter dados.');
            return;
        }
        res.json(results);
    });
});

app.get('/users/:id', (req, res) => {
    const id = parseInt(req.params.id);

    conn.query('SELECT * FROM users WHERE ID = ?', [id],(error, results) => {
        if (error) {
            res.status(500).send('Erro ao obter dados');
            return;
        }
        res.json(results[0]);
    })
});

app.post('/users', (req, res) => {
    const {nome, email, senha} = req.body;
    conn.query('INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)', [nome, email, senha], (error, results) => {
        if (error) {
            res.status(500).send('Erro ao adicionar.');
            return;
        }
        res.status(201).send('Sucesso ao adicionar!');
    })
})
app.put('/users/:id', (req, res) => {
    const {id} = req.params
    const {nome, email, senha} = req.body
    conn.query('UPDATE users SET nome = COALESCE(?, nome), email = COALESCE(?, email), senha = COALESCE(?, senha) WHERE id = ?', [nome, email, senha, id], (error, results) => {
        if (error) {
            res.status(500).send('Erro ao adicionar.');
            return;
        }
        res.status(201).send('Sucesso ao editar.');
    })
})
app.delete('/users/:id', (req, res) => {
    const {id} = req.params
    conn.query('DELETE FROM users WHERE id = ?', [id], (error) => {
        if (error) {
            res.status(500).send('Erro ao deletar.');
            return;
        }
        res.status(201).send('Sucesso ao editar.');
    })
})

const port = 1997;

app.listen(port, () =>
console.log(`Server rodando corretamente na porta https://localhost${port}`))
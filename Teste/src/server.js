require('dotenv').config({path: '../.env'});

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

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

app.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome ||  !email || !senha) {
        return res.status(400).send('Todos os campos são obrigatórios!');
    }
    try {
        conn.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
            if (error) {
                  res.status(500).send('Erro ao efetuar a busca!');
                  return;
            }
            if (results.length > 0) {
                res.status(409).send('Este e-mail já existe AAAAAAAAAAAAAAAA!');
                return;
            }
        });
    const senhahash = await bcrypt.hash(senha, 10);

    conn.query('INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)', [nome, email, senhahash], (error, results) => {
        if (error) {
            res.status(500).send('Error ao efetuar o registro!');
            return;
        }
        res.status(201).json({mensagem: 'Cadastro realizado com sucesso', usuario: { id: results.insertId, nome: nome, email: email, senha: senhahash } });
    });

    } catch (error) {
        console.error('Erro ao efetuar o cadastro!' + error.stack);
        res.status(500).send('Erro ao efetuar o cadastro!');
    }
});
app.post('/login', async (req, res) => {
    const { email, senha} = req.body;

    if (!email || !senha) {
        res.status(400).send('TOdos os campos são obrigatórios!');
        return;
    }
    try {
        conn.query('ELECT* FROM users WHERE email = ?', [email], async (error, results) => {
            if (error) {
                res.status(500).send('Erro de login');
                return;
            }
            if (results.length == 0) {
                res.status(404).send('usuário não encontrado :( ... lágrimas, lágrimas.');
                return;
            }
            if (results.length > 0) {
                const user = results[0];

                const rightsenha = await bcrypt.compare(senha, user.senha);

                if (rightsenha) {
                    res.status(200).send('login de usuário efetuado com sucesso!');
                    return;
                }
                res.status(401).send('senha incorreta, tente novamente daqui à sete anos.');
                return;
            }
        });
    } catch (error) {
        console.error('Erro ao efetuar o login', + error.stack);
        res.status(500).send('Erro ao dar certo');
    }
});


app.listen(port, () =>
console.log(`Server rodando corretamente na porta https://localhost${port}`));
require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());

// 🔗 conexão
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// 🔐 middleware JWT
function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) return res.status(403).json({ error: 'Sem token' });

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

// ==========================
// 🔐 LOGIN
// ==========================
app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;

  db.query(
    'SELECT * FROM cadastro WHERE matricula = ?',
    [usuario],
    async (err, result) => {

      if (err) return res.status(500).send(err);

      if (result.length === 0) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      const user = result[0];

      // 🔥 aqui você muda: user.senha → user.pwdf
      const senhaValida = senha === user.pwd;

      if (!senhaValida) {
        return res.status(401).json({ error: 'Senha inválida' });
      }

      const token = jwt.sign(
        {
          matricula: user.matricula
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ token });
    }
  );
});
// ==========================
// 🔒 CRUD PROTEGIDO
// ==========================

// LISTAR
app.get('/cadastro', auth, (req, res) => {
  db.query('SELECT matricula, nome FROM cadastro', (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// BUSCAR
app.get('/cadastro/:id', auth, (req, res) => {
  const { id } = req.params;

  db.query(
    'SELECT matricula, nome FROM cadastro WHERE matricula = ?',
    [id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json(result[0] || {});
    }
  );
});

// INSERT
app.post('/cadastro', auth, (req, res) => {
  const { nome } = req.body;

  db.query(
    'INSERT INTO cadastro (nome) VALUES (?)',
    [nome],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Criado', id: result.insertId });
    }
  );
});

// UPDATE
app.put('/cadastro/:id', auth, (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;

  db.query(
    'UPDATE cadastro SET nome = ? WHERE matricula = ?',
    [nome, id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Atualizado' });
    }
  );
});

// DELETE
app.delete('/cadastro/:id', auth, (req, res) => {
  const { id } = req.params;

  db.query(
    'DELETE FROM cadastro WHERE matricula = ?',
    [id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Deletado' });
    }
  );
});

app.listen(3000, () => console.log('🚀 Rodando na porta 3000'));
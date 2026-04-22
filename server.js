require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

// conexão
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// middleware JWT
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
// 🔐 LOGIN SIMPLES (sem bcrypt por enquanto)
// ==========================
app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;

  db.query(
    'SELECT * FROM cadastro WHERE matricula = ?',
    [usuario],
    (err, result) => {

      if (err) return res.status(500).send(err);

      if (result.length === 0) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      const user = result[0];

      // 🔥 comparação simples (porque sua senha não está criptografada)
      if (senha !== user.pwd) {
        return res.status(401).json({ error: 'Senha inválida' });
      }

      const token = jwt.sign(
        { matricula: user.matricula },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ token });
    }
  );
});

// ==========================
// 🔒 LISTAR (CORRIGIDO)
// ==========================
app.get('/cadastro', auth, (req, res) => {
  db.query(
    'SELECT matricula, nome, funcao, unidade, foto FROM cadastro',
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json(result);
    }
  );
});

app.listen(3000, () => console.log('🚀 Rodando na porta 3000'));
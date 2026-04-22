const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 🔗 conexão com seu MySQL
const db = mysql.createConnection({
  host: '192.168.255.37',
  user: 'root',
  password: 'Kilimanjaro@123',
  database: 'baltazar'
});

// ==========================
// 🔍 LISTAR TODOS
// ==========================
app.get('/cadastro', (req, res) => {
  db.query('SELECT * FROM cadastro', (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// ==========================
// 🔍 BUSCAR POR ID
// ==========================
app.get('/cadastro/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM cadastro WHERE matricula = ?', [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result[0]);
  });
});
// ==========================
// ➕ INSERT
// ==========================
app.post('/cadastro', (req, res) => {
  const dados = req.body;

  db.query('INSERT INTO cadastro SET ?', dados, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Criado com sucesso', id: result.insertId });
  });
});

// ==========================
// ✏️ UPDATE
// ==========================
app.put('/cadastro/:id', (req, res) => {
  const { id } = req.params;
  const dados = req.body;

  db.query('UPDATE cadastro SET ? WHERE matricula = ?', [dados, id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Atualizado com sucesso' });
  });
});

// ==========================
// ❌ DELETE
// ==========================
app.delete('/cadastro/:id', (req, res) => {
  const { id } = req.params;
 db.query('DELETE FROM cadastro WHERE matricula = ?', [id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Deletado com sucesso' });
  });
});

// ==========================
app.listen(3000, () => {
  console.log('🚀 API rodando na porta 3000');
});


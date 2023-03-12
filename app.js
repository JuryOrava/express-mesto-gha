const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const routerUser = require('./routes/users');
const routerCard = require('./routes/cards');

const ERROR_CODE = 404;

const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.user = {
    _id: '640c54cc67c05a894fba0dc5', // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});

app.use('/', routerUser);
app.use('/', routerCard);
app.patch('*', (req, res) => {
  res.status(ERROR_CODE).send({ message: 'Запрашиваемая страница не найдена' });
});

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

/* eslint-disable no-console */
const express = require('express');
const morgan = require('morgan'); // http request templating agent
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const config = require('./app/config');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

app.use(morgan('dev'));

const { routes } = require('./app');

app.get('/', (req, res) => {
  res.send('<h1>Enter appropriate API</h1>');
});

app.use('/api', routes.main);
app.use('/api/admin', routes.admin);
app.use('/api/student', routes.students);
app.use('/api/staff', routes.staff);
app.use('/api/lecturer', routes.lecturer);

app.listen(config.port, () => {
  console.log(`Server is listening on ${config.port}`);
});

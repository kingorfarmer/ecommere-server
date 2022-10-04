const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path')

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

const publicPath = path.join(__dirname, './public')
app.use(express.static(publicPath))
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests',
});

app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));

//NoSQL query injection
app.use(mongoSanitize());

//XSS
app.use(xss());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['duration'],
  })
);

app.use((req, res, next) => {
  console.log('Middleware');
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.get('/', (req, res) => {
  res.status(200).json({ app: 'demo', message: 'Hello!' });
  res.sendFile(__dirname + '/index.html');
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use(globalErrorHandler);

module.exports = app;

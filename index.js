const http = require('http');
const mercadopago = require('mercadopago');
const fs = require('fs');
const path = require('path');
const PATH = path.resolve(__dirname, 'payments', 'payments.json');

mercadopago.configurations.setAccessToken('TEST-1975651894202504-021815-0e6f3e6fafe6eb28bd68353c5fce8824-528302578');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
const server = http.Server(app);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  next();
});

app.use(bodyParser.json({ limit: '50mb' }));

app.post('/pay', (req, res) => {
  console.log('AQUI ME IMPRIMO YO', req.body);
  var payment_data = {
    transaction_amount: 100,
    token: req.body.token,
    description: 'Concept proof',
    installments: 1,
    payment_method_id: req.body.paymentMethodId,
    payer: {
      email: req.body.email,
    },
    capture: false,
  };

  mercadopago.payment.create(payment_data).then(function (paymentData) {
    console.log('paymentData', paymentData);
    
    try {
      // verify file existence
      fs.readFileSync(PATH);
    } catch (error) {
      fs.writeFileSync(PATH, '[]');
    }

    const dataString = fs.readFileSync(PATH).toString();
    const data = JSON.parse(dataString);

    data.push(
      { paymentId: paymentData.body.id, token: payment_data.token, status: paymentData.body.status_detail, captured: paymentData.body.captured }
    );

    fs.writeFileSync(PATH, JSON.stringify(data, null, 2)); 
    // Do Stuff...
  }).catch(function (error) {
    // Do Stuff...
    console.log(error);
  });

  return res.json({ message: 'Payment has been received' });
});

app.put('/capture', async (req, res) => {
  try {
    const payment_data = {
      id: req.body.paymentId,
      capture: true,
    }

    console.log('payment_data', payment_data);

    const result = await mercadopago.payment.update(payment_data);
  
    if (result) {
      const dataString = fs.readFileSync(PATH).toString();
      const data = JSON.parse(dataString);

      console.log('payment_data', payment_data);
      console.log('data', data);

      const payment = data.find((pay) => pay.paymentId === Number(req.body.paymentId) && pay.status === 'pending_capture');

      payment.status = result.body.status;
      payment.captured = result.body.captured;

      fs.writeFileSync(PATH, JSON.stringify(data, null, 2)); 
    }
    
    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error: 'An error ocurred' });
  }
});

const PORT = process.env.SERVER_PORT || 9000;

server.listen(PORT);

// eslint-disable-next-line no-console
console.log(`server running on port ${PORT}`);
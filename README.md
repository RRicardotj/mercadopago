# mercadopago
This is an basic example project for testing mercadopago payments capture APIs

## Getting started
In the index directory of the project you will find a index.html. This html doesn't required any npm packages to work because mercadopago dependecies are imported on the html.
But this project contains also a basic NODEJS API. For this api you will need to install express and body-parser dependencies.

Just run `npm install` and later `npm start` to initialize API

By default API runs over port `9000`

THE API contantains two simple routes POST `/pay` and  PUT `/capture`

The first one `/pay` is used by the client mercadopago form and the second one `/capture` you have to send a http request manually to that endpoint

When you create an payment using the client form, the payment result is saved in a file `payments.json` inside `/payments` folder in the root directory.
Each payment created have a paymentId. You must to send that parammeter `paymentId` when you hit to `PUT /capture` endpoint to capture the payment 

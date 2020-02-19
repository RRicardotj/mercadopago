window.Mercadopago.setPublishableKey("TEST-14dcb83d-1fcc-4fb3-867c-2e59aadcdee7");

window.Mercadopago.getIdentificationTypes();


function setInstallmentInfo(status, response) {
    var selectorInstallments = document.querySelector("#installments"),
    fragment = document.createDocumentFragment();
    selectorInstallments.options.length = 0;

    if (response.length > 0) {
        var option = new Option("Escolha...", '-1'),
        payerCosts = response[0].payer_costs;
        fragment.appendChild(option);

        for (var i = 0; i < payerCosts.length; i++) {
            fragment.appendChild(new Option(payerCosts[i].recommended_message, payerCosts[i].installments));
        }

        selectorInstallments.appendChild(fragment);
        selectorInstallments.removeAttribute('disabled');
    }
};


function addEvent(to, type, fn){ 
  if(document.addEventListener){
      to.addEventListener(type, fn, false);
  } else if(document.attachEvent){
      to.attachEvent('on'+type, fn);
  } else {
      to['on'+type] = fn;
  }  
}; 

addEvent(document.querySelector('#cardNumber'), 'keyup', guessingPaymentMethod);
addEvent(document.querySelector('#cardNumber'), 'change', guessingPaymentMethod);

function getBin() {
const cardnumber = document.getElementById("cardNumber");
return cardnumber.value.substring(0,6);
};

function guessingPaymentMethod(event) {
var bin = getBin();

if (event.type == "keyup") {
  if (bin.length >= 6) {
      window.Mercadopago.getPaymentMethod({
          "bin": bin
      }, setPaymentMethodInfo);
  }
} else {
  setTimeout(function() {
      if (bin.length >= 6) {
          window.Mercadopago.getPaymentMethod({
              "bin": bin
          }, setPaymentMethodInfo);
      }
  }, 100);
}
};

function setPaymentMethodInfo(status, response) {
if (status == 200) {
  const paymentMethodElement = document.querySelector('input[name=paymentMethodId]');

  if (paymentMethodElement) {
      paymentMethodElement.value = response[0].id;
  } else {
      const input = document.createElement('input');
      input.setAttribute('name', 'paymentMethodId');
      input.setAttribute('type', 'hidden');
      input.setAttribute('value', response[0].id);     

      form.appendChild(input);
  }

  Mercadopago.getInstallments({
      "bin": getBin(),
      "amount": parseFloat(document.querySelector('#amount').value),
  }, setInstallmentInfo);

} else {
  alert(`payment method info error: ${response}`);  
}
};


doSubmit = false;
addEvent(document.querySelector('#pay'), 'submit', doPay);
function doPay(event){
    event.preventDefault();
    if(!doSubmit){
        var $form = document.querySelector('#pay');

        window.Mercadopago.createToken($form, sdkResponseHandler); // The function "sdkResponseHandler" is defined below

        return false;
    }
};

function sdkResponseHandler(status, response) {
    if (status != 200 && status != 201) {
        alert("verify filled data");
    }else{
        var form = document.querySelector('#pay');
        var card = document.createElement('input');
        card.setAttribute('name', 'token');
        card.setAttribute('type', 'hidden');
        card.setAttribute('value', response.id);
        form.appendChild(card);
        doSubmit=true;
        form.submit();
        // console.log(form);
        // alert(JSON.stringify(response));
    }
};
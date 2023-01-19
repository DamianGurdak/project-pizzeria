import { select, classNames, templates, settings } from '../settings.js';
import { utils } from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];
    console.log('tablica prduktów:', thisCart.products);

    thisCart.getElements(element);
    thisCart.initActions();

    // console.log('new Cart: ', thisCart);
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
      select.cart.toggleTrigger
    );
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
      select.cart.productList
    );
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(
      select.cart.deliveryFee
    );
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(
      select.cart.subtotalPrice
    );
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(
      select.cart.totalPrice
    );
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(
      select.cart.totalNumber
    );
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(
      select.cart.address
    );
  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct) {
    const thisCart = this;

    /* [DONE] generate HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);

    /* [DONE]  create element using utils.createElementFromHTML */
    const generateDOM = utils.createDOMFromHTML(generatedHTML);

    /* [DONE] add element to cart */
    thisCart.dom.productList.appendChild(generateDOM);

    /* [] add cartProducts to array*/
    thisCart.products.push(new CartProduct(menuProduct, generateDOM));
    // console.log('tablica produktów:', thisCart.products);
    // console.log('adding product:', menuProduct);

    thisCart.update();
  }
  update() {
    const thisCart = this;

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.totalNumber = 0; //całościowej liczbie sztuk
    thisCart.subtotalPrice = 0; //zsumowanej cenie za wszystko (chociaż bez kosztu dostawy)
    thisCart.totalPrice = 0;

    for (let cartProduct of thisCart.products) {
      thisCart.totalNumber += cartProduct.amount;
      thisCart.subtotalPrice += cartProduct.price;
    }

    if (thisCart.subtotalPrice != 0) {
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    }

    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee; //
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice; //

    for (let price of thisCart.dom.totalPrice) {
      price.innerHTML = thisCart.totalPrice;
    }

    // thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;

    console.log('----------------------------');
    console.log('amout prize:', thisCart.totalNumber);
    console.log('prize without delivery:', thisCart.subtotalPrice);
    console.log('totalPrice:', thisCart.totalPrice);
  }
  remove(cartProduct) {
    const thisCart = this;

    const indexCartProduct = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(indexCartProduct, 1);

    cartProduct.dom.wrapper.remove();

    thisCart.update();
  }

  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      address: thisCart.dom.address,
      phone: thisCart.dom.phone,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    console.log('payload:', payload);

    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponde:', parsedResponse);
      });
  }
}

export default Cart;

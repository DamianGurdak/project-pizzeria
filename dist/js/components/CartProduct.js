import { select } from '../settings';
import AmountWidget from './AmountWidget';

class CartProduct {
  constructor(menuProduct, element) {
    //  Pierwszy arg będzie przyjmował referencję do obiektu podsumowania, a drugi referencję do utworzonego dla tego produktu elementu HTML-u (generatedDOM).
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.params = menuProduct.params;

    thisCartProduct.getElements(element);
    thisCartProduct.amountWidget();
    thisCartProduct.initActions();

    // console.log('newCartProduct:', thisCartProduct);
  }

  getElements(element) {
    const thisCartProduct = this;

    thisCartProduct.dom = {};

    thisCartProduct.dom.wrapper = element; //to referencja do oryginalnego elementu DOM

    thisCartProduct.dom.amountWidget = element.querySelector(
      select.cartProduct.amountWidget
    );
    thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = element.querySelector(
      select.cartProduct.remove
    );
  }

  amountWidget() {
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(
      thisCartProduct.dom.amountWidget
    ); //tutaj nie szuka

    thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
      thisCartProduct.amount = thisCartProduct.amountWidget.value; // aktualna wartość widgetu (czyli liczby sztuk)

      // thisCartProduct.amount = thisCartProduct.amountWidget.value; //albo z value

      thisCartProduct.price =
        thisCartProduct.priceSingle * thisCartProduct.amount;

      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });
  }

  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: { cartProduct: thisCartProduct },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
    // console.log(thisCartProduct.remove);
  }

  initActions() {
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function (event) {
      event.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener('click', function (event) {
      event.preventDefault();
      thisCartProduct.remove();
    });
  }

  getData() {
    const thisCartProduct = this;

    const productSummary = {};

    productSummary.id = thisCartProduct.id;
    productSummary.amount = thisCartProduct.amount;
    productSummary.price = thisCartProduct.price;
    productSummary.priceSingle = thisCartProduct.prepareCartProduct;
    productSummary.name = thisCartProduct.name;
    productSummary.params = thisCartProduct.params;

    return productSummary;
  }
}
export default CartProduct;

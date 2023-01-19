import { select, templates, classNames } from './settings';
import utils from './utils';
import AmountWidget from './AmountWidget';

class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.randerInMenu(); //  uruchomił tę funkcję od razu po utworzeniu instancji
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.initProcesOrder();

    // console.log('newProduct:', thisProduct);
  }

  randerInMenu() {
    const thisProduct = this;

    /* [DONE] generate HTML based on template */
    const generateHTML = templates.menuProduct(thisProduct.data);
    // console.log('generateHTML:', generateHTML);

    /* [DONE]  create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generateHTML); // element DOM zapisujemy od razu jako właściwość naszej instancji. To dobra praktyka. Dzięki temu będziemy mieli do niego dostęp również w innych metodach instancji. Nie tylko w renderInMenu

    /* [DONE] find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* [DONE] add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(
      select.menuProduct.clickable
    );
    thisProduct.form = thisProduct.element.querySelector(
      select.menuProduct.form
    );
    thisProduct.formInputs = thisProduct.form.querySelectorAll(
      select.all.formInputs
    );
    thisProduct.cartButton = thisProduct.element.querySelector(
      select.menuProduct.cartButton
    );
    thisProduct.priceElem = thisProduct.element.querySelector(
      select.menuProduct.priceElem
    );
    thisProduct.imageWrapper = thisProduct.element.querySelector(
      select.menuProduct.imageWrapper
    );
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(
      select.menuProduct.amountWidget
    );
  }

  initAccordion() {
    const thisProduct = this;

    /* [DONE] START: add event listener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function (event) {
      /* [DONE] prevent default action for event */
      event.preventDefault();

      /* [DONE] find active product (product that has active class) */
      const activeProduct = document.querySelector(
        select.all.menuProductsActive
      );

      /* [DONE] if there is active product and it's not thisProduct.element, remove class active from it */
      if (activeProduct && activeProduct != thisProduct.element) {
        activeProduct.classList.remove('active');
      }

      /* [DONE] toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle('active');
    });
  }

  initOrderForm() {
    const thisProduct = this;
    // console.log('--------------- initORrderForm ---------------');

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.initProcesOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.initProcesOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.initProcesOrder();
      thisProduct.addToCart();
    });
  }

  initProcesOrder() {
    const thisProduct = this;
    // console.log('--------------- procesOrder ---------------');

    // [IN PROGRESS] covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    // console.log('formData', formData);

    // [IN PROGRESS] set price to default price
    let price = thisProduct.data.price;

    // [IN PROGRESS] for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // [IN PROGRESS] determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      // console.log('param:', param);
      // console.log('paramId:', paramId);

      // [IN PROGRESS] for every option in this category
      for (let optionId in param.options) {
        // [IN PROGRESS] determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        // console.log('option:', option);
        // console.log('optionId:', optionId);

        // [IN PROFRESS] // check if there is param with a name of paramId in formData and if it includes optionId
        const selectedOption =
          formData[paramId] && formData[paramId].includes(optionId);
        if (selectedOption) {
          // check if the option is not default
          if (!option.default) {
            // add option price to price variable
            price += option.price;
          }
        } else {
          // check if the option is default
          if (option.default) {
            // reduce price variable
            price -= option.price;
          }
        }

        const optionImage = thisProduct.imageWrapper.querySelector(
          '.' + paramId + '-' + optionId
        );
        // console.log('optionImage:', optionImage); // w konsoli był null

        if (optionImage) {
          if (selectedOption) {
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          } else {
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    thisProduct.priceSingle = price;

    /* multiply price by amount */
    price *= thisProduct.amountWidget.value;

    // [IN PROGRESS] update calculated price in the HTML
    thisProduct.priceElem.innerHTML = price;
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.initProcesOrder();
    });
  }

  addToCart() {
    const thisProduct = this;

    // app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct() {
    const thisProduct = this;

    const productSummary = {};

    productSummary.id = thisProduct.id;
    productSummary.name = thisProduct.data.name;
    productSummary.amount = thisProduct.amountWidget.value;
    productSummary.priceSingle = thisProduct.priceSingle;
    productSummary.price =
      thisProduct.priceSingle * thisProduct.amountWidget.value;
    productSummary.params = thisProduct.prepareCartProductParams();

    return productSummary;
  }

  prepareCartProductParams() {
    const thisProduct = this;
    // console.log('--------------- procesOrder ---------------');

    // [DONE] covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    // console.log('formData', formData);

    const params = {};

    // [DONE] for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // [IN PROGRESS] determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      // console.log('param:', param);
      // console.log('paramId:', paramId);

      // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
      params[paramId] = {
        label: param.label,
        options: {},
      };

      // [DONE] for every option in this category
      for (let optionId in param.options) {
        // [IN PROGRESS] determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        // console.log('option:', option);
        // console.log('optionId:', optionId);

        // [IN PROFRESS] // check if there is param with a name of paramId in formData and if it includes optionId
        const selectedOption =
          formData[paramId] && formData[paramId].includes(optionId);

        if (selectedOption) {
          params[paramId].options[optionId] = option.label;
        }
      }
    }
    return params;
  }
}

export default Product;

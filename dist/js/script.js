/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.randerInMenu(); //  uruchomił tę funkcję od razu po utworzeniu instancji
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
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
      console.log('--------------- initORrderForm ---------------');

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
      });
    }

    initProcesOrder() {
      const thisProduct = this;
      console.log('--------------- procesOrder ---------------');

      // [IN PROGRESS] covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);

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
            if (option && option.default != true) {
              // add option price to price variable
              price += option.price;
            }
          } else {
            // check if the option is default
            if (option && option.default === true) {
              // reduce price variable
              price -= option.price;
            }
          }

          const optionImage = thisProduct.imageWrapper.querySelector(
            '.' + paramId + '-' + optionId
          );
          console.log('optionImage:', optionImage);

          if (optionImage) {
            if (selectedOption) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }

        // [IN PROGRESS] update calculated price in the HTML
        thisProduct.priceElem.innerHTML = price;
      }
    }
  }

  const app = {
    initMenu: function () {
      const thisApp = this;

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]); //tworzenie instancji
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;

      console.log('thisApp.data:', thisApp.data);
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}

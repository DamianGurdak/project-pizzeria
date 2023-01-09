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
      thisProduct.initAccordion();

      console.log('newProduct:', thisProduct);
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

    initAccordion() {
      const thisProduct = this;

      /* [DONE] find the clickable trigger (the element that should react to clicking) */
      thisProduct.clickableTrigger = thisProduct.element.querySelector(
        select.menuProduct.clickable
      );
      // console.log('clickableTrigger:', thisProduct.clickableTrigger);

      /* [DONE] START: add event listener to clickable trigger on event click */
      thisProduct.clickableTrigger.addEventListener('click', function (event) {
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
  }

  const app = {
    initMenu: function () {
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);

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

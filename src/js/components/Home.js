import { templates, select } from '../settings.js';
import { app } from '../app.js';

class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.render(element);
    thisHome.initActions();
  }

  render(element) {
    const thisHome = this;
    const generatedHTML = templates.homeWidget();

    thisHome.dom = {};

    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;

    thisHome.dom.orderPanel = thisHome.dom.wrapper.querySelector(
      select.home.orderPanel
    );

    thisHome.dom.bookPanel = thisHome.dom.wrapper.querySelector(
      select.home.bookPanel
    );

    console.log(thisHome.dom.orderPanel);
    console.log(thisHome.dom.bookPanel);
  }

  initActions() {
    const thisHome = this;

    thisHome.dom.orderPanel.addEventListener('click', function (event) {
      event.preventDefault();
      const pageId = event.target.getAttribute('value');
      app.activatePage(pageId);
    });

    thisHome.dom.bookPanel.addEventListener('click', function (event) {
      event.preventDefault();
      const pageId = event.target.getAttribute('value');
      app.activatePage(pageId);
    });
  }
}

export default Home;

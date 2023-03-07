import { templates } from '../settings.js';

class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.render(element);
  }

  render(element) {
    const thisHome = this;
    const generatedHTML = templates.homeWidget();

    thisHome.dom = {};

    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;

    // thisHome.dom.orderPanel = thisHome.dom.wrapper.querySelector(
    //   select.home.orderPanel
    // );

    // thisHome.dom.bookPanel = thisHome.dom.wrapper.querySelector(
    //   select.home.bookPanel
    // );
  }

  initWidgets() {
    const thisHome = this;

    console.log(thisHome.dom.bookPanel);

    thisHome.dom.orderPanel.addEventListener('click', function () {
      window.location.href = '#order';
    });
  }
}

export default Home;

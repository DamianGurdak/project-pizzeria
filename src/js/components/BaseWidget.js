class BaseWidget {
  constructor(wrapperElemnet, initialValue) {
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElemnet;

    thisWidget.correctValue = initialValue;
  }

  get value() {
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  set value(value) {
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value); // konwercja to co zwróci input czyli sting na liczbe

    /* TODO: Add validation */

    if (
      thisWidget.correctValue !== newValue &&
      !isNaN(newValue) &&
      thisWidget.isValid(newValue)
    ) {
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }

    thisWidget.renderValue();
  }

  setValue(value) {
    const thisWidget = this;

    thisWidget.value = value;
  }

  parseValue(value) {
    return parseInt(value);
  }

  isValid(value) {
    return !isNaN(value);
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', { bubbles: true });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;

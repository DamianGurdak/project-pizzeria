import { classNames, select, settings, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import HourPicker from './HourPicker.js';
import DatePicker from './DatePicker.js';
import { utils } from '../utils.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();

    thisBooking.selectedtable = null;
  }

  getData() {
    const thisBooking = this;

    const startDateParam =
      settings.db.dateStartParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.minDate);

    const endDateParam =
      settings.db.dateEndParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };

    // console.log('getData params:', params);

    const urls = {
      booking:
        settings.db.url +
        '/' +
        settings.db.bookings +
        '?' +
        params.booking.join('&'),
      eventsCurrent:
        settings.db.url +
        '/' +
        settings.db.events +
        '?' +
        params.eventsCurrent.join('&'),
      eventsRepeat:
        settings.db.url +
        '/' +
        settings.db.events +
        '?' +
        params.eventsRepeat.join('&'),
    };
    // console.log('getData urls:', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventRepatResponse = allResponses[2];
        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventRepatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        // console.log('bookings:', bookings);
        // console.log('eventsCurrent:', eventsCurrent);
        // console.log('eventsRepeat:', eventsRepeat);

        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          thisBooking.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }
    // console.log('thisBooking.booked', thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      // console.log('loop', hourBlock);

      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined' ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ==
        'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);

      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};

    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );

    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );

    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
    );

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.tables
    );

    thisBooking.dom.floor = thisBooking.dom.wrapper.querySelector(
      select.containerOf.floor
    );

    thisBooking.dom.submitButton = thisBooking.dom.wrapper.querySelector(
      select.booking.buttonSubmit
    );

    thisBooking.dom.submitPhone = thisBooking.dom.wrapper.querySelector(
      select.booking.phone
    );

    thisBooking.dom.submitAddress = thisBooking.dom.wrapper.querySelector(
      select.booking.address
    );

    thisBooking.dom.hoursInput = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursInput
    );

    thisBooking.dom.amountInput = thisBooking.dom.wrapper.querySelector(
      select.booking.amountInput
    );

    thisBooking.dom.datePickerInput = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.input
    );

    thisBooking.dom.hourPickerInput = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.input
    );
  }

  initWidgets() {
    const thisBooking = this;

    new AmountWidget(thisBooking.dom.peopleAmount);
    new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.dom.peopleAmount.addEventListener('update', function () {});
    thisBooking.dom.hoursAmount.addEventListener('update', function () {});

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.floor.addEventListener('click', function (event) {
      thisBooking.initTables(event);
    });

    thisBooking.dom.submitButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });

    thisBooking.dom.datePickerInput.addEventListener('change', function () {
      for (let table of thisBooking.dom.tables) {
        table.classList.remove(classNames.booking.tableSelected);
      }
      thisBooking.selectedtable = null;
    });

    thisBooking.dom.hourPickerInput.addEventListener('change', function () {
      for (let table of thisBooking.dom.tables) {
        table.classList.remove(classNames.booking.tableSelected);
      }
      thisBooking.selectedtable = null;
    });
  }

  initTables(event) {
    const thisBooking = this;
    // console.log(event.target);

    const tableId = event.target.getAttribute(
      settings.booking.tableIdAttribute
    );

    if (event.target.classList.contains(classNames.booking.table)) {
      if (event.target.classList.contains(classNames.booking.tableBooked)) {
        // console.log('zarezerowoay');
        alert('Stolik niedostępny');
      } else if (
        event.target.classList.contains(classNames.booking.tableSelected)
      ) {
        for (let table of thisBooking.dom.tables) {
          table.classList.remove(classNames.booking.tableSelected);
        }
        thisBooking.selectedtable = null;
      } else {
        // console.log(' nie zarezerwowny');
        for (let table of thisBooking.dom.tables) {
          table.classList.remove(classNames.booking.tableSelected);
        }
        event.target.classList.add(classNames.booking.tableSelected);
        thisBooking.selectedtable = tableId;
      }
    }
    thisBooking.getData();
  }

  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.bookings;

    const payload = {
      date: thisBooking.date,
      hour: thisBooking.hourPicker.value,
      table: parseInt(thisBooking.selectedtable),
      duration: parseInt(thisBooking.dom.hoursInput.value),
      ppl: parseInt(thisBooking.dom.amountInput.value),
      starters: [],
      phone: thisBooking.dom.submitPhone.value,
      address: thisBooking.dom.submitAddress.value,
    };

    console.log('payload:', payload);

    const starters = document.querySelectorAll(
      '.checkbox input[name="starter"]'
    );

    for (let starter of starters) {
      if (starter.checked) {
        payload.starters.unshift(starter.value);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    if (
      thisBooking.dom.submitPhone.value.length &&
      thisBooking.dom.submitAddress.value.length &&
      thisBooking.selectedtable
    ) {
      fetch(url, options).then(function (response) {
        window.alert('Dziękujęmy za złożenie zamówenia :)');
        if (response.ok) {
          thisBooking.makeBooked(
            payload.date,
            payload.hour,
            payload.table,
            payload.duration
          );
          for (let table of thisBooking.dom.tables) {
            table.classList.remove(classNames.booking.tableSelected);
          }
        }
      });
    } else {
      window.alert('Uzupełnij wszystkie pola i wybierz stolik!');
    }
  }
}

export default Booking;

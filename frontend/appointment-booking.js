(() => {
  const calendarDays = document.querySelector('[data-calendar-days]');
  const monthLabel = document.querySelector('[data-calendar-month]');
  const prevButton = document.querySelector('[data-calendar-prev]');
  const nextButton = document.querySelector('[data-calendar-next]');
  const timesGrid = document.querySelector('[data-time-slots]');
  const status = document.querySelector('[data-availability-message]');
  const noTimes = document.querySelector('[data-no-times]');
  const dateLabel = document.querySelector('[data-selected-date-label]');
  const confirmDate = document.querySelector('[data-confirm-date]');
  const confirmTime = document.querySelector('[data-confirm-time]');
  const form = document.querySelector('[data-appointment-form]');
  const submit = document.querySelector('[data-booking-submit]');
  const formMessage = document.querySelector('[data-booking-message]');
  if (!calendarDays || !form) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDate = null;
  let selectedTime = null;
  let requestNumber = 0;
  const formatter = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  function localIso(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function renderCalendar() {
    monthLabel.textContent = visibleMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    calendarDays.replaceChildren();
    const firstWeekday = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay();
    const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    for (let blank = 0; blank < firstWeekday; blank += 1) {
      const spacer = document.createElement('span');
      spacer.className = 'calendar-spacer';
      spacer.setAttribute('aria-hidden', 'true');
      calendarDays.append(spacer);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
      const button = document.createElement('button');
      const validDay = date >= today && date.getDay() >= 2 && date.getDay() <= 6;
      button.type = 'button';
      button.className = 'calendar-day';
      button.textContent = String(day);
      button.disabled = !validDay;
      button.setAttribute('aria-label', `${formatter.format(date)}${validDay ? ', available booking day' : ', unavailable'}`);
      button.setAttribute('aria-pressed', String(Boolean(selectedDate && localIso(date) === selectedDate)));
      if (selectedDate && localIso(date) === selectedDate) button.classList.add('is-selected');
      if (validDay) button.addEventListener('click', () => chooseDate(date));
      calendarDays.append(button);
    }
    prevButton.disabled = visibleMonth.getFullYear() === today.getFullYear() && visibleMonth.getMonth() === today.getMonth();
    nextButton.disabled = visibleMonth.getFullYear() >= today.getFullYear() + 1 && visibleMonth.getMonth() >= today.getMonth();
  }

  async function chooseDate(date) {
    selectedDate = localIso(date);
    selectedTime = null;
    renderCalendar();
    dateLabel.textContent = formatter.format(date);
    confirmDate.textContent = formatter.format(date);
    confirmTime.textContent = 'Choose an available time';
    submit.disabled = true;
    timesGrid.replaceChildren();
    noTimes.hidden = true;
    status.hidden = false;
    status.textContent = 'Checking availability…';
    formMessage.textContent = '';
    updateSteps(1);
    const currentRequest = ++requestNumber;
    try {
      const response = await fetch(`http://localhost:8080/api/appointments/availability?date=${encodeURIComponent(selectedDate)}`, { signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error('Availability is temporarily unavailable. Please try again.');
      const slots = await response.json();
      if (currentRequest !== requestNumber) return;
      status.hidden = true;
      const availableSlots = slots.filter(slot => slot.available);
      slots.forEach(slot => {
        const button = document.createElement('button');
        const time = slot.time.slice(0, 5);
        const [hours, minutes] = time.split(':').map(Number);
        const label = new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        button.type = 'button';
        button.className = `time-slot${slot.available ? '' : ' is-booked'}`;
        button.disabled = !slot.available;
        button.setAttribute('aria-label', `${label}${slot.available ? ', available' : ', booked'}`);
        button.innerHTML = `<span>${label}</span>${slot.available ? '' : '<small>Booked</small>'}`;
        if (slot.available) button.addEventListener('click', () => chooseTime(time, label));
        timesGrid.append(button);
      });
      noTimes.hidden = availableSlots.length !== 0;
      if (!slots.length) {
        status.hidden = false;
        status.textContent = 'Appointments are available Tuesday to Saturday.';
      } else if (!availableSlots.length) {
        status.hidden = true;
      }
      updateSteps(availableSlots.length ? 2 : 1);
      if (window.lucide) window.lucide.createIcons();
    } catch (error) {
      if (currentRequest !== requestNumber) return;
      status.hidden = false;
      status.textContent = error.name === 'TimeoutError' ? 'Availability took too long to load. Please try again.' : `${error.message || 'Could not load availability.'} Make sure the booking service is running.`;
      noTimes.hidden = true;
    }
  }

  function chooseTime(time, label) {
    selectedTime = time;
    timesGrid.querySelectorAll('.time-slot').forEach(button => {
      button.classList.toggle('is-selected', button.getAttribute('aria-label').startsWith(label));
      button.setAttribute('aria-pressed', String(button.classList.contains('is-selected')));
    });
    confirmTime.textContent = label;
    submit.disabled = false;
    formMessage.textContent = '';
    updateSteps(3);
  }

  function updateSteps(current) {
    document.querySelectorAll('[data-step-indicator]').forEach(step => {
      const number = Number(step.dataset.stepIndicator);
      step.classList.toggle('is-current', number === current);
      step.classList.toggle('is-complete', number < current);
    });
  }

  prevButton.addEventListener('click', () => {
    if (prevButton.disabled) return;
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    renderCalendar();
  });
  nextButton.addEventListener('click', () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    renderCalendar();
  });
  document.querySelector('[data-choose-another]')?.addEventListener('click', () => document.querySelector('.calendar-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!selectedDate || !selectedTime) {
      formMessage.textContent = 'Please choose an available date and time first.';
      return;
    }
    submit.disabled = true;
    submit.textContent = 'Confirming your appointment…';
    formMessage.textContent = '';
    const values = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch('http://localhost:8080/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, date: selectedDate, time: selectedTime }),
        signal: AbortSignal.timeout(15000)
      });
      const result = await response.text();
      if (!response.ok) throw new Error(result || 'We could not confirm this appointment. Please choose another time.');
      formMessage.textContent = 'Your appointment request is confirmed. We look forward to seeing you!';
      formMessage.classList.add('is-success');
      await chooseDate(new Date(`${selectedDate}T00:00:00`));
      form.reset();
      confirmTime.textContent = 'Your selected time will appear here.';
      updateSteps(1);
    } catch (error) {
      formMessage.classList.remove('is-success');
      formMessage.textContent = error.name === 'TimeoutError' ? 'Confirmation timed out. Please check availability before trying again.' : error.message;
      submit.disabled = false;
    } finally {
      submit.innerHTML = 'Confirm appointment <i data-lucide="arrow-right"></i>';
      if (window.lucide) window.lucide.createIcons();
    }
  });

  renderCalendar();
})();

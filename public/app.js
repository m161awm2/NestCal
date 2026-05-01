const sessionStatus = document.querySelector('#sessionStatus');
const authForm = document.querySelector('#authForm');
const eventForm = document.querySelector('#eventForm');
const registerButton = document.querySelector('#registerButton');
const refreshButton = document.querySelector('#refreshButton');
const eventsElement = document.querySelector('#events');

let currentNickname = '';

function setStatus(message) {
  sessionStatus.textContent = message;
}

function getAuthPayload() {
  return {
    nickname: document.querySelector('#nickname').value.trim(),
    password: document.querySelector('#password').value,
  };
}

async function requestJson(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`요청 실패 (${response.status})`);
  }

  return response.json();
}

function renderEvents(events) {
  eventsElement.replaceChildren();

  if (events.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'status';
    empty.textContent = '등록된 일정이 없습니다.';
    eventsElement.append(empty);
    return;
  }

  for (const event of events) {
    const item = document.createElement('article');
    item.className = 'event';

    const title = document.createElement('div');
    title.className = 'event-title';

    const titleText = document.createElement('span');
    titleText.textContent = event.title;

    const dateText = document.createElement('span');
    dateText.textContent = `${event.month}/${event.day}`;

    const meta = document.createElement('div');
    meta.className = 'event-meta';
    meta.textContent = event.nickname;

    const content = document.createElement('p');
    content.className = 'event-content';
    content.textContent = event.content || '';

    title.append(titleText, dateText);
    item.append(title, meta, content);
    eventsElement.append(item);
  }
}

async function loadEvents() {
  const events = await requestJson('/api/events');
  renderEvents(events);
}

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const payload = getAuthPayload();
    await requestJson('/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    currentNickname = payload.nickname;
    setStatus(`${currentNickname} 로그인 중`);
  } catch (error) {
    setStatus(error.message);
  }
});

registerButton.addEventListener('click', async () => {
  try {
    const payload = getAuthPayload();
    await requestJson('/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setStatus('가입이 완료되었습니다. 로그인하세요.');
  } catch (error) {
    setStatus(error.message);
  }
});

eventForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(eventForm);
  const payload = {
    month: Number(formData.get('month')),
    day: Number(formData.get('day')),
    title: String(formData.get('title')).trim(),
    content: String(formData.get('content')).trim(),
  };

  try {
    await requestJson('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    eventForm.reset();
    setStatus(
      currentNickname
        ? `${currentNickname} 로그인 중`
        : '일정이 저장되었습니다.',
    );
    await loadEvents();
  } catch (error) {
    setStatus(error.message);
  }
});

refreshButton.addEventListener('click', async () => {
  try {
    await loadEvents();
    setStatus(
      currentNickname
        ? `${currentNickname} 로그인 중`
        : '일정을 새로 불러왔습니다.',
    );
  } catch (error) {
    setStatus(error.message);
  }
});

loadEvents().catch((error) => {
  setStatus(error.message);
});

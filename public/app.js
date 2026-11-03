const form = document.querySelector('#dream-form');
const dreamText = document.querySelector('#dream-text');
const interpretation = document.querySelector('#interpretation');
const message = document.querySelector('#form-message');
const list = document.querySelector('#dream-list');
const count = document.querySelector('#dream-count');

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
}[character]));

function renderDreams(dreams) {
  count.textContent = `${dreams.length} ${dreams.length === 1 ? 'entry' : 'entries'}`;
  list.innerHTML = dreams.length ? dreams.map((dream) => `
    <article class="dream">
      <div class="dream-top">
        <p class="dream-text">${escapeHtml(dream.dream_text)}</p>
        <time class="dream-date">${new Date(dream.created_at).toLocaleDateString()}</time>
      </div>
      ${dream.interpretation ? `<p class="interpretation">${escapeHtml(dream.interpretation)}</p>` : ''}
      <button class="delete" data-id="${dream.id}" type="button">Delete</button>
    </article>
  `).join('') : '<p class="empty">Your dream journal is waiting for its first story.</p>';
}

async function loadDreams() {
  const response = await fetch('/api/dreams');
  if (!response.ok) throw new Error('Could not load dreams');
  renderDreams(await response.json());
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = '';
  const response = await fetch('/api/dreams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dream_text: dreamText.value, interpretation: interpretation.value || null })
  });
  if (!response.ok) {
    message.textContent = 'Could not save this dream.';
    return;
  }
  form.reset();
  message.textContent = 'Dream saved.';
  await loadDreams();
});

list.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-id]');
  if (!button) return;
  const response = await fetch(`/api/dreams/${button.dataset.id}`, { method: 'DELETE' });
  if (response.ok) await loadDreams();
});

loadDreams().catch(() => {
  list.innerHTML = '<p class="empty">Unable to load dreams. Is the server running?</p>';
});

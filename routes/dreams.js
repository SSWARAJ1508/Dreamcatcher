import { Router } from 'express';
import { all, get, run } from '../database.js';

const router = Router();

router.get('/', async (_request, response, next) => {
  try {
    const dreams = await all(
      'SELECT id, dream_text, interpretation, created_at FROM dreams ORDER BY created_at DESC, id DESC'
    );
    response.json(dreams);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (request, response, next) => {
  try {
    const dream = await get(
      'SELECT id, dream_text, interpretation, created_at FROM dreams WHERE id = ?',
      [request.params.id]
    );
    if (!dream) {
      response.status(404).json({ error: 'Dream not found' });
      return;
    }
    response.json(dream);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  const { dream_text: dreamText, interpretation = null } = request.body ?? {};
  if (typeof dreamText !== 'string' || dreamText.trim() === '') {
    response.status(400).json({ error: 'dream_text is required' });
    return;
  }
  try {
    const result = await run(
      'INSERT INTO dreams (dream_text, interpretation) VALUES (?, ?)',
      [dreamText.trim(), interpretation]
    );
    const dream = await get('SELECT * FROM dreams WHERE id = ?', [result.lastID]);
    response.status(201).json(dream);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (request, response, next) => {
  try {
    const result = await run('DELETE FROM dreams WHERE id = ?', [request.params.id]);
    if (result.changes === 0) {
      response.status(404).json({ error: 'Dream not found' });
      return;
    }
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;

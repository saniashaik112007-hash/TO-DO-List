import test from 'node:test';
import assert from 'node:assert/strict';
import { removeTask } from './taskService.js';

test('removeTask resolves successfully for empty 204 responses', async () => {
  global.fetch = async () => ({
    ok: true,
    status: 204,
    json: async () => {
      throw new Error('Should not call json for a 204 response');
    },
  });

  await assert.doesNotReject(() => removeTask('task-123'));
});

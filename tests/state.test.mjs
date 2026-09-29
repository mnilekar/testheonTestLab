import test from 'node:test';
import assert from 'node:assert/strict';
import { allowedTransitions, createState, fingerprintFindings, recordBlockingFingerprint, transitionState } from '../src/state.mjs';

test('pipeline advances through rendered QA to complete', () => {
  const state = createState({ topic: 'Example', slug: 'example' });
  for (const stage of [
    'trends', 'gsc', 'seo_decision', 'deep_research', 'article_generation', 'head_controller',
    'content_qa', 'image_generation', 'wordpress_package', 'wordpress_draft', 'rendered_draft_qa', 'complete'
  ]) transitionState(state, stage, 'test');
  assert.equal(state.stage, 'complete');
  assert.equal(state.status, 'complete');
  assert.deepEqual(allowedTransitions('complete'), []);
});

test('review gates can loop back for fixes', () => {
  assert.ok(allowedTransitions('head_controller').includes('article_generation'));
  assert.ok(allowedTransitions('content_qa').includes('head_controller'));
  assert.ok(allowedTransitions('rendered_draft_qa').includes('wordpress_package'));
});

test('blocking fingerprints are stable and counted', () => {
  const state = createState({ topic: 'Example', slug: 'example' });
  assert.equal(fingerprintFindings(['  Broken Link ']), fingerprintFindings(['broken   link']));
  assert.equal(recordBlockingFingerprint(state, ['Broken link']), 1);
  assert.equal(recordBlockingFingerprint(state, ['broken link']), 2);
});

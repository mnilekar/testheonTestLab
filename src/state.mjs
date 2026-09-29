import crypto from 'node:crypto';

export const STAGES = Object.freeze([
  'intake',
  'trends',
  'gsc',
  'seo_decision',
  'deep_research',
  'article_generation',
  'head_controller',
  'content_qa',
  'image_generation',
  'wordpress_package',
  'wordpress_draft',
  'rendered_draft_qa',
  'complete',
  'blocked'
]);

const PIPELINE_STAGES = STAGES.filter((stage) => stage !== 'blocked');
const FORWARD = new Map(PIPELINE_STAGES.slice(0, -1).map((stage, index) => [stage, PIPELINE_STAGES[index + 1]]));

export function createState({ topic, slug, linearIssue = null }) {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    topic,
    slug,
    linearIssue,
    stage: 'intake',
    status: 'in_progress',
    createdAt: now,
    updatedAt: now,
    wordpress: {
      postId: null,
      status: null,
      editUrl: null,
      previewUrl: null
    },
    review: {
      headController: null,
      contentReviewer: null,
      repeatedBlockingFingerprint: null,
      repeatedBlockingCount: 0
    },
    history: [{ at: now, from: null, to: 'intake', note: 'Workspace initialized.' }]
  };
}

export function allowedTransitions(stage) {
  if (!STAGES.includes(stage)) return [];
  if (stage === 'complete') return [];
  const allowed = new Set(['blocked']);
  const next = FORWARD.get(stage);
  if (next) allowed.add(next);
  if (stage === 'head_controller') allowed.add('article_generation');
  if (stage === 'content_qa') {
    allowed.add('article_generation');
    allowed.add('head_controller');
  }
  if (stage === 'rendered_draft_qa') {
    allowed.add('wordpress_package');
    allowed.add('wordpress_draft');
  }
  if (stage === 'blocked') allowed.add('intake');
  return [...allowed];
}

export function transitionState(state, to, note = '') {
  if (!STAGES.includes(to)) throw new Error(`Unknown stage: ${to}`);
  if (!allowedTransitions(state.stage).includes(to)) {
    throw new Error(`Invalid transition: ${state.stage} -> ${to}`);
  }
  const now = new Date().toISOString();
  const from = state.stage;
  state.stage = to;
  state.status = to === 'complete' ? 'complete' : to === 'blocked' ? 'blocked' : 'in_progress';
  state.updatedAt = now;
  state.history.push({ at: now, from, to, note });
  return state;
}

export function fingerprintFindings(findings) {
  const normalized = (findings || [])
    .map((item) => typeof item === 'string' ? item : JSON.stringify(item))
    .map((item) => item.trim().toLowerCase().replace(/\s+/g, ' '))
    .sort()
    .join('\n');
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

export function recordBlockingFingerprint(state, findings) {
  const fingerprint = fingerprintFindings(findings);
  if (state.review.repeatedBlockingFingerprint === fingerprint) {
    state.review.repeatedBlockingCount += 1;
  } else {
    state.review.repeatedBlockingFingerprint = fingerprint;
    state.review.repeatedBlockingCount = 1;
  }
  state.updatedAt = new Date().toISOString();
  return state.review.repeatedBlockingCount;
}

type AnalyticsEventName =
  | 'practice_started'
  | 'challenge_opened'
  | 'hint_used'
  | 'solution_opened'
  | 'starter_downloaded'
  | 'blog_to_practice_click'
  | 'practice_to_blog_click'
  | 'reset_lab_data';

interface AnalyticsPayload {
  event: AnalyticsEventName;
  page_path: string;
  content_id?: string;
  hint_number?: number;
  source_post?: string;
}

const allowedEvents = new Set<AnalyticsEventName>([
  'practice_started',
  'challenge_opened',
  'hint_used',
  'solution_opened',
  'starter_downloaded',
  'blog_to_practice_click',
  'practice_to_blog_click',
  'reset_lab_data',
]);
const safeToken = /^[a-zA-Z0-9._-]{1,100}$/;
const analyticsWindow = window as Window & {
  dataLayer?: AnalyticsPayload[];
};

function emit(
  event: AnalyticsEventName,
  values: Omit<AnalyticsPayload, 'event' | 'page_path'> = {},
): void {
  const payload: AnalyticsPayload = {
    event,
    page_path: window.location.pathname,
    ...values,
  };
  analyticsWindow.dataLayer ??= [];
  analyticsWindow.dataLayer.push(payload);
  window.dispatchEvent(
    new CustomEvent<AnalyticsPayload>('testheon:analytics', {
      detail: payload,
    }),
  );
  if (
    new URLSearchParams(window.location.search).get('analytics_debug') === '1'
  )
    console.debug('[Testheon analytics]', payload);
}

function token(value: string | undefined): string | undefined {
  return value && safeToken.test(value) ? value : undefined;
}

document.addEventListener('click', (clickEvent) => {
  const target = clickEvent.target;
  if (!(target instanceof Element)) return;
  const instrumented = target.closest<HTMLElement>('[data-analytics-event]');
  if (!instrumented) return;
  const name = instrumented.dataset.analyticsEvent as
    AnalyticsEventName | undefined;
  if (!name || !allowedEvents.has(name)) return;
  if (name === 'hint_used' || name === 'solution_opened') return;
  const contentId = token(instrumented.dataset.analyticsContent);
  emit(name, contentId ? { content_id: contentId } : {});
});

document.addEventListener(
  'toggle',
  (toggleEvent) => {
    const details = toggleEvent.target;
    if (!(details instanceof HTMLDetailsElement) || !details.open) return;
    const name = details.dataset.analyticsEvent as
      AnalyticsEventName | undefined;
    if (name !== 'hint_used' && name !== 'solution_opened') return;
    const contentId = token(details.dataset.analyticsContent);
    const hintNumber = Number(details.dataset.analyticsHint);
    emit(name, {
      ...(contentId ? { content_id: contentId } : {}),
      ...(name === 'hint_used' && Number.isInteger(hintNumber)
        ? { hint_number: hintNumber }
        : {}),
    });
  },
  true,
);

const query = new URLSearchParams(window.location.search);
const attribution = new URLSearchParams(window.location.hash.replace(/^#/, ''));
const sourcePost = token(
  attribution.get('source_post') ?? query.get('source_post') ?? undefined,
);
if ((attribution.get('ref') ?? query.get('ref')) === 'blog' && sourcePost)
  emit('blog_to_practice_click', { source_post: sourcePost });

export {};

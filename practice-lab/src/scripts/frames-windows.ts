import { query, queryAll, result } from './fixture-dom';

const dynamicHost = query<HTMLElement>('#dynamic-frame-host');
query<HTMLButtonElement>('#load-dynamic-frame').addEventListener(
  'click',
  () => {
    const delay = Number(
      query<HTMLSelectElement>('#dynamic-frame-delay').value,
    );
    dynamicHost.replaceChildren();
    result('#dynamic-frame-result', `Loading frame after ${delay} ms.`);
    window.setTimeout(() => {
      const frame = document.createElement('iframe');
      frame.title = 'Dynamically loaded practice frame';
      frame.src = '/practice/components/frames-and-windows/frame-dynamic/';
      frame.addEventListener('load', () =>
        result(
          '#dynamic-frame-result',
          `Dynamic frame loaded after ${delay} ms.`,
        ),
      );
      dynamicHost.append(frame);
    }, delay);
  },
);

const childUrl = (mode: string): string =>
  `/practice/components/frames-and-windows/window-child/?mode=${encodeURIComponent(mode)}`;

for (const control of queryAll<HTMLButtonElement>('[data-window-mode]')) {
  control.addEventListener('click', () => {
    const mode = control.dataset.windowMode ?? 'popup';
    const child = window.open(
      childUrl(mode),
      `practice-${mode}`,
      'popup,width=640,height=560',
    );
    result(
      '#window-result',
      child ? `${mode} child opened.` : `${mode} child was blocked.`,
    );
  });
}

query<HTMLButtonElement>('#open-multiple-tabs').addEventListener(
  'click',
  () => {
    const first = window.open(childUrl('tab'), '_blank');
    const second = window.open(childUrl('update'), '_blank');
    result(
      '#window-result',
      first && second
        ? 'Two practice tabs opened.'
        : 'The browser blocked one or more practice tabs.',
    );
  },
);

window.addEventListener('message', (event: MessageEvent<unknown>) => {
  if (event.origin !== window.location.origin || !event.data) return;
  const payload = event.data as {
    type?: string;
    mode?: string;
    value?: string;
  };
  if (payload.type !== 'practice-window-result' || !payload.value) return;
  result(
    '#window-result',
    `Parent received ${payload.mode ?? 'child'} result: ${payload.value}.`,
  );
});

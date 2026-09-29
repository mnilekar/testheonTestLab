import { expect, test, type APIRequestContext } from '@playwright/test';

async function createSession(request: APIRequestContext): Promise<string> {
  const response = await request.post('lab/session?expiresIn=120', {
    headers: { 'X-Lab-Mode': 'header' },
  });
  expect(response.status()).toBe(201);
  return (await response.json()).data.sessionId as string;
}

test('secure upload accepts CSV metadata without exposing raw bytes', async ({
  request,
}) => {
  const session = await createSession(request);
  const uploaded = await request.post('files/upload', {
    headers: { 'X-Lab-Session': session },
    multipart: {
      files: {
        name: 'people.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from('name,team\nAsha,QA'),
      },
    },
  });
  expect(uploaded.status()).toBe(201);
  const body = await uploaded.json();
  expect(body.data[0]).toMatchObject({
    name: 'people.csv',
    size: 17,
    expiresInSeconds: 600,
    preview: { kind: 'csv' },
  });
  expect(JSON.stringify(body)).not.toContain('.upload');
  expect(JSON.stringify(body)).not.toContain('storage_name');
  const raw = await request.get(`files/${body.data[0].id}`, {
    headers: { 'X-Lab-Session': session },
  });
  expect(raw.status()).toBe(404);
});

test('upload security rejects renamed PHP, HTML, active SVG, traversal, and oversize content', async ({
  request,
}) => {
  const cases = [
    {
      name: 'shell.png',
      mimeType: 'image/png',
      buffer: Buffer.from('<?php echo "unsafe"; ?>'),
      expected: ['CONTENT_REJECTED'],
    },
    {
      name: 'unsafe.html',
      mimeType: 'text/html',
      buffer: Buffer.from('<script>alert(1)</script>'),
      expected: ['EXTENSION_REJECTED'],
    },
    {
      name: 'active.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from('<svg><script>alert(1)</script></svg>'),
      expected: ['EXTENSION_REJECTED'],
    },
    {
      name: '../escape.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('safe text'),
      expected: ['PATH_REJECTED'],
    },
    {
      name: 'oversize.txt',
      mimeType: 'text/plain',
      buffer: Buffer.alloc(2 * 1024 * 1024 + 1, 65),
      expected: ['FILE_TOO_LARGE'],
    },
  ];
  for (const fixture of cases) {
    const session = await createSession(request);
    const response = await request.post('files/upload', {
      headers: { 'X-Lab-Session': session },
      multipart: { files: fixture },
    });
    expect([413, 415, 422]).toContain(response.status());
    expect(fixture.expected).toContain((await response.json()).error.code);
  }
});

test('download responses use attachment disposition and deterministic filenames', async ({
  request,
}) => {
  const session = await createSession(request);
  const expected: Record<string, string> = {
    'static-pdf': 'testheon-practice-checklist.pdf',
    'static-csv': 'testheon-practice-data.csv',
    'static-txt': 'testheon-practice-notes.txt',
    'dynamic-csv': 'testheon-session-tasks.csv',
    'dynamic-pdf': 'testheon-session-report.pdf',
  };
  for (const [kind, filename] of Object.entries(expected)) {
    const response = await request.get(`files/download/${kind}?delay=0`, {
      headers: { 'X-Lab-Session': session },
    });
    expect(response.status()).toBe(200);
    expect(response.headers()['content-disposition']).toBe(
      `attachment; filename="${filename}"`,
    );
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
    expect((await response.body()).length).toBeGreaterThan(10);
  }
});

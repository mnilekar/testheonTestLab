import { query, queryAll } from './fixture-dom';

const form = query<HTMLFormElement>('#challenge-filters');
const cards = queryAll<HTMLElement>('[data-challenge-card]');
const status = query<HTMLElement>('#challenge-filter-status');

function selected(name: string): string {
  return new FormData(form).get(name)?.toString().trim().toLowerCase() ?? '';
}

function applyFilters(): void {
  const values = {
    difficulty: selected('difficulty'),
    skill: selected('skill'),
    feature: selected('feature'),
    application: selected('application'),
    technology: selected('technology'),
  };
  let visible = 0;
  for (const card of cards) {
    const skills = (card.dataset.skills ?? '').split('|');
    const matches =
      (!values.difficulty || card.dataset.difficulty === values.difficulty) &&
      (!values.skill || skills.includes(values.skill)) &&
      (!values.feature || card.dataset.feature === values.feature) &&
      (!values.application ||
        card.dataset.application === values.application) &&
      (!values.technology || card.dataset.technology === values.technology);
    card.hidden = !matches;
    if (matches) visible += 1;
  }
  status.textContent = `${visible} of ${cards.length} challenges shown.`;
  const parameters = new URLSearchParams();
  for (const [key, value] of Object.entries(values))
    if (value) parameters.set(key, value);
  history.replaceState(
    null,
    '',
    parameters.size ? `?${parameters}` : location.pathname,
  );
}

form.addEventListener('change', applyFilters);
form.addEventListener('reset', () => window.setTimeout(applyFilters));

const initial = new URLSearchParams(location.search);
for (const name of [
  'difficulty',
  'skill',
  'feature',
  'application',
  'technology',
]) {
  const value = initial.get(name);
  const control = form.elements.namedItem(name);
  if (value && control instanceof HTMLSelectElement) control.value = value;
}
applyFilters();

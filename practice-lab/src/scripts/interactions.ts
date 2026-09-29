import { query, queryAll } from './fixture-dom';

const logList = query<HTMLOListElement>('#interaction-log');
let sequence = 0;
function log(message: string): void {
  sequence += 1;
  const item = document.createElement('li');
  item.textContent = `${sequence}. ${message}`;
  logList.append(item);
  item.scrollIntoView({ block: 'nearest' });
}

const hoverRegion = query<HTMLElement>('#hover-menu-region');
const hoverTrigger = query<HTMLButtonElement>('#hover-menu-trigger');
const hoverPopup = query<HTMLElement>('#hover-menu-popup');
let hoverCloseTimer = 0;
function setHoverMenu(open: boolean): void {
  window.clearTimeout(hoverCloseTimer);
  hoverPopup.hidden = !open;
  hoverTrigger.setAttribute('aria-expanded', String(open));
  if (open) log('Hover menu opened.');
}
hoverRegion.addEventListener('mouseenter', () => setHoverMenu(true));
hoverRegion.addEventListener('mouseleave', () => {
  // Leave enough time for emulated touch viewports to move from the trigger
  // to the revealed menu without racing the synthetic mouseleave event.
  hoverCloseTimer = window.setTimeout(() => setHoverMenu(false), 1_000);
});
hoverPopup.addEventListener('mouseenter', () =>
  window.clearTimeout(hoverCloseTimer),
);
hoverTrigger.addEventListener('focus', () => setHoverMenu(true));

const tooltipTrigger = query<HTMLButtonElement>('#tooltip-trigger');
const tooltip = query<HTMLElement>('#interaction-tooltip');
function setTooltip(visible: boolean): void {
  tooltip.hidden = !visible;
  if (visible) log('Tooltip shown for flaky check.');
}
tooltipTrigger.addEventListener('mouseenter', () => setTooltip(true));
tooltipTrigger.addEventListener('mouseleave', () => setTooltip(false));
tooltipTrigger.addEventListener('focus', () => setTooltip(true));
tooltipTrigger.addEventListener('blur', () => setTooltip(false));

query<HTMLButtonElement>('#interaction-double-click').addEventListener(
  'dblclick',
  () => log('Double-click release completed.'),
);
const contextTrigger = query<HTMLButtonElement>('#interaction-context');
const contextMenu = query<HTMLElement>('#context-menu');
contextTrigger.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  contextMenu.hidden = false;
  contextTrigger.setAttribute('aria-expanded', 'true');
  query<HTMLElement>('[role="menuitem"]', contextMenu).focus();
  log('Context menu opened.');
});

for (const action of queryAll<HTMLButtonElement>('[data-log]')) {
  action.addEventListener('click', () => {
    log(action.dataset.log ?? 'Action selected.');
    const menu = action.closest<HTMLElement>('[role="menu"]');
    if (menu) menu.hidden = true;
  });
}

query<HTMLButtonElement>('#scroll-target-control').addEventListener(
  'click',
  () => {
    query('#scroll-completion-target').scrollIntoView({
      behavior: 'auto',
      block: 'center',
    });
    log('Completion target scrolled into view.');
  },
);
query<HTMLButtonElement>('#scroll-completion-target').addEventListener(
  'click',
  () => log('Scrolled action completed.'),
);
query<HTMLButtonElement>('#enter-action').addEventListener('click', () =>
  log('Enter action completed.'),
);
for (const element of queryAll<HTMLElement>('[data-tab-label]')) {
  element.addEventListener('focus', () =>
    log(`Tab focus: ${element.dataset.tabLabel}.`),
  );
}

const escapePanel = query<HTMLElement>('#escape-panel');
query<HTMLButtonElement>('#open-escape-panel').addEventListener('click', () => {
  escapePanel.hidden = false;
  escapePanel.focus();
  log('Escape panel opened.');
});

const commandPalette = query<HTMLDialogElement>('#command-palette');
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (!commandPalette.open) commandPalette.showModal();
    query<HTMLInputElement>('#command-search').focus();
    log('Command palette opened with Ctrl/Cmd+K.');
    return;
  }
  if (event.key === 'Escape' && !escapePanel.hidden) {
    escapePanel.hidden = true;
    log('Escape panel closed.');
  }
});
commandPalette.addEventListener('close', () =>
  log('Command palette closed with Escape.'),
);
query<HTMLButtonElement>('#run-command').addEventListener('click', () => {
  commandPalette.close();
  log('Command palette action completed.');
});

const listbox = query<HTMLElement>('#browser-listbox');
const listOptions = queryAll<HTMLButtonElement>('[role="option"]', listbox);
let listIndex = 0;
function activateListOption(index: number): void {
  listIndex = (index + listOptions.length) % listOptions.length;
  listOptions.forEach((option, optionIndex) => {
    option.tabIndex = optionIndex === listIndex ? 0 : -1;
    option.setAttribute('aria-selected', String(optionIndex === listIndex));
  });
  listOptions[listIndex]?.focus();
}
listbox.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    activateListOption(listIndex + (event.key === 'ArrowDown' ? 1 : -1));
    log(
      `Listbox active option: ${listOptions[listIndex]?.textContent?.trim()}.`,
    );
  } else if (event.key === 'Enter') {
    log(`Listbox selected: ${listOptions[listIndex]?.textContent?.trim()}.`);
  }
});
listOptions.forEach((option, index) =>
  option.addEventListener('click', () => {
    activateListOption(index);
    log(`Listbox selected: ${option.textContent?.trim()}.`);
  }),
);

const tools = ['Playwright', 'Selenium', 'Cypress', 'Postman', 'k6'];
const autocomplete = query<HTMLInputElement>('#interaction-autocomplete');
const suggestions = query<HTMLUListElement>('#interaction-suggestions');
let matches: string[] = [];
let suggestionIndex = -1;
function renderSuggestions(): void {
  const term = autocomplete.value.trim().toLowerCase();
  matches = term
    ? tools.filter((tool) => tool.toLowerCase().includes(term))
    : [];
  suggestionIndex = matches.length ? 0 : -1;
  suggestions.replaceChildren(
    ...matches.map((tool, index) => {
      const item = document.createElement('li');
      item.id = `interaction-suggestion-${index}`;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(index === suggestionIndex));
      item.textContent = tool;
      return item;
    }),
  );
  autocomplete.setAttribute('aria-expanded', String(matches.length > 0));
  if (suggestionIndex >= 0)
    autocomplete.setAttribute(
      'aria-activedescendant',
      `interaction-suggestion-${suggestionIndex}`,
    );
  else autocomplete.removeAttribute('aria-activedescendant');
}
function updateSuggestion(): void {
  queryAll<HTMLElement>('[role="option"]', suggestions).forEach(
    (option, index) =>
      option.setAttribute('aria-selected', String(index === suggestionIndex)),
  );
  if (suggestionIndex >= 0)
    autocomplete.setAttribute(
      'aria-activedescendant',
      `interaction-suggestion-${suggestionIndex}`,
    );
}
autocomplete.addEventListener('input', renderSuggestions);
autocomplete.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown' && matches.length) {
    event.preventDefault();
    suggestionIndex = (suggestionIndex + 1) % matches.length;
    updateSuggestion();
    log(`Autocomplete active option: ${matches[suggestionIndex]}.`);
  } else if (event.key === 'ArrowUp' && matches.length) {
    event.preventDefault();
    suggestionIndex = (suggestionIndex - 1 + matches.length) % matches.length;
    updateSuggestion();
    log(`Autocomplete active option: ${matches[suggestionIndex]}.`);
  } else if (event.key === 'Enter' && suggestionIndex >= 0) {
    event.preventDefault();
    const selected = matches[suggestionIndex] ?? '';
    autocomplete.value = selected;
    suggestions.replaceChildren();
    autocomplete.setAttribute('aria-expanded', 'false');
    log(`Autocomplete selected: ${selected}.`);
  }
});

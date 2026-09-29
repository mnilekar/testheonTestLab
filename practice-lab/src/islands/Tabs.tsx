import { useId, useState } from 'preact/hooks';

interface Tab {
  id: string;
  label: string;
  content: string;
}

interface Props {
  label: string;
  tabs: Tab[];
}

export default function Tabs({ label, tabs }: Props) {
  const rootId = useId();
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? '');

  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const index = tabs.findIndex((tab) => tab.id === activeId);
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const next = tabs[(index + direction + tabs.length) % tabs.length];
    if (next) setActiveId(next.id);
  }

  return (
    <div class="tabs">
      <div
        class="tabs__list"
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
      >
        {tabs.map((tab) => (
          <button
            id={`${rootId}-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={activeId === tab.id}
            aria-controls={`${rootId}-panel-${tab.id}`}
            tabIndex={activeId === tab.id ? 0 : -1}
            onClick={() => setActiveId(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          id={`${rootId}-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`${rootId}-tab-${tab.id}`}
          hidden={activeId !== tab.id}
        >
          <p>{tab.content}</p>
        </div>
      ))}
    </div>
  );
}

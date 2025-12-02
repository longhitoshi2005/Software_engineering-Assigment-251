"use client";

import React, { useMemo, useState, useRef, useEffect } from 'react';

type Props = {
  content?: string;
  sections?: any[];
};

type Question = any;

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function mdToHtml(md: string) {
  if (!md) return '';

  // Render fenced code blocks first
  md = md.replace(/```([\s\S]*?)```/g, (_m, code) => {
    return '<pre class="bg-gray-900 text-white p-3 rounded overflow-auto"><code>' + escapeHtml(code) + '</code></pre>';
  });

  const blocks = md.split(/\n\s*\n/);
  let html = '';

  const inline = (text: string) => {
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 rounded px-1 text-sm">$1</code>');
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a class="text-light-heavy-blue hover:underline" href="$2">$1</a>');
    return text;
  };

  for (const block of blocks) {
    const b = block.trim();
    if (!b) continue;

    const hMatch = b.match(/^(#{1,6})\s+(.*)$/m);
    if (hMatch) {
      const level = Math.min(6, hMatch[1].length);
      const tag = 'h' + level;
      html += '<' + tag + ' class="font-semibold text-dark-blue mt-4 mb-2">' + inline(escapeHtml(hMatch[2])) + '</' + tag + '>';
      continue;
    }

    const lines = b.split('\n').map(l => l.trim());
    const isUL = lines.every(l => l.startsWith('- '));
    const isOL = lines.every(l => /^\d+\.\s+/.test(l));

    if (isUL) {
      html += '<ul class="list-disc pl-6 mt-2 space-y-1">';
      for (const li of lines) html += '<li>' + inline(escapeHtml(li.replace(/^\-\s?/, ''))) + '</li>';
      html += '</ul>';
      continue;
    }

    if (isOL) {
      html += '<ol class="list-decimal pl-6 mt-2 space-y-1">';
      for (const li of lines) html += '<li>' + inline(escapeHtml(li.replace(/^\d+\.\s?/, ''))) + '</li>';
      html += '</ol>';
      continue;
    }

    const paragraph = lines.map(l => inline(escapeHtml(l))).join('<br/>');
    html += '<p class="text-sm text-black/80 leading-relaxed mt-2">' + paragraph + '</p>';
  }

  return html;
}

const MarkdownRenderer = ({ content }: { content: string }) => (
  <div dangerouslySetInnerHTML={{ __html: mdToHtml(content || '') }} />
);

export const QuestionBankViewer = (props: Props) => {
  const { content, sections: propSections } = props;

  const sections = useMemo(() => {
    if (Array.isArray(propSections)) return propSections;

    const normalized = String(content || '')
      .replace(/\r/g, '')
      .replace(/\n[ \t]+## /g, '\n## ')
      .replace(/\n[ \t]+### /g, '\n### ')
      .replace(/\n[ \t]+```/g, '\n```')
      .replace(/^\s+/, '');

    return normalized.split('\n## ').map((sectionText, index) => {
      if (index === 0) return { title: sectionText.split('\n')[0], questions: [] as Question[] };

      const lines = sectionText.split('\n');
      const sectionTitle = lines[0];

      const questionBlocks = sectionText.split('\n### ');
      const questions: Question[] = questionBlocks.slice(1).map((qBlock) => {
        const parts = qBlock.split(/\n\*\*(Answer|Solution.*):\*\*/);
        const questionLines = parts[0].split('\n');
        const qTitle = questionLines[0];
        const qBody = questionLines.slice(1).join('\n');
        const qAnswer = parts[2] || 'No answer provided.';
        return { id: undefined, title: qTitle, type: 'legacy', body: qBody, answer: qAnswer };
      });

      return { title: sectionTitle, questions };
    }).slice(1);
  }, [content, propSections]);

  // MCQ component
  const MCQ = ({ q, index }: { q: any; index: number }) => {
    const { options = [], correct_index, shuffle } = q;
    const [shuffled] = useState(() => {
      const arr = options.map((o: string, i: number) => ({ label: o, orig: i }));
      if (shuffle) {
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }
      return arr;
    });
    const [selected, setSelected] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const isCorrect = submitted && selected !== null && shuffled[selected].orig === correct_index;

    return (
      <div className="bg-white p-4 rounded">
        <div className="mb-3"><MarkdownRenderer content={q.body} /></div>
        <div className="space-y-2">
          {shuffled.map((opt: any, i: number) => (
            <label key={i} className={`flex items-center gap-3 p-2 border rounded ${submitted && selected===i ? (shuffled[i].orig===correct_index? 'bg-green-50 border-green-200':'bg-red-50 border-red-200') : 'bg-white'}`}>
              <input type="radio" name={`mcq-${index}`} checked={selected===i} onChange={() => setSelected(i)} />
              <span className="select-none">{opt.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button disabled={submitted || selected===null} onClick={() => setSubmitted(true)} className="px-3 py-1 bg-light-heavy-blue text-white rounded">Submit</button>
          {submitted && (
            <div className={`text-sm font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>{isCorrect ? 'Correct' : 'Incorrect'}</div>
          )}
        </div>
        {submitted && (
          <div className="mt-3 bg-white border rounded p-3">
            <div className="font-semibold">Explanation</div>
            <div className="text-sm text-black/80 mt-1"><MarkdownRenderer content={q.explanation || ''} /></div>
          </div>
        )}
      </div>
    );
  };

  // Numeric
  const NumericQ = ({ q }: { q: any }) => {
    const [value, setValue] = useState<string>('');
    const [submitted, setSubmitted] = useState(false);
    const isCorrect = submitted && Number(value) === Number(q.correct_number);
    return (
      <div className="bg-white p-4 rounded">
        <div className="mb-3"><MarkdownRenderer content={q.body} /></div>
        <div className="flex gap-2 items-center">
          <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="px-3 py-2 border rounded" />
          <button disabled={submitted || value===""} onClick={() => setSubmitted(true)} className="px-3 py-1 bg-light-heavy-blue text-white rounded">Submit</button>
          {submitted && (
            <div className={`text-sm font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>{isCorrect ? 'Correct' : `Wrong — expected ${q.correct_number}`}</div>
          )}
        </div>
        {submitted && (
          <div className="mt-3 bg-white border rounded p-3">
            <div className="font-semibold">Explanation</div>
            <div className="text-sm text-black/80 mt-1"><MarkdownRenderer content={q.explanation || ''} /></div>
          </div>
        )}
      </div>
    );
  };

  // Order with native drag-and-drop and floating preview
  const OrderQ = ({ q }: { q: any }) => {
    const items: string[] = Array.isArray(q.items) ? q.items.slice() : [];
    const correct: string[] = Array.isArray(q.correct_order) ? q.correct_order.slice() : [];
    const [order, setOrder] = useState<string[]>(() => items.slice());
    const [submitted, setSubmitted] = useState(false);

    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [floatPos, setFloatPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    useEffect(() => {
      const onMove = (e: MouseEvent) => setFloatPos({ x: e.clientX + 12, y: e.clientY + 12 });
      if (draggingIndex !== null) document.addEventListener('mousemove', onMove);
      return () => document.removeEventListener('mousemove', onMove);
    }, [draggingIndex]);

    const onDragStart = (e: React.DragEvent, index: number) => {
      setDraggingIndex(index);
      try { e.dataTransfer!.setDragImage(new Image(), 0, 0); e.dataTransfer!.effectAllowed = 'move'; } catch {}
      setFloatPos({ x: e.clientX + 12, y: e.clientY + 12 });
    };

    const onDragOverItem = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const insertAt = e.clientY < rect.top + rect.height / 2 ? index : index + 1;
      setDragOverIndex(insertAt);
    };

    const onDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (draggingIndex === null || dragOverIndex === null) { setDraggingIndex(null); setDragOverIndex(null); return; }
      const next = order.slice();
      const [moved] = next.splice(draggingIndex, 1);
      let insertIndex = dragOverIndex;
      if (draggingIndex < dragOverIndex) insertIndex = insertIndex - 1;
      next.splice(insertIndex, 0, moved);
      setOrder(next);
      setDraggingIndex(null);
      setDragOverIndex(null);
    };

    const onDragEnd = () => { setDraggingIndex(null); setDragOverIndex(null); };

    const isCorrect = submitted && order.length === correct.length && order.every((v, i) => v === correct[i]);

    return (
      <div className="bg-white p-4 rounded relative">
        <div className="mb-3"><MarkdownRenderer content={q.body} /></div>
        <ul className="space-y-2" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
          {order.map((it, idx) => (
            <li
              key={it}
              draggable
              onDragStart={(e) => onDragStart(e, idx)}
              onDragOver={(e) => onDragOverItem(e, idx)}
              onDragEnd={onDragEnd}
              className={`flex items-center gap-3 p-2 border rounded bg-white relative ${draggingIndex === idx ? 'opacity-20' : ''}`}
            >
              <div className="flex-1">{it}</div>
              <div className="text-xs text-black/50">Drag</div>
              {dragOverIndex === idx && draggingIndex !== null && (
                <div className="absolute left-2 right-2 -top-2 h-1 bg-black rounded-md shadow-lg" style={{opacity:0.95}} />
              )}
            </li>
          ))}

          {dragOverIndex === order.length && draggingIndex !== null && (
            <li className="h-3"><div className="h-1 bg-black rounded-md shadow-lg" /></li>
          )}
        </ul>

        {draggingIndex !== null && (
          <div style={{ position: 'fixed', left: floatPos.x, top: floatPos.y, zIndex: 60, pointerEvents: 'none' }}>
            <div className="bg-gray-200 text-black p-2 rounded shadow-lg w-[320px] opacity-95">{order[draggingIndex]}</div>
          </div>
        )}

        <div className="mt-3 flex items-center gap-3">
          <button disabled={submitted} onClick={() => setSubmitted(true)} className="px-3 py-1 bg-light-heavy-blue text-white rounded">Submit</button>
          {submitted && (<div className={`text-sm font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>{isCorrect ? 'Correct order' : 'Incorrect order'}</div>)}
        </div>
        {submitted && (<div className="mt-3 bg-white border rounded p-3"><div className="font-semibold">Explanation</div><div className="text-sm text-black/80 mt-1"><MarkdownRenderer content={q.explanation || ''} /></div></div>)}
      </div>
    );
  };

  return (
    <div className="p-6 prose prose-sm max-w-none">
      {sections.map((section, sIndex) => (
        <section key={sIndex} className="mb-8">
          <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
          {Array.isArray(section.questions) && section.questions.length > 0 ? (
            <div className="space-y-4">
              {section.questions.map((q: any, qIndex: number) => (
                <div key={q.id ?? `${sIndex}-${qIndex}`} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4 border-b"><div className="font-semibold">{q.title || `Question ${qIndex + 1}`}</div></div>
                  <div className="p-4">
                    {q.type === 'mcq' && <MCQ q={q} index={sIndex * 100 + qIndex} />}
                    {q.type === 'numeric' && <NumericQ q={q} />}
                    {q.type === 'order' && <OrderQ q={q} />}
                    {(!q.type || q.type === 'legacy') && (
                      <div>
                        <div className="mb-4"><MarkdownRenderer content={q.body} /></div>
                        <div className="bg-white border border-green-200 rounded-md p-4"><h4 className="font-bold text-green-700">Answer/Solution</h4><MarkdownRenderer content={q.answer} /></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No questions in this section.</p>
          )}
        </section>
      ))}
    </div>
  );
};

export default QuestionBankViewer;

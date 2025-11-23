"use client";

import React, { useMemo } from 'react';

type Props = {
  content: string;
};

type Question = {
  title: string;
  body: string;
  answer: string;
};

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function mdToHtml(md: string) {
  if (!md) return "";

  // fenced code blocks
  md = md.replace(/```([\s\S]*?)```/g, (_m, code) => {
    return `<pre class="bg-gray-900 text-white p-3 rounded overflow-auto"><code>${escapeHtml(code)}</code></pre>`;
  });

  const blocks = md.split(/\n\s*\n/);
  let html = "";

  const inline = (text: string) => {
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/`([^`]+)`/g, "<code class=\"bg-gray-100 rounded px-1 text-sm\">$1</code>");
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, "<a class='text-light-heavy-blue hover:underline' href='$2'>$1</a>");
    return text;
  };

  for (const block of blocks) {
    const b = block.trim();
    if (!b) continue;

    const hMatch = b.match(/^(#{1,6})\s+(.*)$/m);
    if (hMatch) {
      const level = Math.min(6, hMatch[1].length);
      const tag = `h${level}`;
      html += `<${tag} class="font-semibold text-dark-blue mt-4 mb-2">${inline(escapeHtml(hMatch[2]))}</${tag}>`;
      continue;
    }

    const lines = b.split(/\n/).map(l => l.trim());
    const isUL = lines.every(l => l.startsWith("- "));
    const isOL = lines.every(l => /^\d+\.\s+/.test(l));

    if (isUL) {
      html += '<ul class="list-disc pl-6 mt-2 space-y-1">';
      for (const li of lines) html += `<li>${inline(escapeHtml(li.replace(/^\-\s?/, '')))}</li>`;
      html += '</ul>';
      continue;
    }

    if (isOL) {
      html += '<ol class="list-decimal pl-6 mt-2 space-y-1">';
      for (const li of lines) html += `<li>${inline(escapeHtml(li.replace(/^\d+\.\s?/, '')))}</li>`;
      html += '</ol>';
      continue;
    }

    const paragraph = lines.map(l => inline(escapeHtml(l))).join('<br/>');
    html += `<p class="text-sm text-black/80 leading-relaxed mt-2">${paragraph}</p>`;
  }

  return html;
}

const MarkdownRenderer = ({ content }: { content: string }) => (
  <div dangerouslySetInnerHTML={{ __html: mdToHtml(content || '') }} />
);

export const QuestionBankViewer = ({ content }: Props) => {
  const sections = useMemo(() => {
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
        return { title: qTitle, body: qBody, answer: qAnswer };
      });

      return { title: sectionTitle, questions };
    }).slice(1);
  }, [content]);

  return (
    <div className="p-6 prose prose-sm max-w-none">
      {sections.map((section, sIndex) => (
        <section key={sIndex} className="mb-8">
          <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
          {section.questions.length > 0 ? (
            <div className="space-y-4">
              {section.questions.map((q, qIndex) => (
                <details key={qIndex} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                  <summary className="p-4 font-semibold cursor-pointer hover:bg-gray-100">{q.title && q.title.toString().trim().toLowerCase().startsWith('question') ? q.title : `Question ${q.title}`}</summary>
                  <div className="p-4 border-t border-gray-200">
                    <div className="mb-4">
                      <MarkdownRenderer content={q.body} />
                    </div>
                    <div className="bg-white border border-green-200 rounded-md p-4">
                      <h4 className="font-bold text-green-700">Answer/Solution</h4>
                      <MarkdownRenderer content={q.answer} />
                    </div>
                  </div>
                </details>
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

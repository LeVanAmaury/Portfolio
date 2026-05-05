import React from 'react';

interface MarkdownTextProps {
  content: string;
}

/**
 * Composant léger pour transformer du Markdown basique en HTML.
 */
export function MarkdownText({ content }: MarkdownTextProps) {
  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const processedLine = line.trim();

        // Titres
        if (processedLine.startsWith('### ')) {
          return <h3 key={i} className="text-base font-bold text-orange-600 dark:text-orange-400 mt-3 mb-1">{processedLine.replace('### ', '')}</h3>;
        }
        if (processedLine.startsWith('## ')) {
          return <h2 key={i} className="text-lg font-bold text-orange-700 dark:text-orange-300 mt-4 mb-2">{processedLine.replace('## ', '')}</h2>;
        }

        // Listes (* ou -)
        if (processedLine.startsWith('* ') || processedLine.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className="text-orange-500 dark:text-orange-400">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(processedLine.replace(/^[*-] /, '')) }} />
            </div>
          );
        }

        // Listes numérotées
        const numberedMatch = processedLine.match(/^(\d+)\.\s(.+)/);
        if (numberedMatch) {
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className="text-orange-500 dark:text-orange-400 font-semibold text-xs mt-0.5">{numberedMatch[1]}.</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(numberedMatch[2]) }} />
            </div>
          );
        }

        // Paragraphe vide
        if (processedLine === "") {
          return <div key={i} className="h-1.5" />;
        }

        // Paragraphe classique
        return (
          <p key={i} dangerouslySetInnerHTML={{ __html: formatInline(processedLine) }} />
        );
      })}
    </div>
  );
}

/**
 * Transforme le formatage inline : **gras**, *italique*, `code`
 */
function formatInline(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-stone-900 dark:text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-white/10 text-orange-600 dark:text-orange-400 text-xs font-mono">$1</code>');
}

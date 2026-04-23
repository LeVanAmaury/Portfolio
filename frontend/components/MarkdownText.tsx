import React from 'react';

interface MarkdownTextProps {
  content: string;
}

/**
 * Un composant ultra-léger pour transformer le Markdown de base en HTML.
 * Évite d'installer des bibliothèques externes quand le proxy bloque tout !
 */
export function MarkdownText({ content }: MarkdownTextProps) {
  // 1. Découper par lignes
  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-sm md:text-base leading-relaxed">
      {lines.map((line, i) => {
        let processedLine = line.trim();

        // Gestion des Titres (### Titre)
        if (processedLine.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-bold text-indigo-400 mt-4 mb-2">{processedLine.replace('### ', '')}</h3>;
        }
        if (processedLine.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-bold text-indigo-300 mt-6 mb-3">{processedLine.replace('## ', '')}</h2>;
        }

        // Gestion des Listes (* Point)
        if (processedLine.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className="text-indigo-500">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatBold(processedLine.replace('* ', '')) }} />
            </div>
          );
        }

        // Paragraphe classique avec gras
        return (
          <p key={i} className={processedLine === "" ? "h-2" : ""} 
             dangerouslySetInnerHTML={{ __html: formatBold(processedLine) }} 
          />
        );
      })}
    </div>
  );
}

/**
 * Fonction simple pour transformer les **gras** en <strong>
 */
function formatBold(text: string) {
  // Remplace **texte** par <strong>texte</strong>
  return text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
}

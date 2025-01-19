import React, { memo, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useDebounce } from '../utils';
import { cn } from '@/lib/utils';

// Dynamic imports for better-react-mathjax components
const MathJaxContext = dynamic(
  () => import('better-react-mathjax').then((mod) => mod.MathJaxContext),
  { ssr: false }
);
const MathJax = dynamic(
  () => import('better-react-mathjax').then((mod) => mod.MathJax),
  { ssr: false }
);

interface AppMathProps {
  formula: string;
  key?: number
  className?: string
}

export const jaxconfig = {
  "fast-preview": {
    disabled: true,
  },
  renderMode: "post",
  messageStyle: "none",
  tex2jax: { preview: 'none' },
  showProcessingMessages: false,
  loader: {
    load: ["[tex]/html"],
  },
  tex: {
    packages: { "[+]": ["html"] },
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"]
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"]
    ]
  }
};

const AppMath: React.FC<AppMathProps> = ({ formula, key, className }) => {

  const [keys, setKeys] = useState<number>(0)

  const renderWithLineBreaks = (text: string) => {
    return text.split(/\\\\n|\\n\\n|\n\n|\/\/\/n/).map((line, index) => (
      <React.Fragment key={index}>
        <p dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') || '' }} ></p>
      </React.Fragment>
    ));
  };

  useEffect(() => {
    setKeys(key || 0)
  }, [key, formula])

  const dkey = useDebounce(keys, 400)

  return (
    <MathJaxContext version={3} config={jaxconfig}>
      <div className={cn("overflow-hidden break-words w-full", className)}>
        <MathJax className="mathjax" key={dkey}>
          {renderWithLineBreaks(formula || '')}
        </MathJax>
      </div>
    </MathJaxContext>
  );
};

export default memo(AppMath);

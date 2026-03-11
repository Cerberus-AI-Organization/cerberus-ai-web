import {useMemo} from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import katex from 'katex';
import 'katex/dist/katex.css';
import {getCodeString} from 'rehype-rewrite';
import {useTheme} from "@/states/ThemeProvider.tsx";
import type {Element} from 'hast';
import styles from './MarkdownViewer.module.css';

type Props = {
  content: string;
  className?: string;
  fontSize?: string;
};

export default function MarkdownViewer({content, className = "", fontSize = "1rem"}: Props) {
  const {theme} = useTheme();

  const preview = useMemo(() => {
    const preprocess = (text: string) => {
      return text
        .replace(/\\\[\s*/g, '\n$$\n')
        .replace(/\s*\\\]/g, '\n$$\n');
    };

    return (
      <MarkdownPreview
        source={preprocess(content)}
        style={{
          background: "transparent",
          color: "inherit",
        }}
        wrapperElement={{
          "data-color-mode": theme === "dark" ? "dark" : "light",
        }}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        rehypeRewrite={(node, _index, parent) => {
          if ((node as Element).type === "element") {
            const el = node as Element;

            if (el.tagName === "a" && parent && parent.type === "element" && /^h[1-6]$/.test((parent as Element).tagName)) {
              (parent as Element).children = (parent as Element).children.slice(1);
            }
          }
        }}
        components={{
          code: ({children = [], className, ...props}) => {
            const code = props.node && props.node.children ? getCodeString(props.node.children) : children;
            if (
              typeof code === 'string' &&
              typeof className === 'string' &&
              /^language-katex/.test(className.toLocaleLowerCase())
            ) {
              const html = katex.renderToString(code, {throwOnError: false});
              return <code style={{fontSize: '150%'}} dangerouslySetInnerHTML={{__html: html}}/>;
            }
            return <code className={styles.code}>{children}</code>;
          },
          pre: ({children}) => <pre className={styles.pre}><code className={styles.preCode}>{children}</code></pre>,
          table: ({children}) => <table className={styles.table}>{children}</table>,
          tr: ({children}) => <tr className={styles.tr}>{children}</tr>,
          th: ({children}) => <th className={styles.th}>{children}</th>,
          td: ({children}) => <td className={styles.td}>{children}</td>,
          li: ({children}) => <li className={styles.li}>{children}</li>,
          ol: ({children}) => <ol className={styles.ol}>{children}</ol>,
          ul: ({children}) => <ul className={styles.ul}>{children}</ul>,
          h1: ({children}) => <h1 className={styles.h1}>{children}</h1>,
          h2: ({children}) => <h2 className={styles.h2}>{children}</h2>,
          h3: ({children}) => <h3 className={styles.h3}>{children}</h3>,
          h4: ({children}) => <h4 className={styles.h4}>{children}</h4>,
          h5: ({children}) => <h5 className={styles.h5}>{children}</h5>,
          h6: ({children}) => <h6 className={styles.h6}>{children}</h6>,
        }}
      />
    );
  }, [content, theme]);

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{ "--prose-base-size": fontSize } as React.CSSProperties}
    >
      <div className="w-full max-w-full overflow-x-auto ${styles.proseWrapper}">
        {preview}
      </div>
    </div>
  );
}

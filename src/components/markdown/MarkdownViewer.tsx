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
};

export default function MarkdownViewer({content, className = ""}: Props) {
  const {theme} = useTheme();

  const preview = useMemo(() => {
    return (
      <MarkdownPreview
        source={content}
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
        }}
      />
    );
  }, [content, theme]);

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="w-full max-w-full overflow-x-auto">
        {preview}
      </div>
    </div>
  );
}

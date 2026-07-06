import { DARK_CONDITION, LIGHT_CONDITION, neutralizeDarkRules } from '../styles/dark-mode';
import { forceLightMetaColorScheme } from '../styles/light-mode';

interface MediaAttrEdit {
  element: HTMLLinkElement | HTMLStyleElement;
  original: string;
  rewritten: string;
}

const mediaAttrEdits: MediaAttrEdit[] = [];

const rewriteMediaAttr = (element: HTMLLinkElement | HTMLStyleElement, rewritten: string) => {
  mediaAttrEdits.push({ element, original: element.media, rewritten });
  element.media = rewritten;
};

/** 只处理单个样式节点，避免每次变更都全量重扫 document.styleSheets */
const processStyleNode = (node: Node) => {
  if (node instanceof HTMLLinkElement && node.rel.includes('stylesheet')) {
    // media 属性级别的暗色条件：整张表禁用 / 亮色条件：无条件启用
    if (DARK_CONDITION.test(node.media)) {
      rewriteMediaAttr(node, 'not all');
      return;
    }
    if (LIGHT_CONDITION.test(node.media)) {
      rewriteMediaAttr(node, 'all');
    }

    if (node.sheet) {
      neutralizeDarkRules(node.sheet);
    } else {
      node.addEventListener('load', () => {
        if (node.sheet) neutralizeDarkRules(node.sheet);
      });
    }
  } else if (node instanceof HTMLStyleElement) {
    if (DARK_CONDITION.test(node.media)) {
      rewriteMediaAttr(node, 'not all');
      return;
    }
    if (node.sheet) {
      neutralizeDarkRules(node.sheet);
    }
  } else if (node instanceof HTMLMetaElement) {
    forceLightMetaColorScheme(node);
  }
};

const processExistingStyles = () => {
  document
    .querySelectorAll('link[rel*="stylesheet"], style, meta[name="color-scheme"]')
    .forEach(processStyleNode);
};

let styleObserver: MutationObserver | null = null;

export const setupStyleObserver = () => {
  processExistingStyles();

  // 监听整个文档（head 和 body 都可能被注入样式）
  styleObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          processStyleNode(node);
          // 批量插入的容器节点（如整段 fragment）里也可能带样式
          if (node instanceof HTMLElement && node.childElementCount > 0) {
            node
              .querySelectorAll('link[rel*="stylesheet"], style, meta[name="color-scheme"]')
              .forEach(processStyleNode);
          }
        });
      } else if (mutation.type === 'characterData') {
        // <style> 文本被改写后，样式表会重建，需要重新处理
        const parent = mutation.target.parentElement;
        if (parent instanceof HTMLStyleElement) {
          processStyleNode(parent);
        }
      }
    }
  });

  styleObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
};

/** 断开监听并还原被改写的 media 属性 */
export const teardownStyleObserver = () => {
  styleObserver?.disconnect();
  styleObserver = null;

  for (const { element, original, rewritten } of mediaAttrEdits) {
    if (element.media === rewritten) {
      element.media = original;
    }
  }
  mediaAttrEdits.length = 0;
};

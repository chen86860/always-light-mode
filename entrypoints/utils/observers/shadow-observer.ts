import { removeDarkModeMediaQueries } from '../styles/dark-mode';

/** MAIN world 的 attachShadow 补丁创建 shadow root 后派发的事件名，见 inject.content.ts */
export const SHADOW_ATTACHED_EVENT = '__almShadowAttached';

const processedRoots = new WeakSet<ShadowRoot>();

const processShadowRoot = (root: ShadowRoot) => {
  if (processedRoots.has(root)) return;
  processedRoots.add(root);

  removeDarkModeMediaQueries(root);

  // shadow root 内部后续注入的样式
  const observer = new MutationObserver(() => {
    removeDarkModeMediaQueries(root);
  });
  observer.observe(root, { childList: true, subtree: true });

  // 嵌套 shadow root
  walkShadowRoots(root);
};

/** 遍历一棵树，处理所有 open shadow root（closed 的无法从内容脚本访问） */
export const walkShadowRoots = (node: ParentNode) => {
  const walker = document.createTreeWalker(node as Node, NodeFilter.SHOW_ELEMENT);
  let current = walker.currentNode as Element | null;
  while (current) {
    if (current instanceof Element && current.shadowRoot) {
      processShadowRoot(current.shadowRoot);
    }
    current = walker.nextNode() as Element | null;
  }
};

export const setupShadowObserver = () => {
  // MAIN world 补丁在 attachShadow 时通知我们，事件从元素冒泡（composed）上来
  document.addEventListener(
    SHADOW_ATTACHED_EVENT,
    (event) => {
      const target = event.target;
      if (target instanceof Element && target.shadowRoot) {
        processShadowRoot(target.shadowRoot);
      }
    },
    true,
  );

  // 兜底扫描：事件派发时元素可能尚未连接到文档，或 shadow root 创建早于监听器
  const sweep = () => walkShadowRoots(document);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sweep);
  } else {
    sweep();
  }
  window.addEventListener('load', sweep);
};

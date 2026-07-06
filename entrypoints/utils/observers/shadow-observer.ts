import { neutralizeDarkStyles } from '../styles/dark-mode';

/** MAIN world 的 attachShadow 补丁创建 shadow root 后派发的事件名，见 inject.content.ts */
export const SHADOW_ATTACHED_EVENT = '__almShadowAttached';

const observedRoots = new Map<ShadowRoot, MutationObserver>();
let active = false;

const processShadowRoot = (root: ShadowRoot) => {
  if (observedRoots.has(root)) return;

  neutralizeDarkStyles(root);

  // shadow root 内部后续注入的样式
  const observer = new MutationObserver(() => {
    neutralizeDarkStyles(root);
  });
  observer.observe(root, { childList: true, subtree: true });
  observedRoots.set(root, observer);

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

const onShadowAttached = (event: Event) => {
  if (!active) return;
  const target = event.target;
  if (target instanceof Element && target.shadowRoot) {
    processShadowRoot(target.shadowRoot);
  }
};

const sweep = () => {
  if (active) walkShadowRoots(document);
};

let listenersBound = false;

export const setupShadowObserver = () => {
  active = true;

  // MAIN world 补丁在 attachShadow 时通知我们，事件从元素冒泡（composed）上来。
  // 监听器只绑定一次，enable/disable 由 active 标志控制。
  if (!listenersBound) {
    listenersBound = true;
    document.addEventListener(SHADOW_ATTACHED_EVENT, onShadowAttached, true);
    // 兜底扫描：事件派发时元素可能尚未连接到文档，或 shadow root 创建早于监听器
    document.addEventListener('DOMContentLoaded', sweep);
    window.addEventListener('load', sweep);
  }
  sweep();
};

/** 停止处理 shadow root（其中样式的还原由 dark-mode 的全局编辑记录负责） */
export const teardownShadowObserver = () => {
  active = false;
  for (const observer of observedRoots.values()) {
    observer.disconnect();
  }
  observedRoots.clear();
};

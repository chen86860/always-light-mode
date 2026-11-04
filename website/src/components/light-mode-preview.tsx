import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { FileIcon, FolderIcon, LockSimpleIcon } from '@phosphor-icons/react';
import { Switch } from '@/components/ui/switch';

const files = [
  { name: 'src', folder: true, message: 'Move theme tokens into one file', time: '2 days ago' },
  { name: 'docs', folder: true, message: 'Add setup notes for contributors', time: 'last week' },
  { name: 'package.json', folder: false, message: 'Bump version to 2.4.1', time: '5 hours ago' },
  { name: 'README.md', folder: false, message: 'Explain offline reading mode', time: 'yesterday' },
];

// 演示用的仓库页面：纯展示内容，对辅助技术隐藏，避免打乱页面标题层级
function SiteMock() {
  return (
    <div className="site-mock-body" aria-hidden="true">
      <div className="site-mock-repo">
        <span>northwind / <strong>reader</strong></span>
        <span className="site-mock-pill">Public</span>
      </div>
      <div className="site-mock-tabs"><span data-active>Code</span><span>Issues 12</span><span>Pull requests 3</span><span>Releases</span></div>
      <div className="site-mock-files">
        {files.map(({ name, folder, message, time }) => (
          <div key={name} className="site-mock-row">
            <span className="site-mock-name">{folder ? <FolderIcon weight="fill" /> : <FileIcon />}{name}</span>
            <span className="site-mock-message">{message}</span>
            <span className="site-mock-time">{time}</span>
          </div>
        ))}
      </div>
      <div className="site-mock-readme">
        <p className="site-mock-readme-title">reader</p>
        <p>A quiet reading app for long articles. Saves pages for offline use and keeps your place across devices.</p>
      </div>
    </div>
  );
}

export function LightModePreview() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const touched = useRef(false);

  // 首次展示时自动从暗切到亮，演示插件效果；用户动过开关或偏好减少动效时不播放
  useEffect(() => {
    if (reduced) { if (!touched.current) setEnabled(true); return; }
    const timer = window.setTimeout(() => { if (!touched.current) setEnabled(true); }, 900);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  return (
    <figure className="preview-stage" aria-label="Interactive demo: a dark website with Always Light Mode off and on">
      <div className="preview-browser">
        <div className="preview-toolbar">
          <span className="preview-window-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="preview-address"><LockSimpleIcon aria-hidden="true" />code.northwind.dev/reader</span>
          <span className="preview-switch-group">
            <label htmlFor="preview-toggle">Force light mode</label>
            <Switch id="preview-toggle" size="sm" className="data-checked:bg-brand" checked={enabled} onCheckedChange={(value) => { touched.current = true; setEnabled(value); }} aria-controls="theme-preview" />
          </span>
        </div>
        {/* 暗色版本垫底，亮色版本用 clip-path 从开关位置扩散盖上去 */}
        <div className="site-mock-stack" id="theme-preview" data-enabled={enabled}>
          <div className="site-mock" data-theme="dark"><SiteMock /></div>
          <div className="site-mock site-mock-light" data-theme="light"><SiteMock /></div>
        </div>
      </div>
      <figcaption className="preview-caption" aria-live="polite">
        {enabled ? 'Light mode on. Try turning it off.' : 'Light mode off. The site shows its own dark theme.'}
      </figcaption>
    </figure>
  );
}

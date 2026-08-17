/**
 * 判断当前文档是否适合注入/改写。
 *
 * Chrome 会给 text/plain、JSON、图片等非网页内容包装一层 HTML 文档
 * （<pre> / <img>），它们同样受 color-scheme 影响，需要强制亮色；
 * 而 XML（sitemap.xml、RSS/Atom、SVG 等）由内置的 XML 树查看器渲染，
 * 文档树就是用户看到的内容——往里插入 <style> 或改写属性会直接污染显示，
 * 且这类文档也不吃 color-scheme，注入没有任何收益。XHTML 是例外，
 * 它是正常网页，需要照常处理。
 */
export const isInjectableDocument = () => {
  const type = (document.contentType || 'text/html').toLowerCase();
  if (type === 'application/xhtml+xml') return true;
  return !(type === 'application/xml' || type === 'text/xml' || type.endsWith('+xml'));
};

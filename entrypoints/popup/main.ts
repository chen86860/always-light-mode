import { lightModeEnabledStorage, disabledSitesStorage } from '../utils/storage';
import { syncContentScripts, updateIcon, getHostname } from '../utils/registration';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const panel = $('panel');
const siteRow = $('site-row');
const siteLabel = $('label-site');
const globalToggle = $<HTMLInputElement>('global-toggle');
const siteToggle = $<HTMLInputElement>('site-toggle');

const t = (key: string) => browser.i18n.getMessage(key as Parameters<typeof browser.i18n.getMessage>[0]);

const applyTexts = () => {
  $('label-app').textContent = t('appName');
  $('label-global').textContent = t('forceLight');
  $('label-hint').textContent = t('reloadHint');
  $('label-feedback').textContent = t('feedback');
  $<HTMLTextAreaElement>('feedback-text').placeholder = t('feedbackPlaceholder');
  $('feedback-send').textContent = t('feedbackSend');
  document.title = t('appName');
};

const SUPPORT_EMAIL = 'support@emmmm.dev';

const setupFeedback = (currentUrl?: string) => {
  const section = document.querySelector('.feedback') as HTMLElement;
  const toggle = $('feedback-toggle');
  const text = $<HTMLTextAreaElement>('feedback-text');
  const send = $<HTMLButtonElement>('feedback-send');

  toggle.addEventListener('click', () => {
    const open = section.classList.toggle('open');
    if (open) text.focus();
  });

  text.addEventListener('input', () => {
    send.disabled = text.value.trim().length === 0;
  });

  send.addEventListener('click', async () => {
    const { version } = browser.runtime.getManifest();
    const site = currentUrl ? ` - ${currentUrl}` : '';
    const subject = `[${t('appName')} v${version}] Feedback${site}`;
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text.value.trim())}`;
    await browser.tabs.create({ url });
    window.close();
  });
};

const getActiveTab = async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab;
};

const reloadTab = async (tabId?: number) => {
  if (tabId) await browser.tabs.reload(tabId);
};

const main = async () => {
  applyTexts();

  const tab = await getActiveTab();
  const host = getHostname(tab?.url);
  // 只带 http(s) 页面的 URL，chrome:// 等内部页不进主题
  setupFeedback(host ? tab?.url : undefined);
  const isEnabled = await lightModeEnabledStorage.getValue();
  const disabledSites = await disabledSitesStorage.getValue();

  let excluded = host ? disabledSites.includes(host) : false;
  globalToggle.checked = isEnabled;

  // 站点开关反映实际生效状态：总开关关闭时它也显示为关闭
  const render = () => {
    const enabled = globalToggle.checked;
    panel.classList.toggle('off', !enabled);
    if (!host) return;
    siteToggle.checked = enabled && !excluded;
    siteLabel.textContent = excluded ? t('siteExcluded') : t('siteApplied');
    siteLabel.classList.toggle('applied', enabled && !excluded);
  };

  if (host) {
    $('site-host').textContent = host;
  } else {
    $('site-host').textContent = t('unsupportedPage');
    siteLabel.textContent = '';
    siteRow.classList.add('unavailable');
    siteToggle.checked = false;
  }

  render();

  globalToggle.addEventListener('change', async () => {
    render();
    await lightModeEnabledStorage.setValue(globalToggle.checked);
    await syncContentScripts();
    await updateIcon();
    await reloadTab(tab?.id);
  });

  siteToggle.addEventListener('change', async () => {
    if (!host) return;
    excluded = !siteToggle.checked;
    render();
    const sites = await disabledSitesStorage.getValue();
    const next = excluded
      ? [...new Set([...sites, host])]
      : sites.filter((site: string) => site !== host);
    await disabledSitesStorage.setValue(next);
    await syncContentScripts();
    await reloadTab(tab?.id);
  });
};

main();

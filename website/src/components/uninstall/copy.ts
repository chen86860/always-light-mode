export type Reason = 'broke' | 'noEffect' | 'notNeeded' | 'other';

export interface UninstallCopy {
  back: string;
  eyebrow: string;
  emailNote: string;
  reasonError: string;
  emailHelp: string;
  title: string;
  intro: string;
  reasonLabel: string;
  reasons: Record<Reason, string>;
  hints: Partial<Record<Reason, string>>;
  siteLabel: string;
  sitePlaceholder: string;
  detailsLabel: string;
  submit: string;
  sent: string;
  reinstall: string;
}

/** 与插件 public/_locales 保持同样的 10 种语言 */
const COPY: Record<string, UninstallCopy> = {
  en: {
    back: "Back to home",
    eyebrow: "A little feedback goes a long way",
    emailNote: "This opens your email app with a draft. You can review it before sending. Nothing is submitted automatically.",
    reasonError: "Choose a reason before opening your email draft.",
    emailHelp: "Email app not opening? Write to",
    title: 'Sorry to see you go',
    intro: 'Tell us what did not work for you. A website, a detail, or an idea can help us make the next version better.',
    reasonLabel: 'Why did you remove it?',
    reasons: {
      broke: 'It broke a website',
      noEffect: "It didn't change a site I use",
      notNeeded: "I don't need it anymore",
      other: 'Something else',
    },
    hints: {
      broke: 'Tip for next time: click the toolbar icon and choose "Page looks broken?" to turn it off for just that site.',
      noEffect:
        "Some sites only have a dark design, with no light version to switch to. Tell us which one and we'll look into a fix.",
    },
    siteLabel: 'Which website? (optional)',
    sitePlaceholder: 'e.g. dashboard.stripe.com',
    detailsLabel: 'Anything else? (optional)',
    submit: "Open email draft",
    sent: "Finish sending your feedback in your email app.",
    reinstall: 'Changed your mind? Reinstall',
  },
  zh: {
    back: "返回首页",
    eyebrow: "你的反馈，让它更好",
    emailNote: "点击后会在邮件应用中打开草稿。你可以检查内容后再发送，不会自动提交。",
    reasonError: "请先选择一个卸载原因。",
    emailHelp: "邮件应用没有打开？你也可以联系",
    title: '很遗憾看到你离开',
    intro: '告诉我们哪里不合适。一个网址、一处细节，或一个建议，都能帮助我们改进下个版本。',
    reasonLabel: '为什么卸载？',
    reasons: {
      broke: '它把某个网站弄坏了',
      noEffect: '在我常用的网站上没有效果',
      notNeeded: '我不再需要了',
      other: '其他原因',
    },
    hints: {
      broke: '下次可以点击工具栏图标，选择「页面显示异常？」，只对该网站关闭。',
      noEffect: '有些网站只有深色设计，没有可以切换的浅色版。告诉我们是哪个网站，我们会研究如何适配。',
    },
    siteLabel: '哪个网站？（可选）',
    sitePlaceholder: '例如 dashboard.stripe.com',
    detailsLabel: '还有什么想说的？（可选）',
    submit: "打开邮件草稿",
    sent: "请在邮件应用中确认并发送反馈。",
    reinstall: '改变主意了？重新安装',
  },
  fr: {
    back: "Retour à l’accueil",
    eyebrow: "Votre avis nous aide à progresser",
    emailNote: "Un brouillon s’ouvrira dans votre messagerie. Vérifiez le contenu avant de l’envoyer. Rien n’est envoyé automatiquement.",
    reasonError: "Choisissez une raison avant d’ouvrir le brouillon.",
    emailHelp: "La messagerie ne s’ouvre pas ? Écrivez à",
    title: 'Désolé de vous voir partir',
    intro: "Dites-nous ce qui n'a pas fonctionné. Cela prend 10 secondes et nous aide à corriger le problème pour tous.",
    reasonLabel: "Pourquoi l'avez-vous supprimée ?",
    reasons: {
      broke: 'Elle a cassé un site web',
      noEffect: "Elle n'a rien changé sur un site que j'utilise",
      notNeeded: "Je n'en ai plus besoin",
      other: 'Autre chose',
    },
    hints: {
      broke:
        "Astuce : cliquez sur l'icône de la barre d'outils et choisissez « La page s'affiche mal ? » pour la désactiver uniquement sur ce site.",
      noEffect:
        "Certains sites n'ont qu'un design sombre, sans version claire. Dites-nous lequel et nous étudierons une solution.",
    },
    siteLabel: 'Quel site ? (facultatif)',
    sitePlaceholder: 'ex. dashboard.stripe.com',
    detailsLabel: 'Autre chose à ajouter ? (facultatif)',
    submit: "Ouvrir le brouillon",
    sent: "Terminez l’envoi de votre avis dans votre messagerie.",
    reinstall: "Vous avez changé d'avis ? Réinstaller",
  },
  de: {
    back: "Zur Startseite",
    eyebrow: "Ihr Feedback hilft uns weiter",
    emailNote: "Ein Entwurf wird in Ihrer E-Mail-App geöffnet. Prüfen Sie ihn vor dem Senden. Es wird nichts automatisch übermittelt.",
    reasonError: "Wählen Sie einen Grund, bevor Sie den Entwurf öffnen.",
    emailHelp: "Die E-Mail-App öffnet sich nicht? Schreiben Sie an",
    title: 'Schade, dass Sie gehen',
    intro: 'Sagen Sie uns, was schiefgelaufen ist. Das dauert 10 Sekunden und hilft uns, es für alle zu beheben.',
    reasonLabel: 'Warum haben Sie sie entfernt?',
    reasons: {
      broke: 'Sie hat eine Website kaputt gemacht',
      noEffect: 'Sie hat bei einer Website nichts geändert',
      notNeeded: 'Ich brauche sie nicht mehr',
      other: 'Etwas anderes',
    },
    hints: {
      broke:
        'Tipp: Klicken Sie auf das Symbol in der Symbolleiste und wählen Sie „Seite sieht kaputt aus?“, um sie nur für diese Seite auszuschalten.',
      noEffect:
        'Manche Websites haben nur ein dunkles Design ohne helle Version. Nennen Sie uns die Seite, wir prüfen eine Lösung.',
    },
    siteLabel: 'Welche Website? (optional)',
    sitePlaceholder: 'z. B. dashboard.stripe.com',
    detailsLabel: 'Noch etwas? (optional)',
    submit: "E-Mail-Entwurf öffnen",
    sent: "Senden Sie Ihr Feedback in Ihrer E-Mail-App ab.",
    reinstall: 'Umentschieden? Neu installieren',
  },
  es: {
    back: "Volver al inicio",
    eyebrow: "Tu opinión nos ayuda a mejorar",
    emailNote: "Se abrirá un borrador en tu aplicación de correo. Revísalo antes de enviarlo. No se envía nada automáticamente.",
    reasonError: "Elige un motivo antes de abrir el borrador.",
    emailHelp: "¿No se abre tu aplicación de correo? Escribe a",
    title: 'Lamentamos que te vayas',
    intro: 'Cuéntanos qué falló. Son 10 segundos y nos ayuda a arreglarlo para todos.',
    reasonLabel: '¿Por qué la eliminaste?',
    reasons: {
      broke: 'Rompió un sitio web',
      noEffect: 'No cambió un sitio que uso',
      notNeeded: 'Ya no la necesito',
      other: 'Otro motivo',
    },
    hints: {
      broke:
        'Consejo: haz clic en el icono de la barra de herramientas y elige «¿La página se ve rota?» para desactivarla solo en ese sitio.',
      noEffect:
        'Algunos sitios solo tienen un diseño oscuro, sin versión clara. Dinos cuál y buscaremos una solución.',
    },
    siteLabel: '¿Qué sitio? (opcional)',
    sitePlaceholder: 'p. ej. dashboard.stripe.com',
    detailsLabel: '¿Algo más? (opcional)',
    submit: "Abrir borrador de correo",
    sent: "Termina de enviar tus comentarios en tu aplicación de correo.",
    reinstall: '¿Cambiaste de opinión? Reinstalar',
  },
  it: {
    back: "Torna alla home",
    eyebrow: "Il tuo feedback ci aiuta a migliorare",
    emailNote: "Si aprirà una bozza nella tua app di posta. Puoi controllarla prima di inviarla. Non viene inviato nulla automaticamente.",
    reasonError: "Scegli un motivo prima di aprire la bozza.",
    emailHelp: "La tua app di posta non si apre? Scrivi a",
    title: 'Ci dispiace vederti andare via',
    intro: 'Dicci cosa non ha funzionato. Bastano 10 secondi e ci aiuta a sistemarlo per tutti.',
    reasonLabel: "Perché l'hai rimossa?",
    reasons: {
      broke: 'Ha rotto un sito web',
      noEffect: 'Non ha cambiato un sito che uso',
      notNeeded: 'Non mi serve più',
      other: 'Altro',
    },
    hints: {
      broke:
        "Suggerimento: fai clic sull'icona nella barra degli strumenti e scegli «La pagina non si vede bene?» per disattivarla solo su quel sito.",
      noEffect:
        'Alcuni siti hanno solo un design scuro, senza una versione chiara. Dicci quale e cercheremo una soluzione.',
    },
    siteLabel: 'Quale sito? (facoltativo)',
    sitePlaceholder: 'es. dashboard.stripe.com',
    detailsLabel: 'Altro da aggiungere? (facoltativo)',
    submit: "Apri bozza email",
    sent: "Completa l’invio del feedback nella tua app di posta.",
    reinstall: 'Hai cambiato idea? Reinstalla',
  },
  ja: {
    back: "ホームに戻る",
    eyebrow: "ご意見が改善につながります",
    emailNote: "メールアプリで下書きを開きます。内容を確認してから送信できます。自動送信はされません。",
    reasonError: "下書きを開く前に、削除した理由を選んでください。",
    emailHelp: "メールアプリが開かない場合の連絡先：",
    title: 'ご利用ありがとうございました',
    intro: '何が問題だったか教えてください。10 秒で終わり、すべてのユーザーのための修正に役立ちます。',
    reasonLabel: '削除した理由は？',
    reasons: {
      broke: 'ウェブサイトの表示が壊れた',
      noEffect: 'よく使うサイトで効果がなかった',
      notNeeded: 'もう必要なくなった',
      other: 'その他',
    },
    hints: {
      broke: '次回は、ツールバーのアイコンから「ページの表示がおかしい？」を選ぶと、そのサイトだけオフにできます。',
      noEffect:
        'ダークデザインしかなく、切り替えられるライト版がないサイトもあります。サイト名を教えていただければ対応を検討します。',
    },
    siteLabel: 'どのサイト？（任意）',
    sitePlaceholder: '例: dashboard.stripe.com',
    detailsLabel: 'その他（任意）',
    submit: "メールの下書きを開く",
    sent: "メールアプリで内容を確認し、送信してください。",
    reinstall: '気が変わりましたか？再インストール',
  },
  ko: {
    back: "홈으로 돌아가기",
    eyebrow: "의견이 더 나은 경험을 만듭니다",
    emailNote: "메일 앱에서 초안을 엽니다. 내용을 확인한 후 보내세요. 자동으로 전송되지 않습니다.",
    reasonError: "초안을 열기 전에 삭제한 이유를 선택해 주세요.",
    emailHelp: "메일 앱이 열리지 않으면 다음 주소로 연락해 주세요:",
    title: '떠나신다니 아쉽습니다',
    intro: '무엇이 문제였는지 알려 주세요. 10초면 충분하며 모두를 위한 수정에 도움이 됩니다.',
    reasonLabel: '삭제한 이유는 무엇인가요?',
    reasons: {
      broke: '웹사이트가 깨졌어요',
      noEffect: '자주 쓰는 사이트에서 효과가 없었어요',
      notNeeded: '더 이상 필요하지 않아요',
      other: '기타',
    },
    hints: {
      broke: '다음에는 툴바 아이콘을 클릭하고 "페이지가 깨져 보이나요?"를 선택하면 해당 사이트에서만 끌 수 있습니다.',
      noEffect:
        '일부 사이트는 어두운 디자인만 있고 전환할 밝은 버전이 없습니다. 어떤 사이트인지 알려 주시면 해결 방법을 검토하겠습니다.',
    },
    siteLabel: '어떤 사이트인가요? (선택)',
    sitePlaceholder: '예: dashboard.stripe.com',
    detailsLabel: '더 하실 말씀이 있나요? (선택)',
    submit: "메일 초안 열기",
    sent: "메일 앱에서 내용을 확인하고 의견을 보내 주세요.",
    reinstall: '마음이 바뀌셨나요? 다시 설치',
  },
  pt: {
    back: "Voltar ao início",
    eyebrow: "Sua opinião nos ajuda a melhorar",
    emailNote: "Um rascunho será aberto no seu aplicativo de e-mail. Revise antes de enviar. Nada é enviado automaticamente.",
    reasonError: "Escolha um motivo antes de abrir o rascunho.",
    emailHelp: "O aplicativo não abre? Escreva para",
    title: 'Que pena ver você partir',
    intro: 'Conte o que deu errado. Leva 10 segundos e nos ajuda a corrigir para todos.',
    reasonLabel: 'Por que você a removeu?',
    reasons: {
      broke: 'Ela quebrou um site',
      noEffect: 'Não mudou um site que eu uso',
      notNeeded: 'Não preciso mais dela',
      other: 'Outro motivo',
    },
    hints: {
      broke:
        'Dica: clique no ícone da barra de ferramentas e escolha "A página está com problemas?" para desativá-la só naquele site.',
      noEffect:
        'Alguns sites só têm um design escuro, sem versão clara. Diga qual é e vamos estudar uma solução.',
    },
    siteLabel: 'Qual site? (opcional)',
    sitePlaceholder: 'ex.: dashboard.stripe.com',
    detailsLabel: 'Algo mais? (opcional)',
    submit: "Abrir rascunho de e-mail",
    sent: "Conclua o envio do feedback no seu aplicativo de e-mail.",
    reinstall: 'Mudou de ideia? Reinstalar',
  },
  ru: {
    back: "На главную",
    eyebrow: "Ваш отзыв помогает нам стать лучше",
    emailNote: "В почтовом приложении откроется черновик. Проверьте его перед отправкой. Ничего не отправляется автоматически.",
    reasonError: "Выберите причину, прежде чем открыть черновик.",
    emailHelp: "Почтовое приложение не открывается? Напишите на",
    title: 'Жаль, что вы уходите',
    intro: 'Расскажите, что пошло не так. Это займёт 10 секунд и поможет исправить проблему для всех.',
    reasonLabel: 'Почему вы удалили расширение?',
    reasons: {
      broke: 'Оно сломало сайт',
      noEffect: 'Оно ничего не изменило на нужном сайте',
      notNeeded: 'Оно мне больше не нужно',
      other: 'Другое',
    },
    hints: {
      broke:
        'Совет: нажмите на значок на панели инструментов и выберите «Страница выглядит сломанной?», чтобы отключить расширение только на этом сайте.',
      noEffect:
        'У некоторых сайтов есть только тёмный дизайн без светлой версии. Сообщите, какой это сайт, и мы поищем решение.',
    },
    siteLabel: 'Какой сайт? (необязательно)',
    sitePlaceholder: 'например, dashboard.stripe.com',
    detailsLabel: 'Что-нибудь ещё? (необязательно)',
    submit: "Открыть черновик письма",
    sent: "Завершите отправку отзыва в почтовом приложении.",
    reinstall: 'Передумали? Установить снова',
  },
};

/** 插件传来的是 UI 语言（en-US、zh-CN、pt-BR…），按主语言匹配，未知语言回落英文 */
export const resolveCopy = (lang?: string) => {
  const primary = (lang ?? '').toLowerCase().split(/[-_]/)[0];
  const locale = Object.hasOwn(COPY, primary) ? primary : 'en';
  return { locale, copy: COPY[locale] };
};

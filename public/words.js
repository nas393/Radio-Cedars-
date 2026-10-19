/* "كلمة اليوم": a Lebanese word or saying a day, for the kids growing up far away.
   The word, how to say it in Latin letters, what it means, a little example, and the
   phone reads it out loud. On the calendar, above the family birthdays. */
(() => {
  'use strict';
  const S = window.Sawt;
  const el = S.el;
  const host = document.querySelector('[data-panel="calendar"] .sun-today');
  if (!host) return;

  // w: the word, tr: in Latin letters, m: what it means [ar, en, fr], ex: said in a sentence
  const W = (w, tr, ar, en, fr, ex) => ({ w, tr, m: { ar, en, fr }, ex });
  const WORDS = [
    W('يلّا', 'yalla', 'تعا، منروح، بسرعة', 'come on, let’s go', 'allez, on y va', 'يلّا عالسفرة، الأكل جاهز!'),
    W('كيفك؟', 'kifak / kifik', 'شو أخبارك؟', 'how are you?', 'comment ça va ?', 'كيفك يا تيتا؟ اشتقنالك.'),
    W('هلّق', 'halla2', 'هالوقت، الآن', 'now', 'maintenant', 'هلّق جايي، استنّاني!'),
    W('شو', 'shu', 'ماذا', 'what', 'quoi', 'شو عم تعمل؟'),
    W('ليش', 'laysh', 'لماذا', 'why', 'pourquoi', 'ليش ما اتّصلت؟'),
    W('وين', 'wayn', 'أين', 'where', 'où', 'وين المفاتيح؟'),
    W('قدّيش', 'addaysh', 'كم', 'how much / how many', 'combien', 'قدّيش عمرك؟'),
    W('منيح', 'mnih', 'جيّد، بخير', 'good, fine', 'bien', 'الحمدلله، كلّنا مناح.'),
    W('كتير', 'ktir', 'كثيراً، جداً', 'a lot, very', 'beaucoup, très', 'بحبّك كتير.'),
    W('شوي', 'shway', 'قليلاً', 'a little', 'un peu', 'استنّى شوي.'),
    W('بدّي', 'baddi', 'أريد', 'I want', 'je veux', 'بدّي منقوشة زعتر.'),
    W('ما في', 'ma fi', 'لا يوجد', 'there isn’t', 'il n’y a pas', 'ما في كهربا اليوم.'),
    W('مبلا', 'mbala', 'بلى، أكيد (جواباً على النفي)', 'oh yes (answering a "no")', 'mais si', '— ما أكلت؟ — مبلا أكلت!'),
    W('أكيد', 'akid', 'بالتأكيد', 'sure, of course', 'bien sûr', 'أكيد جايين عالعرس.'),
    W('يعني', 'ya3ni', 'أقصد، يعني', 'I mean, so', 'c’est-à-dire', 'يعني، شوي تعبان.'),
    W('خلص', 'khalas', 'انتهى، يكفي', 'enough, done', 'ça suffit, c’est fini', 'خلص، بكرا منكمّل.'),
    W('تقبرني', 'te2berni', 'كلمة حنان كبيرة: بحبّك كتير', 'a huge word of love (lit. "may you bury me")', 'un immense mot d’amour', 'تقبرني شو حلو!'),
    W('يا حرام', 'ya haram', 'يا للأسف، مسكين', 'poor thing, what a pity', 'le pauvre, quel dommage', 'يا حرام، وقع الولد.'),
    W('صحتين', 'sahtein', 'بالهنا، كُل وتهنّى', 'enjoy your food (lit. "two healths")', 'bon appétit', 'صحتين عقلبك!'),
    W('تسلم إيدك', 'teslam idak', 'شكراً عالأكل الطيّب', 'bless your hands (thanks for the cooking)', 'merci pour ce bon plat', 'تسلم إيدك يا ماما، بتجنّن الكبّة.'),
    W('نعيماً', 'na3iman', 'بتنقال بعد الحمّام أو قصّة الشعر', 'said after a shower or a haircut', 'se dit après la douche ou le coiffeur', 'نعيماً! شو حلوة قصّتك.'),
    W('الحمدلله عالسلامة', 'el hamdella 3as-salameh', 'أهلاً برجوعك بالسلامة', 'welcome back safe and sound', 'bon retour, sain et sauf', 'الحمدلله عالسلامة! كيف كانت الطيّارة؟'),
    W('يعطيك العافية', 'ya3tik el 3afyeh', 'الله يقوّيك (لحدا عم يشتغل)', 'bless your efforts (to someone working)', 'bon courage (à quelqu’un qui travaille)', 'يعطيك العافية يا بيّي.'),
    W('كل سنة وإنت سالم', 'kel sene w enta salem', 'معايدة بالعيد وعيد الميلاد', 'happy feast / happy birthday', 'bonne fête, joyeux anniversaire', 'كل سنة وإنتِ سالمة يا تيتا!'),
    W('تكرم', 'tekram', 'على راسي، بكل سرور', 'gladly, for you', 'avec plaisir, pour toi', '— بتجبلي مي؟ — تكرم!'),
    W('ولو', 'walaw', 'ما في شي، العفو', 'don’t mention it', 'de rien, voyons', '— شكراً! — ولو، هيدا واجبي.'),
    W('بعدين', 'ba3dayn', 'لاحقاً', 'later', 'plus tard', 'بعدين منحكي.'),
    W('هيك', 'hek', 'هكذا', 'like this, so', 'comme ça', 'منعملها هيك.'),
    W('عنجد', '3an jadd', 'جدّياً، حقيقةً', 'seriously, really', 'sérieusement', 'عنجد؟ ما بصدّق!'),
    W('مبسوط', 'mabsout', 'فرحان', 'happy', 'content', 'كتير مبسوط إنّك هون.'),
    W('زعلان', 'za3lan', 'حزين أو متضايق', 'upset, sad', 'fâché, triste', 'ليش زعلان يا حبيبي؟'),
    W('حبيبي', 'habibi / habibti', 'يا عزيزي', 'my dear, my love', 'mon chéri', 'تعا يا حبيبي.'),
    W('تيتا', 'teta', 'الجدّة', 'grandma', 'grand-mère', 'تيتا عاملة ورق عنب.'),
    W('جدّو', 'jeddo', 'الجدّ', 'grandpa', 'grand-père', 'جدّو عم يلعب طاولة.'),
    W('خيّي', 'khayye', 'أخي (وبتنقال للصاحب كمان)', 'my brother (also for a friend)', 'mon frère (aussi entre amis)', 'شو يا خيّي، كيفك؟'),
    W('بيّي', 'bayyi', 'أبي', 'my dad', 'mon père', 'بيّي بيسلّم عليك.'),
    W('إمّي', 'emmi', 'أمّي', 'my mum', 'ma mère', 'إمّي بتطبخ أطيب أكل.'),
    W('شو صار؟', 'shu sar?', 'ماذا حدث؟', 'what happened?', 'qu’est-ce qui s’est passé ?', 'شو صار بالمباراة؟'),
    W('ما بعرف', 'ma ba3ref', 'لا أعرف', 'I don’t know', 'je ne sais pas', 'ما بعرف وين حطّيتهن.'),
    W('بحبّك', 'b7ebbak / b7ebbik', 'أحبّك', 'I love you', 'je t’aime', 'بحبّك قدّ الدني.'),
    W('اشتقتلّك', 'eshta2tellak', 'افتقدتك', 'I missed you', 'tu m’as manqué', 'اشتقتلّك كتير يا ستّي.'),
    W('صباح الخير', 'sabah el kheir', 'تحيّة الصباح (والجواب: صباح النور)', 'good morning (answer: sabah el nour)', 'bonjour (réponse : sabah el nour)', 'صباح الخير! — صباح النور.'),
    W('تصبح على خير', 'tesbah 3a kheir', 'ليلة سعيدة', 'good night', 'bonne nuit', 'تصبحوا على خير، بكرا منحكي.'),
    W('دغري', 'doghri', 'على طول، مباشرةً', 'straight ahead, right away', 'tout droit', 'روح دغري وبعدين عاليمين.'),
    W('هيدا', 'hayda / haydi', 'هذا / هذه', 'this', 'ceci, celui-ci', 'هيدا بيتنا بالضيعة.'),
    W('كمان', 'kamen', 'أيضاً، بعد', 'also, more', 'aussi, encore', 'بدّي كمان شوي.'),
    W('بكرا', 'bukra', 'غداً', 'tomorrow', 'demain', 'بكرا منروح عالبحر.'),
    W('مبارح', 'mbereh', 'أمس', 'yesterday', 'hier', 'مبارح شتّت كتير.'),
    W('على راسي', '3a rasi', 'بكل سرور (حرفياً: على رأسي)', 'with pleasure (lit. "on my head")', 'avec plaisir (litt. « sur ma tête »)', '— بتساعدني؟ — على راسي!'),
    W('إن شاء الله', 'inshallah', 'إذا الله راد', 'God willing, hopefully', 'si Dieu le veut', 'منلتقى بالصيف إن شاء الله.'),
    W('معليش', 'ma3laysh', 'ما في مشكلة، سامحني', 'never mind, it’s ok', 'ce n’est pas grave', 'معليش، بتصير.'),
    W('يا ريت', 'ya rayt', 'أتمنّى', 'I wish', 'si seulement', 'يا ريت كنت معكن.'),
    W('تفضّل', 'tfaddal', 'اتفضّل، فوت، خود', 'please, come in, help yourself', 'je t’en prie, entre, sers-toi', 'تفضّلوا، البيت بيتكن.'),
    W('البيت بيتك', 'el beit beitak', 'إنت مش غريب هون', 'make yourself at home', 'fais comme chez toi', 'فوت، البيت بيتك.'),
    W('عالسريع', '3as-sari3', 'بسرعة', 'quickly', 'vite', 'عملنا فطور عالسريع.'),
    W('مش هيك؟', 'mish hek?', 'أليس كذلك؟', 'isn’t it?', 'n’est-ce pas ?', 'حلوة الضيعة، مش هيك؟'),
    W('ما تخاف', 'ma tkhaf', 'لا تقلق', 'don’t worry', 'ne t’inquiète pas', 'ما تخاف، كل شي منيح.'),
    W('عيب', '3ayb', 'ما بيصير، مش لائق', 'that’s not done, shame', 'ça ne se fait pas', 'عيب تحكي هيك مع جدّك.'),
    W('الله معك', 'allah ma3ak', 'مع السلامة', 'goodbye (God be with you)', 'au revoir (Dieu avec toi)', 'يلّا، الله معك!')
  ];

  const T = {
    ar: { title: '🗣️ كلمة اليوم', say: '🔊 اسمعها', ex: 'مثلاً:', other: 'كلمة تانية' },
    en: { title: '🗣️ Lebanese word of the day', say: '🔊 Hear it', ex: 'For example:', other: 'Another word' },
    fr: { title: '🗣️ Le mot libanais du jour', say: '🔊 L’écouter', ex: 'Par exemple :', other: 'Un autre mot' }
  };
  const t = k => (T[S.lang()] || T.ar)[k];
  const dayIndex = () => { const d = new Date(); return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5); };
  let i = dayIndex() % WORDS.length;

  function speak(text) {
    try {
      if (!('speechSynthesis' in window)) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const vs = speechSynthesis.getVoices();
      const v = vs.find(x => /^ar-LB/i.test(x.lang)) || vs.find(x => /^ar-(SY|JO|PS)/i.test(x.lang)) || vs.find(x => /^ar/i.test(x.lang));
      if (v) u.voice = v;
      u.lang = v ? v.lang : 'ar';
      u.rate = 0.85;
      speechSynthesis.speak(u);
    } catch { /* no voice on this phone */ }
  }
  const box = el('section', { className: 'wotd', id: 'wotd' });
  host.after(box);
  function render() {
    const w = WORDS[i];
    const lang = S.lang();
    const say = el('button', { type: 'button', className: 'btn wotd-say', text: t('say') });
    say.addEventListener('click', () => speak(w.w + '. ' + w.ex));
    const next = el('button', { type: 'button', className: 'link-btn', text: t('other') + ' ↻' });
    next.addEventListener('click', () => { i = (i + 1 + Math.floor(Math.random() * (WORDS.length - 1))) % WORDS.length; render(); });
    box.replaceChildren(
      el('h3', { className: 'pv-sub', text: t('title') }),
      el('div', { className: 'wotd-card' }, [
        el('p', { className: 'wotd-w', lang: 'ar', dir: 'rtl', text: w.w }),
        el('p', { className: 'wotd-tr', lang: 'en', dir: 'ltr', text: w.tr }),
        el('p', { className: 'wotd-m', dir: 'auto', text: w.m[lang] || w.m.en }),
        el('p', { className: 'wotd-ex', lang: 'ar', dir: 'rtl' }, [el('span', { className: 'quiet', text: t('ex') + ' ' }), el('span', { text: w.ex })]),
        el('div', { className: 'q-row' }, [say, next])
      ])
    );
  }
  document.addEventListener('sawt:lang', render);
  window.SawtWords = { today: () => WORDS[dayIndex() % WORDS.length], all: WORDS };
  render();
})();

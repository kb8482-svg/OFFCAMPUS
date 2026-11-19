(() => {
  const $ = (selector) => document.querySelector(selector);
  const tokenKey = 'offcampus_token';
  const userKey = 'offcampus_user';
  const languageKey = 'offcampus_language';
  const currencyKey = 'offcampus_currency';
  const translations = {
    'YOUR CREW. YOUR CASH. CLEAR.': 'TVOJA DRUŽBA. TVOJ DENAR. JASNO.',
    'Welcome home.': 'Dobrodošel doma.',
    'Make yourself at home.': 'Počuti se kot doma.',
    'Keep your everyday spending and shared bills in one calm place.': 'Na enem mestu spremljaj vsakodnevne stroške in skupne račune.',
    'Create an account to keep your everyday spending in one calm place.': 'Ustvari račun za pregled nad vsakodnevnimi stroški.',
    'Log in': 'Prijava',
    'Create account': 'Ustvari račun',
    'Username': 'Uporabniško ime',
    'Email address': 'E-poštni naslov',
    'Username or email': 'Uporabniško ime ali e-pošta',
    'Password': 'Geslo',
    'Use at least 10 characters.': 'Uporabi vsaj 10 znakov.',
    'Just exploring?': 'Samo raziskuješ?',
    'Demo login:': 'Preizkusna prijava:',
    'Made for shared kitchens, rent days, and everything in between.': 'Za skupne kuhinje, plačilo najemnine in vse vmes.',
    'OffCampus home': 'Domov OffCampus',
    'WORKSPACE': 'DELOVNI PROSTOR',
    'Overview': 'Pregled',
    'Expenses': 'Stroški',
    'Roommate balance': 'Stanje s sostanovalci',
    'Goals': 'Cilji',
    'My profile': 'Moj profil',
    'Roommate': 'Sostanovalec',
    'Better on the same team.': 'Skupaj gre lažje.',
    'Keep shared costs clear, so home stays in your corner.': 'Pregledni skupni stroški za prijetnejši dom.',
    'Personal account': 'Osebni račun',
    'Log out': 'Odjava',
    'YOUR HOME BASE': 'TVOJE IZHODIŠČE',
    'Language': 'Jezik',
    'Currency': 'Valuta',
    'Add expense': 'Dodaj strošek',
    'A FRESH LOOK AT YOUR FINANCES': 'NOV PREGLED TVOJIH FINANC',
    'Your overview': 'Tvoj pregled',
    'Here’s how things are looking this month.': 'Tako so videti tvoje finance ta mesec.',
    'This month’s spending': 'Poraba v tem mesecu',
    'You owe': 'Dolguješ',
    'Owed to you': 'Dolgujejo tebi',
    'Unsettled roommate shares': 'Neplačani deleži sostanovalcev',
    'Unsettled shares you covered': 'Neplačani deleži, ki si jih poravnal',
    'WHERE IT GOES': 'KAM GRE DENAR',
    'Spending by category': 'Poraba po kategorijah',
    'No expenses logged this month yet.': 'Ta mesec še ni zabeleženih stroškov.',
    'LATEST ACTIVITY': 'ZADNJA DEJAVNOST',
    'Recent expenses': 'Nedavni stroški',
    'See all': 'Poglej vse',
    'Your first expense is just around the corner.': 'Dodaj svoj prvi strošek.',
    'THE LITTLE THINGS AND THE BIG BILLS': 'MAJHNI STROŠKI IN VELIKI RAČUNI',
    'Everything you’ve spent, all in one place.': 'Vsi tvoji stroški na enem mestu.',
    'NEW ENTRY': 'NOV VNOS',
    'Add an expense': 'Dodaj strošek',
    'Edit expense': 'Uredi strošek',
    'What was it for?': 'Za kaj je šlo?',
    'e.g. Weekly groceries': 'npr. Tedenski nakup',
    'Amount (€)': 'Znesek',
    'Amount ($)': 'Znesek',
    'Choose a category': 'Izberi kategorijo',
    'Category': 'Kategorija',
    'Date': 'Datum',
    'Receipt (optional)': 'Račun (neobvezno)',
    'JPEG, PNG, WebP, or PDF · up to 10 MB · private to you': 'JPEG, PNG, WebP ali PDF · do 10 MB · zasebno',
    'Share this expense': 'Deli ta strošek',
    'Choose roommates and how much each person owes.': 'Izberi sostanovalce in znesek njihovega deleža.',
    'Roommate shares': 'Deleži sostanovalcev',
    '＋ Add person': '＋ Dodaj osebo',
    'Enter each roommate’s share. Any remaining amount is your own share.': 'Vnesi delež vsakega sostanovalca. Preostanek je tvoj delež.',
    'Save expense': 'Shrani strošek',
    'Save changes': 'Shrani spremembe',
    'Cancel edit': 'Prekliči urejanje',
    'YOUR HOUSEHOLD ACTIVITY': 'DEJAVNOST V GOSPODINJSTVU',
    'All expenses': 'Vsi stroški',
    'entry': 'vnos',
    'entries': 'vnosov',
    'No expenses to show. Add one to get started.': 'Ni stroškov za prikaz. Najprej dodaj strošek.',
    'SMALL STEPS ADD UP': 'MAJHNI KORAKI ŠTEJEJO',
    'Your money goals': 'Tvoji finančni cilji',
    'Track savings you log yourself and spending from expenses you enter.': 'Spremljaj ročno vnesene prihranke in stroške iz aplikacije.',
    'MAKE A PLAN': 'NAREDI NAČRT',
    'Add a goal': 'Dodaj cilj',
    'Goal name': 'Ime cilja',
    'e.g. Emergency fund': 'npr. sklad za nujne primere',
    'Goal type': 'Vrsta cilja',
    'Savings target': 'Cilj varčevanja',
    'Spending budget': 'Proračun porabe',
    'Period': 'Obdobje',
    'Weekly': 'Tedensko',
    'Monthly': 'Mesečno',
    'Yearly': 'Letno',
    'Target': 'Cilj',
    'weekly savings goal': 'tedenski cilj varčevanja',
    'monthly savings goal': 'mesečni cilj varčevanja',
    'yearly savings goal': 'letni cilj varčevanja',
    'weekly spending budget': 'tedenski proračun porabe',
    'monthly spending budget': 'mesečni proračun porabe',
    'yearly spending budget': 'letni proračun porabe',
    'Target (€)': 'Ciljni znesek',
    'Target ($)': 'Ciljni znesek',
    '＋ Add goal': '＋ Dodaj cilj',
    'No goals yet. Add a savings target or spending budget above.': 'Še nimaš ciljev. Zgoraj dodaj cilj varčevanja ali proračun porabe.',
    'YOUR ACCOUNT, YOUR DETAILS': 'TVOJ RAČUN, TVOJI PODATKI',
    'Only you can view and update your profile information and picture.': 'Svoje podatke in profilno sliko lahko vidiš in urejaš samo ti.',
    'PERSONAL DETAILS': 'OSEBNI PODATKI',
    'Your profile': 'Tvoj profil',
    'Profile picture preview': 'Predogled profilne slike',
    'Profile picture': 'Profilna slika',
    'JPEG, PNG, or WebP · up to 5 MB': 'JPEG, PNG ali WebP · do 5 MB',
    'Remove picture': 'Odstrani sliko',
    'Username (unique)': 'Uporabniško ime (enolično)',
    'Email': 'E-pošta',
    'Display name': 'Prikazno ime',
    'Save profile': 'Shrani profil',
    'The app does not connect to your bank, request bank passwords, or process payments. Savings contributions are entered manually.': 'Aplikacija se ne povezuje z banko, ne zahteva bančnih gesel in ne obdeluje plačil. Prihranke vneseš ročno.',
    'NO AWKWARD MATH REQUIRED': 'BREZ ZAPLETENEGA RAČUNANJA',
    'A clear view of shared expenses that still need settling.': 'Pregled skupnih stroškov, ki jih je treba še poravnati.',
    'Your unsettled shares': 'Tvoji neporavnani deleži',
    'Roommate shares you covered': 'Deleži sostanovalcev, ki si jih plačal',
    'Roommate share in euros': 'Delež sostanovalca v evrih',
    'Roommate share in dollars': 'Delež sostanovalca v dolarjih',
    'PLEASE REVIEW': 'PREGLEJ',
    'Shared expenses awaiting your approval': 'Skupni stroški čakajo na tvojo odobritev',
    'open': 'odprtih',
    'pending': 'čaka',
    'item': 'strošek',
    'items': 'stroškov',
    'person': 'oseba',
    'people': 'oseb',
    'Expense': 'Strošek',
    'Added by': 'Dodal',
    'Your share': 'Tvoj delež',
    'Review': 'Pregled',
    'SHARED TAB': 'SKUPNI RAČUN',
    'Open balances': 'Odprte obveznosti',
    'Who owes': 'Kdo dolguje',
    'Paid by': 'Plačal',
    'Amount': 'Znesek',
    'Status': 'Stanje',
    'All settled up. Nice work, everyone.': 'Vse je poravnano. Odlično!',
    'Roommates can mark their own share as paid, or the person who covered it can confirm settlement.': 'Sostanovalci lahko označijo svoj delež kot plačan ali pa plačnik potrdi poravnavo.',
    'OffCampus': 'OffCampus',
    'Choose a roommate': 'Izberi sostanovalca',
    'Share €': 'Delež €',
    'Share $': 'Delež $',
    'Remove roommate': 'Odstrani sostanovalca',
    'Delete': 'Izbriši',
    'Edit': 'Uredi',
    'Add receipt': 'Dodaj račun',
    'Add another file': 'Dodaj drugo datoteko',
    'Remove': 'Odstrani',
    'Accept': 'Sprejmi',
    'Decline': 'Zavrni',
    'Mark settled': 'Označi kot poravnano',
    'You': 'Ti',
    'paid by': 'plačal/-a',
    'Shared': 'Skupno',
    'awaiting approval': 'čaka na odobritev',
    'declined': 'zavrnjeno',
    'overdue': 'preseženo',
    'savings goal': 'cilj varčevanja',
    'spending budget': 'proračun porabe',
    'Savings target reached for this period.': 'Cilj varčevanja za to obdobje je dosežen.',
    ' left to save this period.': ' še za prihraniti v tem obdobju.',
    ' over budget for this period.': ' nad proračunom za to obdobje.',
    ' remaining in this period’s budget.': ' še na voljo v proračunu za to obdobje.',
    'Contribution (€)': 'Prihranek (€)',
    'Contribution ($)': 'Prihranek ($)',
    'Savings contribution in euros': 'Znesek prihranka v evrih',
    'Savings contribution in dollars': 'Znesek prihranka v dolarjih',
    'Your profile picture': 'Tvoja profilna slika',
    'Optional note': 'Opomba (neobvezno)',
    'Optional contribution note': 'Neobvezna opomba za prihranek',
    'Log savings': 'Zabeleži prihranek',
    'This month': 'Ta mesec',
    'expense': 'strošek',
    'Expense saved.': 'Strošek shranjen.',
    'Expense updated.': 'Strošek posodobljen.',
    'Expense deleted.': 'Strošek izbrisan.',
    'Goal added.': 'Cilj dodan.',
    'Goal removed.': 'Cilj odstranjen.',
    'Savings contribution recorded.': 'Prihranek zabeležen.',
    'Savings contribution removed.': 'Prihranek odstranjen.',
    'Profile saved.': 'Profil shranjen.',
    'Profile picture updated.': 'Profilna slika posodobljena.',
    'Profile picture removed.': 'Profilna slika odstranjena.',
    'Private receipt saved.': 'Zasebni račun shranjen.',
    'Receipt removed.': 'Račun odstranjen.',
    'Share marked as settled.': 'Delež označen kot poravnan.',
    'Shared expense accepted.': 'Skupni strošek sprejet.',
    'Shared expense declined.': 'Skupni strošek zavrnjen.',
    'You have been logged out.': 'Odjavljen si.',
    'Choose a roommate and enter their share for every row.': 'Za vsako vrstico izberi sostanovalca in vnesi njegov delež.',
    'Delete this expense and its roommate splits?': 'Izbrišem ta strošek in deleže sostanovalcev?',
    'Decline this shared expense? It will not be added to your balance.': 'Zavrniti ta skupni strošek? Ne bo dodan med tvoje obveznosti.',
    'Remove this savings contribution?': 'Odstranim ta prihranek?',
    'Remove receipt confirmation': 'Odstranim račun »{name}«?',
    'Remove goal confirmation': 'Odstranim cilj »{name}« in zgodovino prihrankov?',
    'Remove your profile picture?': 'Odstranim tvojo profilno sliko?',
    'This app only changes the currency symbol; it does not convert amounts.': 'Aplikacija spremeni samo simbol valute; zneskov ne preračuna.',
    'Expense saved, but its file could not be uploaded:': 'Strošek je shranjen, datoteke pa ni bilo mogoče naložiti:',
    'Based on expenses you entered as paid by you during this period.': 'Izračunano iz stroškov, ki si jih v tem obdobju vnesel kot plačane.',
    'Today': 'Danes',
    'Sunday': 'nedelja',
    'Monday': 'ponedeljek',
    'Tuesday': 'torek',
    'Wednesday': 'sreda',
    'Thursday': 'četrtek',
    'Friday': 'petek',
    'Saturday': 'sobota',
    'Food': 'Hrana',
    'Rent': 'Najemnina',
    'Phone': 'Telefon',
    'Utilities': 'Komunalne storitve',
    'Entertainment': 'Zabava',
    'Transport': 'Prevoz',
    'Other': 'Drugo'
  };
  const staticTextNodes = [];
  const staticAttributes = [];
  const state = {
    token: localStorage.getItem(tokenKey),
    language: localStorage.getItem(languageKey) === 'sl' ? 'sl' : 'en',
    currency: localStorage.getItem(currencyKey) === 'USD' ? 'USD' : 'EUR',
    user: null,
    categories: [],
    users: [],
    expenses: [],
    receipts: [],
    goals: [],
    profile: null,
    avatarObjectUrl: null,
    editingId: null,
    authMode: 'login',
    toastTimer: null
  };
  const icons = {
    Food: '✳', Rent: '⌂', Phone: '▯', Utilities: '⌁',
    Entertainment: '♫', Transport: '↗', Other: '·'
  };

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function t(text) {
    return state.language === 'sl' ? translations[text] || text : text;
  }

  function captureStaticText() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      staticTextNodes.push({ node, original: node.nodeValue });
      node = walker.nextNode();
    }
    for (const element of document.body.querySelectorAll('[aria-label], [title], [placeholder]')) {
      for (const name of ['aria-label', 'title', 'placeholder']) {
        if (element.hasAttribute(name)) {
          staticAttributes.push({ element, name, original: element.getAttribute(name) });
        }
      }
    }
  }

  function applyLanguage() {
    const locale = state.language === 'sl' ? 'sl-SI' : state.currency === 'USD' ? 'en-US' : 'en-IE';
    document.documentElement.lang = state.language;
    $('#language-select').value = state.language;
    $('#currency-select').value = state.currency;
    for (const { node, original } of staticTextNodes) {
      const trimmed = original.trim();
      if (!trimmed) continue;
      node.nodeValue = original.replace(trimmed, t(trimmed));
    }
    for (const { element: node, name, original } of staticAttributes) {
      node.setAttribute(name, t(original));
    }
    $('[data-i18n="Language"]').textContent = t('Language');
    $('[data-i18n="Currency"]').textContent = t('Currency');
    $('#language-select').setAttribute('aria-label', t('Language'));
    $('#currency-select').setAttribute('aria-label', t('Currency'));
    $('#expense-amount').closest('.field').querySelector('span').textContent =
      `${t('Amount')} (${state.currency === 'EUR' ? '€' : '$'})`;
    $('#goal-target').closest('.field').querySelector('span').textContent =
      `${t('Target')} (${state.currency === 'EUR' ? '€' : '$'})`;
    $('#today-label').textContent = new Intl.DateTimeFormat(locale, {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date());
    setAuthMode(state.authMode);
    $('#expense-form-title').textContent = state.editingId ? t('Edit expense') : t('Add an expense');
    $('#save-expense').textContent = t(state.editingId ? 'Save changes' : 'Save expense');
    $('#cancel-edit').textContent = t('Cancel edit');
  }

  async function updateSetting(name, value) {
    if (name === 'language') {
      state.language = value === 'sl' ? 'sl' : 'en';
      localStorage.setItem(languageKey, state.language);
    } else {
      state.currency = value === 'USD' ? 'USD' : 'EUR';
      localStorage.setItem(currencyKey, state.currency);
    }
    applyLanguage();
    if (state.token) {
      try {
        await loadData();
      } catch (error) {
        showToast(error.message, true);
      }
    }
  }

  function money(value) {
    const locale = state.language === 'sl' ? 'sl-SI' : state.currency === 'USD' ? 'en-US' : 'en-IE';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: state.currency }).format(Number(value) || 0);
  }

  function readableDate(value) {
    const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
    const locale = state.language === 'sl' ? 'sl-SI' : 'en-IE';
    return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat(locale, {
      day: 'numeric', month: 'short', year: 'numeric'
    }).format(date);
  }

  function showToast(message, isError = false) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.toggle('error', isError);
    toast.classList.add('visible');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => toast.classList.remove('visible'), 3600);
  }

  async function api(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (options.body !== undefined && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    if (state.token) headers.set('Authorization', `Bearer ${state.token}`);
    const response = await fetch(`${window.OFFCAMPUS_API_URL || ''}/api${path}`, {
      ...options,
      headers
    });
    const data = response.status === 204 ? null : await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) signOut(false);
      const error = new Error(data?.error || `Request failed (${response.status}).`);
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function setAuthMode(mode) {
    state.authMode = mode;
    const isRegister = mode === 'register';
    $('#login-tab').classList.toggle('active', !isRegister);
    $('#register-tab').classList.toggle('active', isRegister);
    $('#login-tab').setAttribute('aria-selected', String(!isRegister));
    $('#register-tab').setAttribute('aria-selected', String(isRegister));
    $('#auth-title').textContent = t(isRegister ? 'Make yourself at home.' : 'Welcome home.');
    $('#auth-intro').textContent = isRegister
      ? t('Create an account to keep your everyday spending in one calm place.')
      : t('Keep your everyday spending and shared bills in one calm place.');
    $('#username-field').hidden = !isRegister;
    $('#email-field').hidden = !isRegister;
    $('#identifier-field').hidden = isRegister;
    $('#auth-username').required = isRegister;
    $('#auth-email').required = isRegister;
    $('#auth-identifier').required = !isRegister;
    $('#auth-password').autocomplete = isRegister ? 'new-password' : 'current-password';
    $('#password-hint').hidden = !isRegister;
    $('#auth-submit').textContent = t(isRegister ? 'Create account' : 'Log in');
    $('#auth-error').textContent = '';
  }

  async function onAuthSubmit(event) {
    event.preventDefault();
    $('#auth-error').textContent = '';
    const form = event.currentTarget;
    const isRegister = state.authMode === 'register';
    const formData = new FormData(form);
    const payload = isRegister
      ? {
          username: formData.get('username'),
          email: formData.get('email'),
          password: formData.get('password')
        }
      : {
          identifier: formData.get('identifier'),
          password: formData.get('password')
        };
    try {
      const result = await api(`/auth/${isRegister ? 'register' : 'login'}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      state.token = result.token;
      state.user = result.user;
      localStorage.setItem(tokenKey, result.token);
      localStorage.setItem(userKey, JSON.stringify(result.user));
      await startApp();
      form.reset();
    } catch (error) {
      $('#auth-error').textContent = error.message;
    }
  }

  function signOut(showMessage = true) {
    if (state.avatarObjectUrl) URL.revokeObjectURL(state.avatarObjectUrl);
    state.avatarObjectUrl = null;
    state.token = null;
    state.user = null;
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    $('#app-shell').hidden = true;
    $('#auth-screen').hidden = false;
    if (showMessage) showToast(t('You have been logged out.'));
  }

  async function startApp() {
    $('#auth-screen').hidden = true;
    $('#app-shell').hidden = false;
    const savedUser = state.user || JSON.parse(localStorage.getItem(userKey) || 'null');
    state.user = savedUser;
    applyLanguage();
    try {
      await loadData();
    } catch (error) {
      if (error.status === 401) return;
      showToast(error.message, true);
    }
  }

  async function loadData() {
    const [categoriesResult, usersResult, expensesResult, receiptsResult, summary, balance, goalsResult, profile] = await Promise.all([
      api('/categories'),
      api('/users'),
      api('/expenses'),
      api('/expenses/receipts'),
      api('/expenses/summary'),
      api('/expenses/balance'),
      api('/goals'),
      api('/profile')
    ]);
    state.categories = categoriesResult.categories;
    state.users = usersResult.users;
    state.expenses = expensesResult.expenses;
    state.receipts = receiptsResult.receipts;
    state.goals = goalsResult.goals;
    state.profile = profile;
    await renderProfile(profile);
    fillCategories();
    renderDashboard(summary, balance);
    renderExpenses();
    renderBalance(balance);
    renderGoals(state.goals);
  }

  async function renderProfile(profile) {
    $('#profile-name').textContent = profile.displayName;
    $('#profile-username').value = profile.username;
    $('#profile-email').value = profile.email;
    $('#profile-display-name').value = profile.displayName;
    $('#remove-profile-picture').hidden = !profile.hasAvatar;
    if (!profile.hasAvatar && state.avatarObjectUrl) {
      URL.revokeObjectURL(state.avatarObjectUrl);
      state.avatarObjectUrl = null;
    }
    if (profile.hasAvatar && !state.avatarObjectUrl) {
      const response = await fetch(`${window.OFFCAMPUS_API_URL || ''}/api/profile/avatar`, {
        headers: { Authorization: 'Bearer '.concat(state.token) }
      });
      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) signOut(false);
        throw new Error(data.error || `Profile picture request failed (${response.status}).`);
      }
      state.avatarObjectUrl = URL.createObjectURL(await response.blob());
    }
    const initial = profile.displayName.trim().slice(0, 1) || 'S';
    for (const selector of ['#profile-avatar', '#profile-preview']) {
      const avatar = $(selector);
      avatar.replaceChildren();
      if (state.avatarObjectUrl) {
        const image = document.createElement('img');
        image.src = state.avatarObjectUrl;
        image.alt = t('Your profile picture');
        avatar.append(image);
      } else {
        avatar.textContent = initial;
      }
    }
  }

  function fillCategories() {
    const select = $('#expense-category');
    select.replaceChildren(new Option(t('Choose a category'), ''));
    for (const category of state.categories) {
      select.add(new Option(t(category.name), category.id));
    }
  }

  function categoryIcon(name) {
    return icons[name] || icons.Other;
  }

  function renderDashboard(summary, balance) {
    $('#stat-spending').textContent = money(summary.total);
    $('#stat-owed').textContent = money(balance.owedByMe);
    $('#stat-due').textContent = money(balance.owedToMe);
    const monthDate = new Date(`${summary.month}-01T12:00:00`);
    const locale = state.language === 'sl' ? 'sl-SI' : state.currency === 'USD' ? 'en-US' : 'en-IE';
    const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(monthDate);
    $('#stat-month').textContent = monthLabel;
    $('#category-month').textContent = monthLabel;

    const breakdown = $('#category-breakdown');
    breakdown.replaceChildren();
    const categories = summary.categories;
    $('#category-empty').hidden = categories.length > 0;
    const maxTotal = Math.max(...categories.map((category) => category.total), 1);
    for (const category of categories) {
      const item = element('div', 'category-item');
      const top = element('div', 'category-item-top');
      top.append(element('span', '', category.name), element('strong', '', money(category.total)));
      const track = element('div', 'progress-track');
      const bar = element('div', 'progress-fill');
      bar.style.setProperty('--bar-width', `${Math.max(4, category.total / maxTotal * 100)}%`);
      track.append(bar);
      item.append(top, track);
      breakdown.append(item);
    }

    const recent = $('#recent-expenses');
    recent.replaceChildren();
    const latest = state.expenses.slice(0, 5);
    $('#recent-empty').hidden = latest.length > 0;
    for (const expense of latest) recent.append(createExpenseRow(expense, false));
  }

  function createExpenseRow(expense, actions) {
    const row = element('article', actions ? 'expense-row' : 'recent-row');
    const badge = element('span', 'category-badge', categoryIcon(expense.category));
    badge.setAttribute('aria-hidden', 'true');
    const copy = element('div', 'expense-copy');
    copy.append(
      element('strong', '', expense.description),
      element('span', '', `${t(expense.category)} · ${readableDate(expense.date)}${expense.user_id !== state.user?.id ? ` · ${t('paid by')} ${expense.payer}` : ''}`)
    );
    if (expense.isShared) {
      const participants = expense.splits.map((split) => {
        const status = split.status === 'pending' ? ` (${t('awaiting approval')})`
          : split.status === 'rejected' ? ` (${t('declined')})` : '';
        return `${split.username}${status}`;
      }).join(', ');
      copy.append(element('span', 'shared-tag', `${t('Shared')}${participants ? ` · ${participants}` : ''}`));
    }
    if (actions && expense.user_id === state.user?.id) {
      const receipts = state.receipts.filter((receipt) => receipt.expenseId === expense.id);
      const receiptList = element('div', 'receipt-list');
      for (const receipt of receipts) {
        const receiptRow = element('div', 'receipt-item');
        const download = element('button', 'text-button', receipt.name);
        download.type = 'button';
        download.addEventListener('click', () => downloadReceipt(expense.id, receipt));
        const remove = element('button', 'mini-button danger', t('Remove'));
        remove.type = 'button';
        remove.addEventListener('click', () => deleteReceipt(expense.id, receipt));
        receiptRow.append(download, remove);
        receiptList.append(receiptRow);
      }
      const upload = element('button', 'mini-button', t(receipts.length ? 'Add another file' : 'Add receipt'));
      upload.type = 'button';
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/jpeg,image/png,image/webp,application/pdf';
      fileInput.hidden = true;
      fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) uploadReceipt(expense.id, fileInput.files[0]);
        fileInput.value = '';
      });
      upload.addEventListener('click', () => fileInput.click());
      receiptList.append(upload, fileInput);
      copy.append(receiptList);
    }
    row.append(badge, copy, element('strong', 'row-amount', money(expense.amount)));
    if (actions && expense.user_id === state.user?.id) {
      const buttons = element('div', 'expense-row-actions');
      const edit = element('button', 'mini-button', t('Edit'));
      edit.type = 'button';
      edit.addEventListener('click', () => editExpense(expense));
      const remove = element('button', 'mini-button danger', t('Delete'));
      remove.type = 'button';
      remove.addEventListener('click', () => deleteExpense(expense.id));
      buttons.append(edit, remove);
      row.append(buttons);
    }
    return row;
  }

  function renderExpenses() {
    const list = $('#expense-list');
    list.replaceChildren();
    $('#expense-count').textContent = `${state.expenses.length} ${t(state.expenses.length === 1 ? 'entry' : 'entries')}`;
    $('#expense-list-empty').hidden = state.expenses.length > 0;
    for (const expense of state.expenses) list.append(createExpenseRow(expense, true));
  }

  function renderBalance(balance) {
    $('#balance-owed').textContent = money(balance.owedByMe);
    $('#balance-due').textContent = money(balance.owedToMe);
    $('#balance-count').textContent = `${balance.debts.length} ${t('open')}`;
    const pendingSplits = balance.pendingSplits || [];
    $('#pending-splits-panel').hidden = pendingSplits.length === 0;
    $('#pending-split-count').textContent = `${pendingSplits.length} ${t('pending')}`;
    const pendingBody = $('#pending-split-rows');
    pendingBody.replaceChildren();
    for (const split of pendingSplits) {
      const row = document.createElement('tr');
      const description = document.createElement('td');
      description.append(element('strong', '', split.description), document.createElement('br'), element('span', 'field-hint', readableDate(split.date)));
      const payer = element('td', '', split.payer);
      const amount = element('td', 'balance-amount', money(split.amount));
      const actionCell = document.createElement('td');
      const accept = element('button', 'mini-button', t('Accept'));
      accept.type = 'button';
      accept.addEventListener('click', () => decideSplit(split, 'accept'));
      const reject = element('button', 'mini-button danger', t('Decline'));
      reject.type = 'button';
      reject.addEventListener('click', () => decideSplit(split, 'reject'));
      actionCell.append(accept, reject);
      row.append(description, payer, amount, actionCell);
      pendingBody.append(row);
    }
    const body = $('#balance-rows');
    body.replaceChildren();
    $('#balance-empty').hidden = balance.debts.length > 0;
    for (const debt of balance.debts) {
      const row = document.createElement('tr');
      const description = document.createElement('td');
      description.append(element('strong', '', debt.description), document.createElement('br'), element('span', 'field-hint', readableDate(debt.date)));
      const debtor = document.createElement('td');
      debtor.textContent = debt.debtorId === state.user?.id ? t('You') : debt.debtor;
      const payer = document.createElement('td');
      payer.textContent = debt.payerId === state.user?.id ? t('You') : debt.payer;
      const amount = element('td', 'balance-amount', money(debt.amount));
      const actionCell = document.createElement('td');
      const settle = element('button', 'mini-button', t('Mark settled'));
      settle.type = 'button';
      settle.addEventListener('click', () => settleSplit(debt));
      actionCell.append(settle);
      row.append(description, debtor, payer, amount, actionCell);
      body.append(row);
    }
  }

  function setView(viewName) {
    for (const section of document.querySelectorAll('.page-view')) {
      section.hidden = section.id !== `${viewName}-view`;
    }
    for (const button of document.querySelectorAll('.nav-link')) {
      const active = button.dataset.view === viewName;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
  }

  function resetExpenseForm() {
    state.editingId = null;
    $('#expense-form').reset();
    $('#expense-date').value = new Date().toISOString().slice(0, 10);
    $('#expense-form-title').textContent = t('Add an expense');
    $('#save-expense').textContent = t('Save expense');
    $('#cancel-edit').textContent = t('Cancel edit');
    $('#cancel-edit').hidden = true;
    $('#split-editor').hidden = true;
    $('#split-rows').replaceChildren();
    $('#expense-error').textContent = '';
  }

  function addSplitRow(existing = null) {
    const row = element('div', 'split-row');
    const person = document.createElement('select');
    person.setAttribute('aria-label', t('Roommate'));
    person.required = true;
    person.add(new Option(t('Choose a roommate'), ''));
    for (const user of state.users) person.add(new Option(user.username, user.id));
    const amount = document.createElement('input');
    amount.type = 'number';
    amount.min = '0.01';
    amount.step = '0.01';
    amount.placeholder = t(state.currency === 'EUR' ? 'Share €' : 'Share $');
    amount.setAttribute('aria-label', t(state.currency === 'EUR' ? 'Roommate share in euros' : 'Roommate share in dollars'));
    amount.required = true;
    const remove = element('button', 'split-remove', '×');
    remove.type = 'button';
    remove.setAttribute('aria-label', t('Remove roommate'));
    remove.addEventListener('click', () => row.remove());
    if (existing) {
      person.value = String(existing.userId);
      amount.value = existing.shareAmount;
    }
    row.append(person, amount, remove);
    $('#split-rows').append(row);
  }

  function focusExpenseForm() {
    setView('expenses');
    $('#expense-description').focus();
    document.querySelector('.expense-form-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function editExpense(expense) {
    state.editingId = expense.id;
    setView('expenses');
    $('#expense-form-title').textContent = t('Edit expense');
    $('#save-expense').textContent = t('Save changes');
    $('#cancel-edit').hidden = false;
    $('#expense-description').value = expense.description;
    $('#expense-amount').value = expense.amount;
    $('#expense-category').value = String(expense.category_id);
    $('#expense-date').value = String(expense.date).slice(0, 10);
    $('#expense-shared').checked = expense.isShared;
    $('#split-editor').hidden = !expense.isShared;
    $('#split-rows').replaceChildren();
    for (const split of expense.splits) addSplitRow(split);
    if (expense.isShared && expense.splits.length === 0) addSplitRow();
    $('#expense-error').textContent = '';
    document.querySelector('.expense-form-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function onExpenseSubmit(event) {
    event.preventDefault();
    $('#expense-error').textContent = '';
    const wasEditing = Boolean(state.editingId);
    const isShared = $('#expense-shared').checked;
    const splits = [...document.querySelectorAll('.split-row')].map((row) => ({
      userId: Number(row.querySelector('select').value),
      shareAmount: Number(row.querySelector('input').value)
    }));
    if (isShared && splits.some((split) => !split.userId || !split.shareAmount)) {
      $('#expense-error').textContent = t('Choose a roommate and enter their share for every row.');
      return;
    }
    const payload = {
      description: $('#expense-description').value,
      amount: Number($('#expense-amount').value),
      categoryId: Number($('#expense-category').value),
      date: $('#expense-date').value,
      isShared,
      splits: isShared ? splits : []
    };
    let savedExpense;
    try {
      savedExpense = await api(`/expenses${state.editingId ? `/${state.editingId}` : ''}`, {
        method: state.editingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
    } catch (error) {
      $('#expense-error').textContent = error.message;
      return;
    }
    const expenseId = wasEditing ? state.editingId : savedExpense.expense.id;
    const receiptFile = $('#expense-receipt').files[0];
    let receiptError = null;
    if (receiptFile) {
      const formData = new FormData();
      formData.append('file', receiptFile);
      try {
        await api(`/expenses/${expenseId}/receipts`, { method: 'POST', body: formData });
      } catch (error) {
        receiptError = error;
      }
    }
    resetExpenseForm();
    try {
      await loadData();
      if (receiptError) {
        showToast(`${t('Expense saved, but its file could not be uploaded:')} ${receiptError.message}`, true);
      } else {
        showToast(t(wasEditing ? 'Expense updated.' : 'Expense saved.'));
      }
    } catch (error) {
      showToast(error.message, true);
    }
  }

  async function uploadReceipt(expenseId, file) {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api(`/expenses/${expenseId}/receipts`, { method: 'POST', body: formData });
      await loadData();
      showToast(t('Private receipt saved.'));
    } catch (error) {
      showToast(error.message, true);
    }
  }

  async function downloadReceipt(expenseId, receipt) {
    try {
      const response = await fetch(`${window.OFFCAMPUS_API_URL || ''}/api/expenses/${expenseId}/receipts/${receipt.id}`, {
        headers: { Authorization: 'Bearer '.concat(state.token) }
      });
      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) signOut(false);
        throw new Error(data.error || `Receipt download failed (${response.status}).`);
      }
      const objectUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = receipt.name;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      showToast(error.message, true);
    }
  }

  async function deleteReceipt(expenseId, receipt) {
    if (!window.confirm(t('Remove receipt confirmation').replace('{name}', receipt.name))) return;
    try {
      await api(`/expenses/${expenseId}/receipts/${receipt.id}`, { method: 'DELETE' });
      await loadData();
      showToast(t('Receipt removed.'));
    } catch (error) {
      showToast(error.message, true);
    }
  }

  async function deleteExpense(id) {
    if (!window.confirm(t('Delete this expense and its roommate splits?'))) return;
    try {
      await api(`/expenses/${id}`, { method: 'DELETE' });
      if (state.editingId === id) resetExpenseForm();
      await loadData();
      showToast(t('Expense deleted.'));
    } catch (error) {
      showToast(error.message, true);
    }
  }

  async function settleSplit(debt) {
    try {
      await api(`/expenses/${debt.expenseId}/splits/${debt.splitId}`, {
        method: 'PATCH',
        body: JSON.stringify({ settled: true })
      });
      await loadData();
      showToast(t('Share marked as settled.'));
    } catch (error) {
      showToast(error.message, true);
    }
  }

  async function decideSplit(split, decision) {
    if (decision === 'reject' && !window.confirm(t('Decline this shared expense? It will not be added to your balance.'))) return;
    try {
      await api(`/expenses/${split.expenseId}/splits/${split.splitId}/decision`, {
        method: 'PATCH',
        body: JSON.stringify({ decision })
      });
      await loadData();
      showToast(t(decision === 'accept' ? 'Shared expense accepted.' : 'Shared expense declined.'));
    } catch (error) {
      showToast(error.message, true);
    }
  }

  function renderGoals(goals) {
    const list = $('#goal-list');
    list.replaceChildren();
    $('#goal-empty').hidden = goals.length > 0;
    for (const goal of goals) {
      const card = element('article', 'panel goal-card');
      const heading = element('div', 'panel-heading');
      const title = document.createElement('div');
      title.append(
        element('p', 'eyebrow', t(`${goal.period} ${goal.type === 'savings' ? 'savings goal' : 'spending budget'}`)),
        element('h2', '', goal.name)
      );
      const remove = element('button', 'mini-button danger', t('Remove'));
      remove.type = 'button';
      remove.addEventListener('click', () => deleteGoal(goal));
      heading.append(title, remove);

      const amounts = element('div', 'goal-progress-copy');
      amounts.append(
        element('strong', '', `${money(goal.progress)} / ${money(goal.targetAmount)}`),
        element('span', '', `${goal.percent}%`)
      );
      const track = element('div', 'progress-track');
      const fill = element('div', 'progress-fill');
      fill.style.setProperty('--bar-width', `${goal.percent}%`);
      track.append(fill);
      const periodNote = goal.type === 'savings'
        ? goal.remaining > 0 ? `${money(goal.remaining)}${t(' left to save this period.')}` : t('Savings target reached for this period.')
        : goal.progress > goal.targetAmount
          ? `${money(goal.progress - goal.targetAmount)}${t(' over budget for this period.')}`
          : `${money(goal.remaining)}${t(' remaining in this period’s budget.')}`;
      const note = element('p', 'field-hint goal-note', periodNote);
      card.append(heading, amounts, track, note);

      if (goal.type === 'savings') {
        const form = element('form', 'contribution-form');
        const amount = document.createElement('input');
        amount.type = 'number';
        amount.min = '0.01';
        amount.step = '0.01';
        amount.max = '10000000';
        amount.placeholder = t(state.currency === 'EUR' ? 'Contribution (€)' : 'Contribution ($)');
        amount.setAttribute('aria-label', t(state.currency === 'EUR' ? 'Savings contribution in euros' : 'Savings contribution in dollars'));
        amount.required = true;
        const contributionNote = document.createElement('input');
        contributionNote.type = 'text';
        contributionNote.maxLength = 120;
        contributionNote.placeholder = t('Optional note');
        contributionNote.setAttribute('aria-label', t('Optional contribution note'));
        const submit = element('button', 'button button-primary', t('Log savings'));
        submit.type = 'submit';
        form.append(amount, contributionNote, submit);
        form.addEventListener('submit', (event) => {
          event.preventDefault();
          addContribution(goal, amount.value, contributionNote.value);
        });
        card.append(form);
        if (goal.contributions.length > 0) {
          const history = element('div', 'contribution-list');
          for (const contribution of goal.contributions) {
            const entry = element('div', 'contribution-item');
            const detail = element('span', '', `${readableDate(contribution.date)}${contribution.note ? ` · ${contribution.note}` : ''}`);
            const value = element('strong', '', money(contribution.amount));
            const undo = element('button', 'mini-button danger', 'Remove');
            undo.type = 'button';
            undo.addEventListener('click', () => deleteContribution(goal, contribution));
            entry.append(detail, value, undo);
            history.append(entry);
          }
          card.append(history);
        }
      } else {
        card.append(element('p', 'field-hint goal-note', t('Based on expenses you entered as paid by you during this period.')));
      }
      list.append(card);
    }
  }

  async function onGoalSubmit(event) {
    event.preventDefault();
    $('#goal-error').textContent = '';
    const form = event.currentTarget;
    const payload = {
      name: $('#goal-name').value,
      type: $('#goal-type').value,
      period: $('#goal-period').value,
      targetAmount: Number($('#goal-target').value)
    };
    try {
      await api('/goals', { method: 'POST', body: JSON.stringify(payload) });
      form.reset();
      await loadData();
      showToast(t('Goal added.'));
    } catch (error) {
      $('#goal-error').textContent = error.message;
    }
  }

  async function addContribution(goal, amount, note) {
    try {
      await api(`/goals/${goal.id}/contributions`, {
        method: 'POST',
        body: JSON.stringify({ amount: Number(amount), note })
      });
      await loadData();
      showToast(t('Savings contribution recorded.'));
    } catch (error) {
      showToast(error.message, true);
    }
  }

  async function deleteContribution(goal, contribution) {
    if (!window.confirm(t('Remove this savings contribution?'))) return;
    try {
      await api(`/goals/${goal.id}/contributions/${contribution.id}`, { method: 'DELETE' });
      await loadData();
      showToast(t('Savings contribution removed.'));
    } catch (error) {
      showToast(error.message, true);
    }
  }

  async function deleteGoal(goal) {
    if (!window.confirm(t('Remove goal confirmation').replace('{name}', goal.name))) return;
    try {
      await api(`/goals/${goal.id}`, { method: 'DELETE' });
      await loadData();
      showToast(t('Goal removed.'));
    } catch (error) {
      showToast(error.message, true);
    }
  }

  async function onProfileSubmit(event) {
    event.preventDefault();
    $('#profile-error').textContent = '';
    try {
      await api('/profile', {
        method: 'PATCH',
        body: JSON.stringify({ displayName: $('#profile-display-name').value })
      });
      await loadData();
      showToast(t('Profile saved.'));
    } catch (error) {
      $('#profile-error').textContent = error.message;
    }
  }

  async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api('/profile/avatar', { method: 'PUT', body: formData });
      if (state.avatarObjectUrl) URL.revokeObjectURL(state.avatarObjectUrl);
      state.avatarObjectUrl = null;
      await loadData();
      showToast(t('Profile picture updated.'));
    } catch (error) {
      showToast(error.message, true);
    }
  }

  async function removeAvatar() {
    if (!window.confirm(t('Remove your profile picture?'))) return;
    try {
      await api('/profile/avatar', { method: 'DELETE' });
      if (state.avatarObjectUrl) URL.revokeObjectURL(state.avatarObjectUrl);
      state.avatarObjectUrl = null;
      await loadData();
      showToast(t('Profile picture removed.'));
    } catch (error) {
      showToast(error.message, true);
    }
  }

  function bindEvents() {
    $('#language-select').addEventListener('change', (event) => updateSetting('language', event.currentTarget.value));
    $('#currency-select').addEventListener('change', (event) => updateSetting('currency', event.currentTarget.value));
    $('#login-tab').addEventListener('click', () => setAuthMode('login'));
    $('#register-tab').addEventListener('click', () => setAuthMode('register'));
    $('#auth-form').addEventListener('submit', onAuthSubmit);
    $('#expense-form').addEventListener('submit', onExpenseSubmit);
    $('#goal-form').addEventListener('submit', onGoalSubmit);
    $('#profile-form').addEventListener('submit', onProfileSubmit);
    $('#profile-picture').addEventListener('change', (event) => {
      const file = event.currentTarget.files[0];
      if (file) uploadAvatar(file);
      event.currentTarget.value = '';
    });
    $('#remove-profile-picture').addEventListener('click', removeAvatar);
    $('#logout-button').addEventListener('click', () => signOut());
    $('#expense-shared').addEventListener('change', (event) => {
      $('#split-editor').hidden = !event.currentTarget.checked;
      if (event.currentTarget.checked && !document.querySelector('.split-row')) addSplitRow();
    });
    $('#add-split').addEventListener('click', () => addSplitRow());
    $('#cancel-edit').addEventListener('click', resetExpenseForm);
    for (const button of document.querySelectorAll('.nav-link')) {
      button.addEventListener('click', () => setView(button.dataset.view));
    }
    for (const button of document.querySelectorAll('[data-view-link]')) {
      button.addEventListener('click', () => setView(button.dataset.viewLink));
    }
    for (const button of document.querySelectorAll('[data-open-expenses], [data-focus-expense]')) {
      button.addEventListener('click', focusExpenseForm);
    }
  }

  captureStaticText();
  applyLanguage();
  bindEvents();
  resetExpenseForm();
  const storedUser = JSON.parse(localStorage.getItem(userKey) || 'null');
  if (state.token && storedUser) {
    state.user = storedUser;
    startApp();
  } else {
    signOut(false);
  }
})();

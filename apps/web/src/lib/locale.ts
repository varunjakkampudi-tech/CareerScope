import { useSyncExternalStore } from 'react';

export const interfaceLocales = ['en', 'te', 'hi'] as const;
export type InterfaceLocale = (typeof interfaceLocales)[number];

const localeStorageKey = 'careerscope:interface-language';

const messages = {
  en: {
    dashboard: 'Dashboard',
    jobs: 'Jobs',
    applications: 'Applications',
    saved: 'Saved',
    resume: 'Resume',
    skills: 'Skills',
    insights: 'Insights',
    aiAssistant: 'AI Assistant',
    careerResources: 'Career Resources',
    settings: 'Settings',
    preparation: 'Preparation',
    soon: 'Soon',
    unavailable: 'Not yet available in CareerScope',
    brandTagline: 'Discover · Prepare · Grow',
    motivationTitle: 'Small Steps, Big Opportunities',
    motivationBody: 'Your next chapter is closer than you think.',
    signedIn: 'Signed in',
    privateWorkspace: 'Private, single-owner workspace.',
    searchJobs: 'Search jobs in your workspace',
    switchLight: 'Switch to light theme',
    switchDark: 'Switch to dark theme',
    signOut: 'Sign out',
    confirmSignOut: 'Sign out?',
    skipContent: 'Skip to content',
    notifications: 'Notifications',
    unreadNotifications: (count: number) => `Notifications, ${count} unread`,
    reminderPrivacy:
      'Interview reminders appear here. No interview details are included in the alert.',
    loadingNotifications: 'Loading notifications…',
    notificationsError: 'Notifications could not be loaded.',
    retry: 'Retry',
    noReminders: 'No interview reminders yet.',
    upcomingInterview: 'You have an upcoming interview round.',
    openApplication: 'Open application',
    markRead: 'Mark as read',
    notificationPreferencesHeading: 'Notification preferences',
    notificationPreferencesDescription:
      'Choose whether upcoming interview reminders appear in your in-app notifications.',
    notificationPreferencesLoading: 'Loading preferences…',
    notificationPreferencesLoadError: 'Notification preferences could not be loaded',
    notificationPreferencesUnconfirmed:
      'The saved value is not confirmed. Reload it before making another change.',
    notificationPreferencesConnection: 'Check your connection and try again.',
    notificationReminderToggle: 'Show upcoming interview reminders in CareerScope',
    notificationReminderNote:
      'This affects new reminders only. Existing reminders remain in your notification list. Email and push reminders are not controlled here.',
    notificationPreferenceSaving: 'Saving notification preference…',
    notificationPreferenceSaved: 'Notification preference saved.',
    notificationPreferenceReloaded: 'Current preference reloaded from the server.',
    languageHeading: 'Interface language',
    languageLabel: 'Choose interface language',
    languageHelp:
      'This preference currently translates common workspace navigation and notification controls. Most other screens remain in English.',
    english: 'English',
    telugu: 'తెలుగు',
    hindi: 'हिन्दी',
    languageSaved: 'Language preference saved on this device.',
    languageSavedThisPage:
      'Browser storage is unavailable. This preference remains active until this page is refreshed or closed.',
    sessionExpired: 'Your session expired. Unsaved changes will be lost. Continue to sign in?',
    loadingWorkspace: 'Loading workspace…',
    workspaceUnavailable: 'Workspace unavailable',
    localServiceError: 'Could not reach the local service.',
  },
  te: {
    dashboard: 'డాష్‌బోర్డ్',
    jobs: 'ఉద్యోగాలు',
    applications: 'దరఖాస్తులు',
    saved: 'సేవ్ చేసినవి',
    resume: 'రెజ్యూమ్',
    skills: 'నైపుణ్యాలు',
    insights: 'అంతర్దృష్టులు',
    aiAssistant: 'AI సహాయకుడు',
    careerResources: 'కెరీర్ వనరులు',
    settings: 'సెట్టింగ్‌లు',
    preparation: 'సన్నాహం',
    soon: 'త్వరలో',
    unavailable: 'CareerScope‌లో ఇంకా అందుబాటులో లేదు',
    brandTagline: 'అన్వేషించండి · సిద్ధం అవ్వండి · ఎదగండి',
    motivationTitle: 'చిన్న అడుగులు, గొప్ప అవకాశాలు',
    motivationBody: 'మీ తదుపరి అధ్యాయం మీరు అనుకున్నదానికంటే దగ్గరగా ఉంది.',
    signedIn: 'సైన్ ఇన్ చేశారు',
    privateWorkspace: 'వ్యక్తిగత, ఒకే యజమాని వర్క్‌స్పేస్.',
    searchJobs: 'మీ వర్క్‌స్పేస్‌లో ఉద్యోగాలను వెతకండి',
    switchLight: 'లైట్ థీమ్‌కు మారండి',
    switchDark: 'డార్క్ థీమ్‌కు మారండి',
    signOut: 'సైన్ అవుట్',
    confirmSignOut: 'సైన్ అవుట్ చేయాలా?',
    skipContent: 'ప్రధాన కంటెంట్‌కు వెళ్లండి',
    notifications: 'నోటిఫికేషన్‌లు',
    unreadNotifications: (count: number) => `${count} చదవని నోటిఫికేషన్‌లు`,
    reminderPrivacy: 'ఇంటర్వ్యూ రిమైండర్‌లు ఇక్కడ కనిపిస్తాయి. అలర్ట్‌లో ఇంటర్వ్యూ వివరాలు ఉండవు.',
    loadingNotifications: 'నోటిఫికేషన్‌లు లోడ్ అవుతున్నాయి…',
    notificationsError: 'నోటిఫికేషన్‌లను లోడ్ చేయలేకపోయాం.',
    retry: 'మళ్లీ ప్రయత్నించండి',
    noReminders: 'ఇంకా ఇంటర్వ్యూ రిమైండర్‌లు లేవు.',
    upcomingInterview: 'మీకు రాబోయే ఇంటర్వ్యూ రౌండ్ ఉంది.',
    openApplication: 'దరఖాస్తును తెరవండి',
    markRead: 'చదివినట్లు గుర్తించండి',
    notificationPreferencesHeading: 'నోటిఫికేషన్ ప్రాధాన్యతలు',
    notificationPreferencesDescription:
      'రాబోయే ఇంటర్వ్యూ రిమైండర్‌లు మీ యాప్‌లోని నోటిఫికేషన్‌లలో కనిపించాలా ఎంచుకోండి.',
    notificationPreferencesLoading: 'ప్రాధాన్యతలు లోడ్ అవుతున్నాయి…',
    notificationPreferencesLoadError: 'నోటిఫికేషన్ ప్రాధాన్యతలను లోడ్ చేయలేకపోయాం',
    notificationPreferencesUnconfirmed:
      'సేవ్ చేసిన విలువను నిర్ధారించలేకపోయాం. మరో మార్పు చేసే ముందు దాన్ని మళ్లీ లోడ్ చేయండి.',
    notificationPreferencesConnection: 'మీ కనెక్షన్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.',
    notificationReminderToggle: 'CareerScope‌లో రాబోయే ఇంటర్వ్యూ రిమైండర్‌లను చూపించండి',
    notificationReminderNote:
      'ఇది కొత్త రిమైండర్‌లకే వర్తిస్తుంది. ఇప్పటికే ఉన్న రిమైండర్‌లు మీ నోటిఫికేషన్‌ల జాబితాలో ఉంటాయి. ఇక్కడి సెట్టింగ్ ఇమెయిల్ లేదా పుష్ రిమైండర్‌లను నియంత్రించదు.',
    notificationPreferenceSaving: 'నోటిఫికేషన్ ప్రాధాన్యతను సేవ్ చేస్తోంది…',
    notificationPreferenceSaved: 'నోటిఫికేషన్ ప్రాధాన్యత సేవ్ అయింది.',
    notificationPreferenceReloaded: 'ప్రస్తుత ప్రాధాన్యత సర్వర్ నుంచి మళ్లీ లోడ్ చేయబడింది.',
    languageHeading: 'ఇంటర్‌ఫేస్ భాష',
    languageLabel: 'ఇంటర్‌ఫేస్ భాషను ఎంచుకోండి',
    languageHelp:
      'ఈ ప్రాధాన్యత ప్రస్తుతం సాధారణ వర్క్‌స్పేస్ నావిగేషన్ మరియు నోటిఫికేషన్ నియంత్రణలను మాత్రమే అనువదిస్తుంది. చాలా ఇతర స్క్రీన్‌లు ఇంకా ఆంగ్లంలో ఉంటాయి.',
    english: 'English',
    telugu: 'తెలుగు',
    hindi: 'हिन्दी',
    languageSaved: 'భాషా ప్రాధాన్యత ఈ పరికరంలో సేవ్ చేయబడింది.',
    languageSavedThisPage:
      'బ్రౌజర్ నిల్వ అందుబాటులో లేదు. ఈ పేజీని రిఫ్రెష్ చేసే వరకు లేదా మూసే వరకు ఈ ప్రాధాన్యత అమల్లో ఉంటుంది.',
    sessionExpired: 'మీ సెషన్ ముగిసింది. సేవ్ చేయని మార్పులు పోతాయి. సైన్ ఇన్‌కు వెళ్లాలా?',
    loadingWorkspace: 'వర్క్‌స్పేస్ లోడ్ అవుతోంది…',
    workspaceUnavailable: 'వర్క్‌స్పేస్ అందుబాటులో లేదు',
    localServiceError: 'స్థానిక సేవను చేరుకోలేకపోయాం.',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    jobs: 'नौकरियाँ',
    applications: 'आवेदन',
    saved: 'सहेजे गए',
    resume: 'रिज़्यूमे',
    skills: 'कौशल',
    insights: 'जानकारियाँ',
    aiAssistant: 'AI सहायक',
    careerResources: 'करियर संसाधन',
    settings: 'सेटिंग्स',
    preparation: 'तैयारी',
    soon: 'जल्द',
    unavailable: 'CareerScope में अभी उपलब्ध नहीं है',
    brandTagline: 'खोजें · तैयारी करें · आगे बढ़ें',
    motivationTitle: 'छोटे कदम, बड़े अवसर',
    motivationBody: 'आपका अगला अध्याय आपकी सोच से अधिक करीब है।',
    signedIn: 'साइन इन है',
    privateWorkspace: 'निजी, एकल-मालिक कार्यक्षेत्र।',
    searchJobs: 'अपने कार्यक्षेत्र में नौकरियाँ खोजें',
    switchLight: 'लाइट थीम पर जाएँ',
    switchDark: 'डार्क थीम पर जाएँ',
    signOut: 'साइन आउट',
    confirmSignOut: 'साइन आउट करें?',
    skipContent: 'मुख्य सामग्री पर जाएँ',
    notifications: 'सूचनाएँ',
    unreadNotifications: (count: number) => `${count} अपठित सूचनाएँ`,
    reminderPrivacy:
      'इंटरव्यू रिमाइंडर यहाँ दिखाई देते हैं। सूचना में इंटरव्यू का विवरण शामिल नहीं होता।',
    loadingNotifications: 'सूचनाएँ लोड हो रही हैं…',
    notificationsError: 'सूचनाएँ लोड नहीं हो सकीं।',
    retry: 'फिर कोशिश करें',
    noReminders: 'अभी कोई इंटरव्यू रिमाइंडर नहीं है।',
    upcomingInterview: 'आपका एक इंटरव्यू राउंड आने वाला है।',
    openApplication: 'आवेदन खोलें',
    markRead: 'पढ़ा हुआ चिह्नित करें',
    notificationPreferencesHeading: 'सूचना प्राथमिकताएँ',
    notificationPreferencesDescription:
      'चुनें कि आने वाले इंटरव्यू रिमाइंडर ऐप की सूचनाओं में दिखाई दें या नहीं।',
    notificationPreferencesLoading: 'प्राथमिकताएँ लोड हो रही हैं…',
    notificationPreferencesLoadError: 'सूचना प्राथमिकताएँ लोड नहीं हो सकीं',
    notificationPreferencesUnconfirmed:
      'सहेजे गए मान की पुष्टि नहीं हुई है। कोई और बदलाव करने से पहले इसे फिर से लोड करें।',
    notificationPreferencesConnection: 'अपना कनेक्शन जाँचें और फिर कोशिश करें।',
    notificationReminderToggle: 'CareerScope में आने वाले इंटरव्यू रिमाइंडर दिखाएँ',
    notificationReminderNote:
      'यह केवल नए रिमाइंडर पर लागू होता है। मौजूदा रिमाइंडर आपकी सूचना सूची में रहेंगे। यह सेटिंग ईमेल या पुश रिमाइंडर नियंत्रित नहीं करती।',
    notificationPreferenceSaving: 'सूचना प्राथमिकता सहेजी जा रही है…',
    notificationPreferenceSaved: 'सूचना प्राथमिकता सहेजी गई।',
    notificationPreferenceReloaded: 'वर्तमान प्राथमिकता सर्वर से फिर लोड की गई।',
    languageHeading: 'इंटरफ़ेस भाषा',
    languageLabel: 'इंटरफ़ेस भाषा चुनें',
    languageHelp:
      'यह प्राथमिकता अभी सामान्य कार्यक्षेत्र नेविगेशन और सूचना नियंत्रणों का अनुवाद करती है। अधिकांश अन्य स्क्रीन अभी अंग्रेज़ी में हैं।',
    english: 'English',
    telugu: 'తెలుగు',
    hindi: 'हिन्दी',
    languageSaved: 'भाषा प्राथमिकता इस डिवाइस पर सहेजी गई।',
    languageSavedThisPage:
      'ब्राउज़र संग्रहण उपलब्ध नहीं है। यह प्राथमिकता इस पृष्ठ को रीफ़्रेश या बंद करने तक सक्रिय रहेगी।',
    sessionExpired: 'आपका सत्र समाप्त हो गया। सहेजे नहीं गए बदलाव खो जाएँगे। साइन इन पर जाएँ?',
    loadingWorkspace: 'कार्यस्थान लोड हो रहा है…',
    workspaceUnavailable: 'कार्यस्थान उपलब्ध नहीं है',
    localServiceError: 'स्थानीय सेवा से संपर्क नहीं हो सका।',
  },
} as const;

export type InterfaceMessage = keyof typeof messages.en;

export function isInterfaceLocale(value: unknown): value is InterfaceLocale {
  return typeof value === 'string' && (interfaceLocales as readonly string[]).includes(value);
}

export function interfaceMessage(
  locale: InterfaceLocale,
  key: InterfaceMessage,
): string | ((count: number) => string) {
  return messages[locale][key];
}

export function localizedText(locale: InterfaceLocale, key: InterfaceMessage, count = 0): string {
  const message = interfaceMessage(locale, key);
  return typeof message === 'string' ? message : message(count);
}

const localeListeners = new Set<() => void>();
let fallbackLocale: InterfaceLocale = 'en';
let pageLocaleOverride: InterfaceLocale | undefined;

function readInterfaceLocale(): InterfaceLocale {
  if (pageLocaleOverride) return pageLocaleOverride;
  try {
    const stored = window.localStorage.getItem(localeStorageKey);
    return isInterfaceLocale(stored) ? stored : fallbackLocale;
  } catch {
    return fallbackLocale;
  }
}

function subscribeInterfaceLocale(listener: () => void) {
  localeListeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === localeStorageKey || event.key === null) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    localeListeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function setInterfaceLocale(locale: InterfaceLocale): boolean {
  fallbackLocale = locale;
  try {
    window.localStorage.setItem(localeStorageKey, locale);
    pageLocaleOverride = undefined;
    for (const listener of localeListeners) listener();
    return true;
  } catch {
    // Keep the selection available for the current page when browser storage is disabled.
    pageLocaleOverride = locale;
    for (const listener of localeListeners) listener();
    return false;
  }
}

export function useInterfaceLocale(): InterfaceLocale {
  return useSyncExternalStore(subscribeInterfaceLocale, readInterfaceLocale, () => 'en');
}

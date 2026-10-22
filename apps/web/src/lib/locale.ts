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
    accountSecurity: 'Account security',
    backToSearch: 'Back to search',
    emailVerifiedOn: 'Email verified on {value}.',
    emailVerificationNotRecorded: 'Email verification is not recorded.',
    changeSignInEmail: 'Change sign-in email',
    currentEmail: 'Current email',
    notAvailable: 'Not available',
    newEmailAddress: 'New email address',
    sendingVerificationCodes: 'Sending verification codes…',
    sendVerificationCodes: 'Send verification codes',
    enterBothEmailCodes:
      'Enter each six-digit code. Both addresses must be verified before the change takes effect.',
    codeSentToCurrentEmail: 'Code sent to current email',
    currentEmailVerified: 'Current email verified',
    verifyCurrentEmail: 'Verify current email',
    codeSentToNewEmail: 'Code sent to new email',
    newEmailVerified: 'New email verified',
    verifyNewEmail: 'Verify new email',
    emailChangeCodesSent: 'Codes were sent to your current and new email addresses.',
    emailAddressUpdated:
      'Email address updated. The previous address received a verification notice.',
    currentAddressVerified: 'Current address verified. Now verify the new address.',
    newAddressVerified: 'New address verified. Now verify the current address.',
    sessionSignOutAllConfirm: 'Sign out all other sessions? This session will stay signed in.',
    otherSessionsSignedOut: 'Other sessions signed out. This session remains signed in.',
    signOutDeviceConfirm: 'Sign out {value}? That device will need to sign in again.',
    signOutDeviceLabel: 'Sign out {value}',
    deviceSignedOut: '{value} signed out.',
    pleaseTryAgain: 'Please try again.',
    pleaseTryConnection: 'Please try again when your connection is available.',
    apiError400: 'Check the information and try again.',
    apiError401:
      'The session or verification is no longer valid. Sign in again or request a new code.',
    apiError403: 'This action is not permitted.',
    apiError404: 'This account-security option is unavailable.',
    apiError409: 'This information changed or could not be updated. Refresh and try again.',
    apiError413: 'The submitted information is too large.',
    apiError429: 'Too many requests. Try again shortly.',
    apiError503: 'The service is temporarily unavailable. Please try again shortly.',
    apiError507: 'Resume storage is full. Remove an unneeded completed resume or try again later.',
    apiErrorDefault: 'Request failed. Please try again.',
    passwordsDoNotMatch: 'Passwords do not match.',
    chooseDifferentPassword: 'Choose a different password.',
    changePasswordSignOutConfirm: 'Change password and sign out all sessions?',
    couldNotChangePassword: 'Could not change your password.',
    accountSecurityBack: 'Back to search',
    emailVerificationUnrecorded: 'Email verification is not recorded.',
    emailChangeUnavailable: 'Change sign-in email',
    emailCodesSending: 'Sending verification codes…',
    emailCodesSend: 'Send verification codes',
    sessionSignOutOthersConfirm: 'Sign out all other sessions? This session will stay signed in.',
    signOutOthersLoading: 'Signing out other sessions',
    signOutOthers: 'Sign out other sessions',
    activeSessions: 'Active sessions',
    activeSessionsLoading: 'Loading active sessions…',
    couldNotLoadSessions: 'Could not load active sessions.',
    tryConnectionAgain: 'Try again when your connection is available.',
    retrying: 'Retrying…',
    noSessions: 'No active sessions are available to show.',
    activeDevicesLabel: 'Active devices and sessions',
    thisDevice: 'This device',
    started: 'Started',
    lastRefreshed: 'Last refreshed',
    signingOut: 'Signing out…',
    signOutThisDevice: 'Sign out this device',
    couldNotSignOutSessions: 'Could not sign out other sessions.',
    optionalProductUpdates: 'Optional product updates',
    loadingMarketingPreference: 'Loading marketing preference…',
    couldNotLoadMarketing: 'Could not load your marketing preference.',
    optedInProductUpdates: 'You opted in to optional product updates{value}.',
    versionInParentheses: ' under version {value}',
    notOptedInProductUpdates: 'You are not opted in to optional product updates.',
    couldNotUpdateMarketing: 'Could not update your marketing preference.',
    savingPreference: 'Saving preference…',
    withdrawMarketingConsent: 'Withdraw marketing consent',
    optInProductUpdates: 'Opt in to product updates',
    testAccountsNoPasswords:
      'Test accounts do not use application passwords. Hosted access is protected by the staging proxy.',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmNewPassword: 'Confirm new password',
    changingPassword: 'Changing password',
    changePassword: 'Change password',
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
    accountSecurity: 'ఖాతా భద్రత',
    backToSearch: 'శోధనకు తిరిగి వెళ్ళండి',
    emailVerifiedOn: `${'{value}'}న ఇమెయిల్ ధృవీకరించబడింది.`,
    emailVerificationNotRecorded: 'ఇమెయిల్ ధృవీకరణ నమోదు కాలేదు.',
    changeSignInEmail: 'సైన్-ఇన్ ఇమెయిల్ మార్చండి',
    currentEmail: 'ప్రస్తుత ఇమెయిల్',
    notAvailable: 'అందుబాటులో లేదు',
    newEmailAddress: 'కొత్త ఇమెయిల్ చిరునామా',
    sendingVerificationCodes: 'ధృవీకరణ కోడ్‌లను పంపుతోంది…',
    sendVerificationCodes: 'ధృవీకరణ కోడ్‌లను పంపండి',
    enterBothEmailCodes:
      'ఆరు అంకెల రెండు కోడ్‌లను నమోదు చేయండి. మార్పు అమలుకు రెండు చిరునామాలూ ధృవీకరించాలి.',
    codeSentToCurrentEmail: 'ప్రస్తుత ఇమెయిల్‌కు పంపిన కోడ్',
    currentEmailVerified: 'ప్రస్తుత ఇమెయిల్ ధృవీకరించబడింది',
    verifyCurrentEmail: 'ప్రస్తుత ఇమెయిల్ ధృవీకరించండి',
    codeSentToNewEmail: 'కొత్త ఇమెయిల్‌కు పంపిన కోడ్',
    newEmailVerified: 'కొత్త ఇమెయిల్ ధృవీకరించబడింది',
    verifyNewEmail: 'కొత్త ఇమెయిల్ ధృవీకరించండి',
    emailChangeCodesSent: 'మీ ప్రస్తుత మరియు కొత్త ఇమెయిల్ చిరునామాలకు కోడ్‌లు పంపబడ్డాయి.',
    emailAddressUpdated:
      'ఇమెయిల్ చిరునామా నవీకరించబడింది. పాత చిరునామాకు ధృవీకరణ సమాచారం పంపబడింది.',
    currentAddressVerified:
      'ప్రస్తుత చిరునామా ధృవీకరించబడింది. ఇప్పుడు కొత్త చిరునామాను ధృవీకరించండి.',
    newAddressVerified: 'కొత్త చిరునామా ధృవీకరించబడింది. ఇప్పుడు ప్రస్తుత చిరునామాను ధృవీకరించండి.',
    sessionSignOutAllConfirm:
      'ఇతర అన్ని సెషన్‌ల నుంచి సైన్ అవుట్ చేయాలా? ఈ సెషన్‌లో మీరు సైన్ ఇన్‌లోనే ఉంటారు.',
    otherSessionsSignedOut: 'ఇతర సెషన్‌ల నుంచి సైన్ అవుట్ అయ్యారు. ఈ సెషన్ కొనసాగుతుంది.',
    signOutDeviceConfirm: '{value} నుంచి సైన్ అవుట్ చేయాలా? ఆ పరికరం మళ్లీ సైన్ ఇన్ చేయాలి.',
    signOutDeviceLabel: '{value} నుంచి సైన్ అవుట్ చేయండి',
    deviceSignedOut: '{value} నుంచి సైన్ అవుట్ అయ్యారు.',
    pleaseTryAgain: 'దయచేసి మళ్లీ ప్రయత్నించండి.',
    pleaseTryConnection: 'మీ కనెక్షన్ అందుబాటులో ఉన్నప్పుడు మళ్లీ ప్రయత్నించండి.',
    apiError400: 'వివరాలను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.',
    apiError401: 'సెషన్ లేదా ధృవీకరణ చెల్లదు. మళ్లీ సైన్ ఇన్ చేయండి లేదా కొత్త కోడ్ అడగండి.',
    apiError403: 'ఈ చర్యకు అనుమతి లేదు.',
    apiError404: 'ఈ ఖాతా-భద్రత ఎంపిక అందుబాటులో లేదు.',
    apiError409: 'ఈ సమాచారం మారింది లేదా నవీకరించలేకపోయాం. రిఫ్రెష్ చేసి మళ్లీ ప్రయత్నించండి.',
    apiError413: 'సమర్పించిన సమాచారం చాలా పెద్దది.',
    apiError429: 'చాలా ప్రయత్నాలు జరిగాయి. కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.',
    apiError503: 'సేవ తాత్కాలికంగా అందుబాటులో లేదు. కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.',
    apiError507:
      'రెజ్యూమ్ నిల్వ నిండింది. అనవసరమైన పూర్తయిన రెజ్యూమ్‌ను తొలగించండి లేదా తర్వాత మళ్లీ ప్రయత్నించండి.',
    apiErrorDefault: 'అభ్యర్థనను పూర్తి చేయలేకపోయాం. మళ్లీ ప్రయత్నించండి.',
    passwordsDoNotMatch: 'పాస్‌వర్డ్‌లు సరిపోలడం లేదు.',
    chooseDifferentPassword: 'వేరే పాస్‌వర్డ్ ఎంచుకోండి.',
    changePasswordSignOutConfirm: 'పాస్‌వర్డ్ మార్చి అన్ని సెషన్‌ల నుంచి సైన్ అవుట్ చేయాలా?',
    couldNotChangePassword: 'మీ పాస్‌వర్డ్‌ను మార్చలేకపోయాం.',
    accountSecurityBack: 'శోధనకు తిరిగి వెళ్ళండి',
    emailVerificationUnrecorded: 'ఇమెయిల్ ధృవీకరణ నమోదు కాలేదు.',
    emailChangeUnavailable: 'సైన్-ఇన్ ఇమెయిల్ మార్చండి',
    emailCodesSending: 'ధృవీకరణ కోడ్‌లను పంపుతోంది…',
    emailCodesSend: 'ధృవీకరణ కోడ్‌లను పంపండి',
    sessionSignOutOthersConfirm:
      'ఇతర అన్ని సెషన్‌ల నుంచి సైన్ అవుట్ చేయాలా? ఈ సెషన్‌లో మీరు సైన్ ఇన్‌లోనే ఉంటారు.',
    signOutOthersLoading: 'ఇతర సెషన్‌ల నుంచి సైన్ అవుట్ చేస్తోంది',
    signOutOthers: 'ఇతర సెషన్‌ల నుంచి సైన్ అవుట్ చేయండి',
    activeSessions: 'క్రియాశీల సెషన్‌లు',
    activeSessionsLoading: 'క్రియాశీల సెషన్‌లను లోడ్ చేస్తోంది…',
    couldNotLoadSessions: 'క్రియాశీల సెషన్‌లను లోడ్ చేయలేకపోయాం.',
    tryConnectionAgain: 'మీ కనెక్షన్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.',
    retrying: 'మళ్లీ ప్రయత్నిస్తోంది…',
    noSessions: 'చూపించడానికి క్రియాశీల సెషన్‌లు లేవు.',
    activeDevicesLabel: 'క్రియాశీల పరికరాలు మరియు సెషన్‌లు',
    thisDevice: 'ఈ పరికరం',
    started: 'ప్రారంభం',
    lastRefreshed: 'చివరిగా నవీకరించబడింది',
    signingOut: 'సైన్ అవుట్ చేస్తోంది…',
    signOutThisDevice: 'ఈ పరికరం నుంచి సైన్ అవుట్ చేయండి',
    couldNotSignOutSessions: 'ఇతర సెషన్‌ల నుంచి సైన్ అవుట్ చేయలేకపోయాం.',
    optionalProductUpdates: 'ఐచ్ఛిక ఉత్పత్తి నవీకరణలు',
    loadingMarketingPreference: 'మార్కెటింగ్ ప్రాధాన్యతను లోడ్ చేస్తోంది…',
    couldNotLoadMarketing: 'మీ మార్కెటింగ్ ప్రాధాన్యతను లోడ్ చేయలేకపోయాం.',
    optedInProductUpdates: 'మీరు ఐచ్ఛిక ఉత్పత్తి నవీకరణలకు అంగీకరించారు{value}.',
    versionInParentheses: ' (వెర్షన్ {value})',
    notOptedInProductUpdates: 'మీరు ఐచ్ఛిక ఉత్పత్తి నవీకరణలకు అంగీకరించలేదు.',
    couldNotUpdateMarketing: 'మీ మార్కెటింగ్ ప్రాధాన్యతను నవీకరించలేకపోయాం.',
    savingPreference: 'ప్రాధాన్యతను సేవ్ చేస్తోంది…',
    withdrawMarketingConsent: 'మార్కెటింగ్ అంగీకారాన్ని ఉపసంహరించండి',
    optInProductUpdates: 'ఉత్పత్తి నవీకరణలకు అంగీకరించండి',
    testAccountsNoPasswords:
      'పరీక్ష ఖాతాలు అప్లికేషన్ పాస్‌వర్డ్‌లను ఉపయోగించవు. హోస్ట్ చేసిన యాక్సెస్ స్టేజింగ్ ప్రాక్సీ ద్వారా రక్షించబడుతుంది.',
    currentPassword: 'ప్రస్తుత పాస్‌వర్డ్',
    newPassword: 'కొత్త పాస్‌వర్డ్',
    confirmNewPassword: 'కొత్త పాస్‌వర్డ్‌ను నిర్ధారించండి',
    changingPassword: 'పాస్‌వర్డ్‌ను మారుస్తోంది',
    changePassword: 'పాస్‌వర్డ్ మార్చండి',
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
    accountSecurity: 'खाता सुरक्षा',
    backToSearch: 'खोज पर वापस जाएँ',
    emailVerifiedOn: '{value} को ईमेल सत्यापित हुआ।',
    emailVerificationNotRecorded: 'ईमेल सत्यापन दर्ज नहीं है।',
    changeSignInEmail: 'साइन-इन ईमेल बदलें',
    currentEmail: 'वर्तमान ईमेल',
    notAvailable: 'उपलब्ध नहीं',
    newEmailAddress: 'नया ईमेल पता',
    sendingVerificationCodes: 'सत्यापन कोड भेजे जा रहे हैं…',
    sendVerificationCodes: 'सत्यापन कोड भेजें',
    enterBothEmailCodes:
      'दोनों छह-अंकीय कोड दर्ज करें। बदलाव लागू होने से पहले दोनों पतों का सत्यापन आवश्यक है।',
    codeSentToCurrentEmail: 'वर्तमान ईमेल पर भेजा गया कोड',
    currentEmailVerified: 'वर्तमान ईमेल सत्यापित',
    verifyCurrentEmail: 'वर्तमान ईमेल सत्यापित करें',
    codeSentToNewEmail: 'नए ईमेल पर भेजा गया कोड',
    newEmailVerified: 'नया ईमेल सत्यापित',
    verifyNewEmail: 'नया ईमेल सत्यापित करें',
    emailChangeCodesSent: 'आपके वर्तमान और नए ईमेल पतों पर कोड भेजे गए।',
    emailAddressUpdated: 'ईमेल पता अपडेट हुआ। पिछले पते पर सत्यापन सूचना भेजी गई।',
    currentAddressVerified: 'वर्तमान पता सत्यापित है। अब नए पते का सत्यापन करें।',
    newAddressVerified: 'नया पता सत्यापित है। अब वर्तमान पते का सत्यापन करें।',
    sessionSignOutAllConfirm: 'क्या अन्य सभी सत्रों से साइन आउट करें? यह सत्र चालू रहेगा।',
    otherSessionsSignedOut: 'अन्य सत्रों से साइन आउट हो गया। यह सत्र चालू रहेगा।',
    signOutDeviceConfirm: 'क्या {value} से साइन आउट करें? उस डिवाइस पर फिर से साइन इन करना होगा।',
    signOutDeviceLabel: '{value} से साइन आउट करें',
    deviceSignedOut: '{value} से साइन आउट हो गया।',
    pleaseTryAgain: 'कृपया फिर कोशिश करें।',
    pleaseTryConnection: 'कनेक्शन उपलब्ध होने पर फिर कोशिश करें।',
    apiError400: 'जानकारी जाँचें और फिर कोशिश करें।',
    apiError401: 'सत्र या सत्यापन अब मान्य नहीं है। फिर साइन इन करें या नया कोड माँगें।',
    apiError403: 'इस कार्रवाई की अनुमति नहीं है।',
    apiError404: 'खाता-सुरक्षा का यह विकल्प उपलब्ध नहीं है।',
    apiError409: 'यह जानकारी बदल गई या अपडेट नहीं हो सकी। रीफ़्रेश करके फिर कोशिश करें।',
    apiError413: 'दी गई जानकारी बहुत बड़ी है।',
    apiError429: 'बहुत अधिक प्रयास हुए। थोड़ी देर बाद फिर कोशिश करें।',
    apiError503: 'सेवा अस्थायी रूप से उपलब्ध नहीं है। थोड़ी देर बाद फिर कोशिश करें।',
    apiError507:
      'रिज़्यूमे स्टोरेज भर गया है। कोई अनावश्यक पूरा रिज़्यूमे हटाएँ या बाद में कोशिश करें।',
    apiErrorDefault: 'अनुरोध पूरा नहीं हो सका। फिर कोशिश करें।',
    passwordsDoNotMatch: 'पासवर्ड मेल नहीं खाते।',
    chooseDifferentPassword: 'कोई अलग पासवर्ड चुनें।',
    changePasswordSignOutConfirm: 'पासवर्ड बदलकर सभी सत्रों से साइन आउट करें?',
    couldNotChangePassword: 'आपका पासवर्ड नहीं बदला जा सका।',
    accountSecurityBack: 'खोज पर वापस जाएँ',
    emailVerificationUnrecorded: 'ईमेल सत्यापन दर्ज नहीं है।',
    emailChangeUnavailable: 'साइन-इन ईमेल बदलें',
    emailCodesSending: 'सत्यापन कोड भेजे जा रहे हैं…',
    emailCodesSend: 'सत्यापन कोड भेजें',
    sessionSignOutOthersConfirm: 'क्या अन्य सभी सत्रों से साइन आउट करें? यह सत्र चालू रहेगा।',
    signOutOthersLoading: 'अन्य सत्रों से साइन आउट हो रहा है',
    signOutOthers: 'अन्य सत्रों से साइन आउट करें',
    activeSessions: 'सक्रिय सत्र',
    activeSessionsLoading: 'सक्रिय सत्र लोड हो रहे हैं…',
    couldNotLoadSessions: 'सक्रिय सत्र लोड नहीं हो सके।',
    tryConnectionAgain: 'कनेक्शन जाँचकर फिर कोशिश करें।',
    retrying: 'फिर कोशिश हो रही है…',
    noSessions: 'दिखाने के लिए कोई सक्रिय सत्र उपलब्ध नहीं है।',
    activeDevicesLabel: 'सक्रिय डिवाइस और सत्र',
    thisDevice: 'यह डिवाइस',
    started: 'शुरू हुआ',
    lastRefreshed: 'अंतिम बार अपडेट',
    signingOut: 'साइन आउट हो रहा है…',
    signOutThisDevice: 'इस डिवाइस से साइन आउट करें',
    couldNotSignOutSessions: 'अन्य सत्रों से साइन आउट नहीं हो सका।',
    optionalProductUpdates: 'वैकल्पिक उत्पाद अपडेट',
    loadingMarketingPreference: 'मार्केटिंग प्राथमिकता लोड हो रही है…',
    couldNotLoadMarketing: 'आपकी मार्केटिंग प्राथमिकता लोड नहीं हो सकी।',
    optedInProductUpdates: 'आपने वैकल्पिक उत्पाद अपडेट के लिए सहमति दी{value}।',
    versionInParentheses: ' (संस्करण {value})',
    notOptedInProductUpdates: 'आपने वैकल्पिक उत्पाद अपडेट के लिए सहमति नहीं दी है।',
    couldNotUpdateMarketing: 'आपकी मार्केटिंग प्राथमिकता अपडेट नहीं हो सकी।',
    savingPreference: 'प्राथमिकता सहेजी जा रही है…',
    withdrawMarketingConsent: 'मार्केटिंग सहमति वापस लें',
    optInProductUpdates: 'उत्पाद अपडेट के लिए सहमति दें',
    testAccountsNoPasswords:
      'परीक्षण खाते एप्लिकेशन पासवर्ड का उपयोग नहीं करते। होस्टेड पहुँच स्टेजिंग प्रॉक्सी से सुरक्षित है।',
    currentPassword: 'वर्तमान पासवर्ड',
    newPassword: 'नया पासवर्ड',
    confirmNewPassword: 'नए पासवर्ड की पुष्टि करें',
    changingPassword: 'पासवर्ड बदला जा रहा है',
    changePassword: 'पासवर्ड बदलें',
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

export function localizedValue(
  locale: InterfaceLocale,
  key: InterfaceMessage,
  value: string | number,
): string {
  return localizedText(locale, key).replace('{value}', String(value));
}

export function localizedApiErrorMessage(locale: InterfaceLocale, status: number): string {
  const keyByStatus: Partial<Record<number, InterfaceMessage>> = {
    400: 'apiError400',
    401: 'apiError401',
    403: 'apiError403',
    404: 'apiError404',
    409: 'apiError409',
    413: 'apiError413',
    429: 'apiError429',
    503: 'apiError503',
    507: 'apiError507',
  };
  return localizedText(locale, keyByStatus[status] ?? 'apiErrorDefault');
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

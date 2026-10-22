import assert from 'node:assert/strict';
import test from 'node:test';
import { interfaceMessage, interfaceLocales, isInterfaceLocale, localizedText } from './locale.js';

test('interface locale validation accepts only the three approved languages', () => {
  assert.deepEqual(interfaceLocales, ['en', 'te', 'hi']);
  for (const locale of interfaceLocales) assert.equal(isInterfaceLocale(locale), true);
  for (const value of [undefined, null, '', 'fr', 'EN', 1, {}])
    assert.equal(isInterfaceLocale(value), false);
});

test('shared navigation and reminder messages are present for each supported language', () => {
  for (const locale of interfaceLocales) {
    assert.ok(localizedText(locale, 'jobs').length > 0);
    assert.ok(localizedText(locale, 'notifications').length > 0);
    assert.ok(localizedText(locale, 'reminderPrivacy').length > 0);
    const unread = interfaceMessage(locale, 'unreadNotifications');
    assert.equal(typeof unread, 'function');
    assert.ok(localizedText(locale, 'unreadNotifications', 2).includes('2'));
  }
  assert.notEqual(localizedText('en', 'jobs'), localizedText('te', 'jobs'));
  assert.notEqual(localizedText('en', 'jobs'), localizedText('hi', 'jobs'));
});

test('interview notification preference labels and safety notes are localized for each language', () => {
  const keys = [
    'notificationPreferencesHeading',
    'notificationPreferencesDescription',
    'notificationPreferencesLoading',
    'notificationPreferencesLoadError',
    'notificationPreferencesUnconfirmed',
    'notificationPreferencesConnection',
    'notificationReminderToggle',
    'notificationReminderNote',
    'notificationPreferenceSaving',
    'notificationPreferenceSaved',
    'notificationPreferenceReloaded',
    'retry',
  ] as const;

  for (const key of keys) {
    const translated = interfaceLocales.map((locale) => localizedText(locale, key));
    assert.ok(
      translated.every((message) => message.trim().length > 0),
      key,
    );
    assert.equal(new Set(translated).size, interfaceLocales.length, key);
  }
});

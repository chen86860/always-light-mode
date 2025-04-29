/**
 * Gets a localized message
 * @param messageName The name of the message in the messages.json file
 * @param substitutions Optional substitutions for placeholders in the message
 * @returns The localized message
 */
export const getMessage = (
  messageName: keyof typeof browser.i18n.getMessage,
  substitutions?: string | string[],
): string => {
  return browser.i18n.getMessage(messageName, substitutions);
};

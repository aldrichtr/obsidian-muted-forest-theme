

/** @type {import('stylelint').Config} */
export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-obsidianmd'
  ],
  rules: {
    "no-irregular-whitespace": true,
    "color-named": "never",
    "custom-property-empty-line-before": "never"
  }
};

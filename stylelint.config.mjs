/** @type {import('stylelint').Config} */
export default {
  cache: true,
  /* directives are `style-disable`/`style-enable`, etc */
  configurationComment: "style",
  ignoreFiles: [
    'original-theme.css'
  ],
  extends: [
    'stylelint-config-standard',
    'stylelint-config-obsidianmd',
    'stylelint-config-clean-order'
  ],
  rules: {
    "no-irregular-whitespace": true,
    "comment-empty-line-before": [
      "always",
      { ignore: ["after-comment", "stylelint-commands"],
        ignoreComments: ['/@settings/', '/!SECTION/']
      }
    ],
    "color-named": "never",
    "color-function-notation": "modern",
    "custom-property-empty-line-before": [
      "always",
      { ignore: ["after-custom-property", "after-comment"] }
    ]
  }
};

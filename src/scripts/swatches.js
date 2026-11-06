/**
 *
 * @param {string} filesMap - an array of filenames in the styles directory
 */
function initThemeExplorer(filesMap) {
  const selector = document.getElementById('theme-selector');
  const linkTag = document.getElementById('dynamic-theme-link');

  // Populate the dropdown menu dynamically
  for (const [key, value] of filesMap) {
    const option = document.createElement('option');
    option.value = `styles/${key}.css`;
    option.textContent = `${value} (${key})`;
    selector.appendChild(option);
  };

  // Handle dropdown selection change
  selector.addEventListener('change', (e) => {
    const selectedPath = e.target.value;
    linkTag.href = selectedPath;

    // Give browser rules rendering thread time to buffer the layout network pipeline
    setTimeout(() => {
      generateSwatchesFromCSS(selectedPath);
    }, 150);
  });

  generateSwatchesFromCSS(selector.value);
}

async function generateSwatchesFromCSS(filePath) {
  const grid = document.getElementById('swatch-grid');
  grid.innerHTML = '';

  const stylesheet = Array.from(document.styleSheets).find(sheet =>
    sheet.href && sheet.href.includes(filePath)
  );

  if (!stylesheet) {
    console.error(`Could not read stylesheet rules from: ${filePath}`);
    return;
  }

  // Create a persistent mock element to hold the entire token rule tree
  const resolverContext = document.createElement('div');
  document.body.appendChild(resolverContext);

  try {
    const rules = stylesheet.cssRules || stylesheet.rules;
    const variableList = [];

    // PASS 1: Harvest property token references and seed them onto our mock container node
    for (const rule of rules) {
      if (rule.style) {
        for (const property of rule.style) {
          if (property.startsWith('--')) {
            const rawValue = rule.style.getPropertyValue(property).trim();
            resolverContext.style.setProperty(property, rawValue);
            variableList.push({ name: property, raw: rawValue });
          }
        }
      }
    }

    // PASS 2: Safely calculate final absolute RGB targets now that the DOM can cross-reference everything
    for (const token of variableList) {
      // Ask the browser to evaluate the variable chain down to its final computed color string
      const computedRgb = getComputedStyle(resolverContext).getPropertyValue(token.name).trim();

      // Extract numerical color channels
      const rgbMatch = computedRgb.match(/\d+/g);
      if (!rgbMatch || rgbMatch.length < 3) {
        console.warn(`Token ${token.name} (${token.raw}) resolved to an invalid color output: "${computedRgb}"`);
        continue;
      }

      const [r, g, b] = rgbMatch.map(Number);

      const hex = rgbToHex(r, g, b);
      const hsl = rgbToHsl(r, g, b);
      const textColor = getAccessibleTextColor(r, g, b);

      // Check if this variable points to another variable to print a clean UI tag
      const isAlias = token.raw.startsWith('var(');
      const aliasTag = isAlias ? `<div style="font-size:0.75rem; opacity:0.7; font-weight:normal; margin-top:0.1rem;">➔ ${token.raw}</div>` : '';

      const swatch = document.createElement('div');
      swatch.style.width = '3in';
      swatch.style.height = '3in';
      swatch.style.backgroundColor = `var(${token.name})`; // Uses the active variable pointer
      swatch.style.color = textColor;
      swatch.style.padding = '0.75rem';
      swatch.style.boxSizing = 'border-box';
      swatch.style.borderRadius = '6px';
      swatch.style.fontFamily = 'monospace';
      swatch.style.fontSize = '0.85rem';
      swatch.style.display = 'flex';
      swatch.style.flexDirection = 'column';
      swatch.style.justifyContent = 'space-between';
      swatch.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';

      swatch.innerHTML = `
        <div style="font-weight: bold; word-break: break-all;">
          ${token.name}
          ${aliasTag}
        </div>
        <div style="opacity: 0.9; margin-top: auto; line-height: 1.4;">
          <div>rgb(${r}, ${g}, ${b})</div>
          <div>${hex}</div>
          <div>${hsl}</div>
        </div>
      `;

      grid.appendChild(swatch);
    }
  } catch (e) {
    console.error("CORS security asset protection triggered.", e);
  } finally {
    // Keep your document node body clean
    resolverContext.remove();
  }
}

/* ==========================================
   COLOR TRANSFORMATION UTILITIES
   ========================================== */
function getAccessibleTextColor(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(val => {
    val /= 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  return luminance > 0.179 ? 'rgb(20, 23, 14)' : 'rgb(255, 250, 229)';
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

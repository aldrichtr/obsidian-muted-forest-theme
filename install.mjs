import { execSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const testValtRepo = 'community-archive/theme-dev-vault';
const testVaultPath = join(projectRoot, 'theme-test-vault');
const manifestPath = join(projectRoot, "manifest.json");
const themeCssPath = join(projectRoot, "theme.css");

/**
 * Clone a repository into a local folder.  The repository should be an Obsidian vault.
 * @param {string} repo The Github repository (`<owner>`/`<repo>`) of the vault used for testing the theme
 * @param {string} vaultPath The path to clone the repo into
 */
function cloneTestVault(repo, vaultPath) {
  if (!existsSync(vaultPath)) {
    try {
      execSync(`gh repo clone ${repo} ${vaultPath}`, { stdio: 'inherit' });
    } catch (error) {
      console.error(`There was an error cloning ${repo} into ${vaultPath}`);
      process.exit(error.status || 1);
    }
  } else {
    console.log(`Target folder ${vaultPath} already exists!`);
  }
}

/**
 *
 * @param {string} vaultPath The path of the test vault.
 * @param {string} themeFile The CSS theme file
 * @param {string} manifestFile The Obsidian manifest
 */
function installTheme(vaultPath, themeFile, manifestFile) {
  const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
  const themeDir = join(vaultPath, ".obsidian", "themes", manifest.name);

  mkdirSync(themeDir, { recursive: true });

  copyFileSync(manifestFile, join(themeDir, "manifest.json"));
  copyFileSync(themeFile, join(themeDir, "theme.css"));

  console.log(`Installed "${manifest.name}" theme to: ${themeDir}`);
}


if (!existsSync(testVaultPath)) {
  console.log(`Cloning ${testValtRepo} into ${testVaultPath}`);
  cloneTestVault(testValtRepo, testVaultPath);
}
installTheme(testVaultPath, themeCssPath, manifestPath);

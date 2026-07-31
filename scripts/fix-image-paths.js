#!/usr/bin/env node
/**
 * fix-image-paths.js
 *
 * Для каждого поста в _posts/*.md:
 *   1. Находит его папку с изображениями по полю media_subpath из frontmatter.
 *   2. Конвертирует все png/jpg/jpeg в этой папке в webp (кроме cover.webp,
 *      который уже webp) и удаляет оригиналы.
 *   3. В тексте поста обновляет ссылки на изображения:
 *      - меняет расширение на .webp, если файл был сконвертирован
 *      - обрезает путь к папке, оставляя только имя файла
 *      - внешние (http/https) и уже "чистые" ссылки не трогает
 *
 * Требуется пакет sharp:
 *   npm install sharp
 *
 * Запуск вручную:
 *   node scripts/fix-image-paths.js
 *
 * Только проверка, без изменений (для CI):
 *   node scripts/fix-image-paths.js --check
 */

const fs = require("fs");
const path = require("path");
let sharp;
try {
  sharp = require("sharp");
} catch (e) {
  console.error("Не найден пакет sharp. Установите его командой: npm install sharp");
  process.exit(1);
}

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "_posts");
const CHECK_ONLY = process.argv.includes("--check");

const IMAGE_LINK_RE = /!\[([^\]]*)\]\(([^)\s]+)(\s+"[^"]*")?\)/g;
const CONVERTIBLE_EXT = new Set([".png", ".jpg", ".jpeg"]);

// Chirpy рекомендует обложку 1200x630 (пропорция 1.91:1) — при другом размере
// тема сама обрезает картинку, и получается тот самый "кривой" кроп.
// Приводим обложку к этому размеру заранее, с обрезкой по центру (без искажений).
const COVER_WIDTH = 1200;
const COVER_HEIGHT = 630;

function isExternalOrAbsolute(link) {
  return (
    link.startsWith("http://") ||
    link.startsWith("https://") ||
    link.startsWith("//") ||
    link.startsWith("/")
  );
}

function toBasename(link) {
  const parts = link.split("/");
  return parts[parts.length - 1];
}

function splitFrontmatter(content) {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  if (!match) return { frontmatter: "", body: content };
  return { frontmatter: match[0], body: content.slice(match[0].length) };
}

function getMediaSubpath(frontmatter) {
  const m = frontmatter.match(/^media_subpath:\s*(.+)\s*$/m);
  if (!m) return null;
  return m[1].trim().replace(/^\/|\/$/g, ""); // без ведущего/конечного слэша
}

async function convertFolderToWebp(folderPath, log) {
  if (!fs.existsSync(folderPath)) return {};
  const renameMap = {}; // "старое-имя.png" -> "старое-имя.webp"
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!CONVERTIBLE_EXT.has(ext)) continue;

    const fullPath = path.join(folderPath, file);
    const base = path.basename(file, ext);
    const webpName = `${base}.webp`;
    const webpPath = path.join(folderPath, webpName);

    if (CHECK_ONLY) {
      renameMap[file] = webpName;
      log.push(`[нужно конвертировать] ${file} -> ${webpName}`);
      continue;
    }

    await sharp(fullPath).webp({ quality: 82 }).toFile(webpPath);
    fs.unlinkSync(fullPath);
    renameMap[file] = webpName;
    log.push(`[конвертировано] ${file} -> ${webpName}`);
  }

  return renameMap;
}

function fixBody(body, renameMap) {
  let changed = false;
  const fixed = body.replace(IMAGE_LINK_RE, (full, alt, link, title = "") => {
    if (isExternalOrAbsolute(link)) return full;

    let base = toBasename(link);
    if (renameMap[base]) {
      base = renameMap[base];
    }

    if (base === link) return full;
    changed = true;
    return `![${alt}](${base}${title})`;
  });
  return { fixed, changed };
}

async function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`Папка не найдена: ${POSTS_DIR}`);
    console.error("Запускайте скрипт из корня репозитория блога.");
    process.exit(1);
  }

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  let anyBad = false;
  let anyChanged = false;

  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    const content = fs.readFileSync(filePath, "utf8");
    const { frontmatter, body } = splitFrontmatter(content);

    const log = [];
    let renameMap = {};

    const mediaSubpath = getMediaSubpath(frontmatter);
    if (mediaSubpath) {
      const folderPath = path.join(ROOT, mediaSubpath);
      renameMap = await convertFolderToWebp(folderPath, log);
    }

    const { fixed, changed } = fixBody(body, renameMap);
    const anythingHappened = changed || log.length > 0;

    if (anythingHappened) {
      anyBad = true;
      if (log.length) {
        console.log(`${file}:`);
        log.forEach((l) => console.log("  " + l));
      }
      if (changed) {
        console.log(`  [ссылки обновлены] ${file}`);
      }
      if (!CHECK_ONLY) {
        fs.writeFileSync(filePath, frontmatter + fixed, "utf8");
        anyChanged = true;
      }
    }
  }

  if (!anyBad) {
    console.log("Все изображения и ссылки уже в порядке.");
  } else if (CHECK_ONLY) {
    console.log("\nНайдены посты, требующие конвертации/исправления путей.");
    process.exit(1);
  } else if (anyChanged) {
    console.log("\nГотово. Не забудьте git add изменённые файлы.");
  }
}

main();

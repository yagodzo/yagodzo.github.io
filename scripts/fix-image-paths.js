#!/usr/bin/env node
/**
 * Нормализует ссылки на изображения в _posts/*.md к виду /images/<папка>/<файл>.
 *
 * Obsidian записывает путь относительно заметки, а Chirpy разрешает его
 * относительно media_subpath — из-за расхождения ссылки ломаются. Скрипт
 * находит файл по имени внутри images/ и подставляет абсолютный путь.
 *
 * Использование: node scripts/fix-image-paths.js [--check]
 * Код возврата 1 — остались нерешённые проблемы; в режиме --check также
 * когда файлы требуют правки.
 */

const fs = require("fs");
const path = require("path");

const POSTS_DIR = path.join(process.cwd(), "_posts");
const IMAGES_DIR = path.join(process.cwd(), "images");
const URL_PREFIX = "/images/";
const CHECK_ONLY = process.argv.includes("--check");

const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;
const MEDIA_SUBPATH = /^media_subpath:[ \t]*(.+?)[ \t]*\r?\n/m;
const COVER_PATH = /(^image:[ \t]*\r?\n(?:[ \t]+[^\r\n]*\r?\n)*?[ \t]+path:[ \t]*)([^\r\n]+)/m;
// Скобки внутри пути допустимы, если сбалансированы («Screenshot (1).png»):
// kramdown такие ссылки разбирает, значит и здесь их нельзя терять.
const MD_IMAGE = /!\[([^\]]*)\]\(((?:[^()\s]|\([^()\s]*\))+)(\s+"[^"]*")?\)/g;
const WIKI_IMAGE = /!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g;
const MD_IMAGE_LOOSE = /!\[[^\]]*\]\(([^)"]*)\)/g;

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

/** Индекс `имя файла -> [путь относительно images/]`. */
function indexImages() {
  const index = new Map();
  if (!fs.existsSync(IMAGES_DIR)) return index;

  for (const full of walk(IMAGES_DIR)) {
    const rel = path.relative(IMAGES_DIR, full).split(path.sep).join("/");
    const base = path.basename(rel);
    if (!index.has(base)) index.set(base, []);
    index.get(base).push(rel);
  }
  return index;
}

function decode(link) {
  try {
    return decodeURIComponent(link);
  } catch {
    return link;
  }
}

function encode(relPath) {
  return relPath
    .split("/")
    .map((segment) =>
      segment.replace(/[%\s()?#]/g, (char) => "%" + char.charCodeAt(0).toString(16).padStart(2, "0"))
    )
    .join("/");
}

/** Внешние ссылки и абсолютные пути вне images/ скрипт не обслуживает. */
function isManaged(link) {
  if (/^(https?:)?\/\//.test(link) || link.startsWith("data:")) return false;
  return !link.startsWith("/") || link.startsWith(URL_PREFIX);
}

function resolveLink(link, index, folder) {
  const decoded = decode(link);
  const base = path.basename(decoded.split(/[#?]/)[0]);
  const candidates = index.get(base) ?? [];

  if (candidates.length === 0) return { error: `файл не найден в images/: ${base}` };
  if (candidates.length === 1) return { url: URL_PREFIX + encode(candidates[0]) };

  const match =
    (folder && candidates.find((c) => path.dirname(c) === folder)) ||
    candidates.find((c) => decoded.endsWith(c));

  // Подставить не тот файл хуже, чем честный 404: на сайте молча окажется
  // чужая картинка, и заметить это можно только глазами.
  if (!match) {
    return {
      error: `имя "${base}" встречается в ${candidates.length} папках (${candidates.join(", ")}) — укажите папку явно`,
    };
  }
  return { url: URL_PREFIX + encode(match) };
}

function subpathFolder(frontmatter) {
  const match = frontmatter.match(MEDIA_SUBPATH);
  if (!match) return null;

  const value = match[1].replace(/^["']|["']$/g, "").replace(/^\/+|\/+$/g, "");
  return value.startsWith("images/") ? decode(value.slice("images/".length)) : null;
}

/**
 * Chirpy приклеивает media_subpath даже к абсолютным путям, поэтому обложка
 * переводится в абсолютный вид, а сама директива удаляется.
 */
function rewriteFrontmatter(frontmatter, index, folder, report) {
  if (!MEDIA_SUBPATH.test(frontmatter)) return frontmatter;

  let failed = false;
  const withCover = frontmatter.replace(COVER_PATH, (full, head, value) => {
    const raw = value.trim().replace(/^["']|["']$/g, "");
    if (!isManaged(raw)) return full;

    const resolved = resolveLink(raw, index, folder);
    if (resolved.error) {
      report(`обложка — ${resolved.error}`);
      failed = true;
      return full;
    }
    return head + resolved.url;
  });

  return failed ? frontmatter : withCover.replace(MEDIA_SUBPATH, "");
}

function rewriteBody(body, index, folder, report) {
  // Неэкранированный пробел внутри скобок — это не markdown-ссылка: её не
  // видит ни kramdown, ни регулярные выражения ниже.
  for (const [, link] of body.matchAll(MD_IMAGE_LOOSE)) {
    if (/\s/.test(link)) report(`пробел в ссылке "${link.trim()}" — замените на %20`);
  }

  const replaceLink = (fallback, link, build) => {
    if (!isManaged(link)) return fallback;

    const resolved = resolveLink(link, index, folder);
    if (resolved.error) {
      report(resolved.error);
      return fallback;
    }
    return build(resolved.url);
  };

  return body
    .replace(WIKI_IMAGE, (full, target, alt) =>
      replaceLink(full, target, (url) => `![${alt ?? ""}](${url})`)
    )
    .replace(MD_IMAGE, (full, alt, link, title = "") =>
      replaceLink(full, link, (url) => (url === link ? full : `![${alt}](${url}${title})`))
    );
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`Папка не найдена: ${POSTS_DIR}. Запускайте скрипт из корня репозитория.`);
    process.exit(1);
  }

  const index = indexImages();
  const touched = [];
  let problems = 0;

  for (const name of fs.readdirSync(POSTS_DIR).filter((n) => n.endsWith(".md"))) {
    const file = path.join(POSTS_DIR, name);
    const content = fs.readFileSync(file, "utf8");
    const match = content.match(FRONTMATTER);
    const frontmatter = match ? match[0] : "";
    const body = match ? content.slice(frontmatter.length) : content;
    const report = (message) => {
      problems++;
      console.error(`  ! ${name}: ${message}`);
    };

    const folder = subpathFolder(frontmatter);
    const updated =
      rewriteFrontmatter(frontmatter, index, folder, report) +
      rewriteBody(body, index, folder, report);

    if (updated === content) continue;
    touched.push(name);
    if (!CHECK_ONLY) fs.writeFileSync(file, updated, "utf8");
  }

  if (touched.length) {
    const header = CHECK_ONLY ? "Требуют правки" : "Исправлено";
    const log = CHECK_ONLY ? console.error : console.log;
    log(`${header}:`);
    for (const name of touched) log(`  - ${name}`);
    if (CHECK_ONLY) console.error("Запустите: node scripts/fix-image-paths.js");
  }

  process.exit(problems || (CHECK_ONLY && touched.length) ? 1 : 0);
}

main();

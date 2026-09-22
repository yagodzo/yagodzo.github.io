#!/usr/bin/env node
/**
 * fix-image-paths.js
 *
 * Приводит все ссылки на изображения в _posts/*.md к одному виду —
 * абсолютному пути от корня сайта: /images/<Папка>/<файл>.
 *
 * ЗАЧЕМ
 * Obsidian вставляет ссылки в своём формате (относительный путь от заметки,
 * иногда wiki-ссылка), а Chirpy приклеивает `media_subpath` к любому пути,
 * который не содержит "://". Из-за этого получался мусор вида
 *   /images/Пост/../images/Другая папка/file.png   -> 404
 * и картинки молча переставали грузиться.
 *
 * ВАЖНО ПРО media_subpath
 * Chirpy приклеивает media_subpath даже к абсолютным путям
 * (см. _includes/media-url.html: `{% unless url contains ':' %}`).
 * Поэтому абсолютные пути и media_subpath несовместимы — скрипт
 * переписывает обложку (image.path) в абсолютный вид и убирает
 * строку media_subpath из frontmatter. Это же делает схему
 * самовосстанавливающейся: если шаблон Templater снова добавит
 * media_subpath, хук уберёт её на ближайшем коммите.
 *
 * ЧТО ДЕЛАЕТ
 *   ![](../images/Заметки/screen.png)  ->  ![](/images/Заметки/screen.png)
 *   ![](screen.png)                    ->  ![](/images/Заметки/screen.png)
 *   ![[screen.png]]                    ->  ![](/images/Заметки/screen.png)
 *   ![[screen.png|392]]                ->  ![392](/images/Заметки/screen.png)
 *   frontmatter: media_subpath + path: cover.webp -> path: /images/Заметки/cover.webp
 *
 * Файл ищется по имени внутри images/, поэтому неважно, в какую подпапку
 * Obsidian его сохранил. Если одноимённых файлов несколько, предпочтение
 * отдаётся папке из media_subpath, затем — пути, уже указанному в ссылке.
 *
 * Внешние ссылки (http/https/data:) и абсолютные пути мимо images/
 * (например /assets/img/...) не трогаются.
 *
 * ЗАПУСК
 *   node scripts/fix-image-paths.js            # починить
 *   node scripts/fix-image-paths.js --check    # только проверить (CI/хук)
 *
 * КОДЫ ВОЗВРАТА
 *   0 — всё хорошо
 *   1 — есть ссылки, которые не удалось разрешить (файл не найден),
 *       либо в режиме --check найдены места, требующие правки.
 */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "_posts");
const IMAGES_DIR = path.join(ROOT, "images");
const IMAGES_URL_PREFIX = "/images/";
const CHECK_ONLY = process.argv.includes("--check");

// ![alt](путь "необязательный title")
const MD_IMAGE_RE = /!\[([^\]]*)\]\(([^)\s]+)(\s+"[^"]*")?\)/g;
// ![[путь|необязательный alt]] — формат Obsidian
const WIKI_IMAGE_RE = /!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g;
const MEDIA_SUBPATH_RE = /^media_subpath:[ \t]*(.+?)[ \t]*\r?\n/m;

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

/** basename -> [путь относительно images/, ...] */
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

/**
 * Ссылки, которые скрипт не трогает: внешние, data: и абсолютные пути
 * мимо images/ (например /assets/img/...). Абсолютные /images/... наоборот
 * проверяются — так чинятся ссылки на переехавшие файлы.
 */
function shouldSkip(link) {
  if (/^(https?:)?\/\//.test(link) || link.startsWith("data:")) return true;
  return link.startsWith("/") && !link.startsWith(IMAGES_URL_PREFIX);
}

function decodeLink(link) {
  try {
    return decodeURIComponent(link);
  } catch {
    return link; // битая процентная последовательность — оставляем как есть
  }
}

/** Кодируем только то, что ломает markdown-ссылку или URL. */
function encodePath(relPath) {
  return relPath
    .split("/")
    .map((seg) =>
      seg.replace(/%/g, "%25").replace(/ /g, "%20").replace(/\?/g, "%3F").replace(/#/g, "%23")
    )
    .join("/");
}

function splitFrontmatter(content) {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  if (!match) return { frontmatter: "", body: content };
  return { frontmatter: match[0], body: content.slice(match[0].length) };
}

/** Папка поста внутри images/, взятая из media_subpath (для разрешения неоднозначностей). */
function preferredFolder(frontmatter) {
  const match = frontmatter.match(MEDIA_SUBPATH_RE);
  if (!match) return null;
  const value = match[1].replace(/^["']|["']$/g, "").replace(/^\/+|\/+$/g, "");
  if (!value.startsWith("images/")) return null;
  return decodeLink(value.slice("images/".length));
}

/**
 * Превращает ссылку из поста в абсолютный URL /images/...
 * Возвращает { url } либо { error }.
 */
function resolveLink(rawLink, index, folder) {
  const decoded = decodeLink(rawLink);
  const base = path.basename(decoded.split("#")[0].split("?")[0]);
  const candidates = index.get(base);

  if (!candidates || candidates.length === 0) {
    return { error: `файл не найден в images/: ${base}` };
  }

  let chosen = candidates[0];
  if (candidates.length > 1) {
    const inFolder = folder && candidates.find((c) => path.dirname(c) === folder);
    const byPath = candidates.find((c) => decoded.endsWith(c));
    chosen = inFolder || byPath;
    // Угадывать нельзя: подставим не тот файл — на сайте молча окажется
    // чужая картинка, а это хуже, чем честный 404.
    if (!chosen) {
      return {
        error:
          `имя "${base}" встречается в ${candidates.length} папках ` +
          `(${candidates.join(", ")}) — укажите папку в ссылке явно`,
      };
    }
  }

  return { url: IMAGES_URL_PREFIX + encodePath(chosen) };
}

/**
 * Обложку делает абсолютной и убирает media_subpath — иначе Chirpy
 * приклеит subpath к уже абсолютным путям в теле поста.
 */
function processFrontmatter(frontmatter, index, folder, problems, file) {
  if (!frontmatter || !MEDIA_SUBPATH_RE.test(frontmatter)) {
    return { frontmatter, changed: false };
  }

  let updated = frontmatter;
  let coverOk = true;

  // path: внутри блока image:
  updated = updated.replace(
    /^(image:[ \t]*\r?\n(?:[ \t]+[^\r\n]*\r?\n)*?[ \t]+path:[ \t]*)([^\r\n]+?)([ \t]*\r?\n)/m,
    (full, head, value, tail) => {
      const raw = value.replace(/^["']|["']$/g, "");
      if (shouldSkip(raw)) return full;
      const resolved = resolveLink(raw, index, folder);
      if (resolved.error) {
        problems.push(`${file}: обложка — ${resolved.error}`);
        coverOk = false;
        return full;
      }
      return head + resolved.url + tail;
    }
  );

  if (!coverOk) return { frontmatter, changed: false };

  updated = updated.replace(MEDIA_SUBPATH_RE, "");
  return { frontmatter: updated, changed: updated !== frontmatter };
}

/**
 * Ссылка с неэкранированным пробелом внутри скобок не является
 * markdown-ссылкой: её не видит ни kramdown, ни этот скрипт, и на сайте
 * она остаётся текстом. Такое надо показать явно, а не пропустить молча.
 */
function reportRawSpaces(body, problems, file) {
  for (const match of body.matchAll(/!\[[^\]]*\]\(([^)"]*)\)/g)) {
    if (/\s/.test(match[1])) {
      problems.push(
        `${file}: пробел в ссылке "${match[1].trim()}" — замените пробелы на %20`
      );
    }
  }
}

function processBody(body, index, folder, problems, file) {
  let changed = false;

  reportRawSpaces(body, problems, file);

  const afterWiki = body.replace(WIKI_IMAGE_RE, (full, target, alt) => {
    const resolved = resolveLink(target, index, folder);
    if (resolved.error) {
      problems.push(`${file}: ${resolved.error}`);
      return full;
    }
    changed = true;
    return `![${alt || ""}](${resolved.url})`;
  });

  const afterMd = afterWiki.replace(MD_IMAGE_RE, (full, alt, link, title = "") => {
    if (shouldSkip(link)) return full;
    const resolved = resolveLink(link, index, folder);
    if (resolved.error) {
      problems.push(`${file}: ${resolved.error}`);
      return full;
    }
    if (resolved.url === link) return full; // уже правильная
    changed = true;
    return `![${alt}](${resolved.url}${title})`;
  });

  return { body: afterMd, changed };
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`Папка не найдена: ${POSTS_DIR}`);
    console.error("Запускайте скрипт из корня репозитория блога.");
    process.exit(1);
  }

  const index = indexImages();
  const problems = [];
  const touched = [];

  for (const name of fs.readdirSync(POSTS_DIR)) {
    if (!name.endsWith(".md")) continue;
    const file = path.join(POSTS_DIR, name);
    const content = fs.readFileSync(file, "utf8");
    const { frontmatter, body } = splitFrontmatter(content);
    const folder = preferredFolder(frontmatter);

    const fm = processFrontmatter(frontmatter, index, folder, problems, name);
    const md = processBody(body, index, folder, problems, name);
    if (!fm.changed && !md.changed) continue;

    touched.push(name);
    if (!CHECK_ONLY) fs.writeFileSync(file, fm.frontmatter + md.body, "utf8");
  }

  for (const problem of problems) console.error(`  ! ${problem}`);

  if (CHECK_ONLY) {
    if (touched.length) {
      console.error("Пути к изображениям требуют правки в:");
      for (const name of touched) console.error(`  - ${name}`);
      console.error("Запустите: node scripts/fix-image-paths.js");
    }
    process.exit(touched.length || problems.length ? 1 : 0);
  }

  if (touched.length) {
    console.log("Пути к изображениям исправлены в:");
    for (const name of touched) console.log(`  - ${name}`);
  }
  process.exit(problems.length ? 1 : 0);
}

main();

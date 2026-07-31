#!/usr/bin/env node
/**
 * fix-image-paths.js
 *
 * Проходит по всем файлам в _posts/*.md и исправляет ссылки на изображения
 * в теле поста: если ссылка относительная (не http/https и не абсолютная
 * от корня сайта) и содержит путь к папке, оставляет только имя файла.
 *
 * Пример:
 *   ![](./images/Box/31-07-2026-12-14.png)  ->  ![](31-07-2026-12-14.png)
 *   ![alt](images/Box/screen.png "title")   ->  ![alt](screen.png "title")
 *
 * Frontmatter (title, image.path и т.д.) не трогает — работает только
 * с markdown-ссылками ![...](...) в теле поста, начиная после закрывающего
 * "---" frontmatter.
 *
 * Запуск вручную:
 *   node scripts/fix-image-paths.js
 *
 * Запуск с флагом --check — ничего не меняет, только показывает,
 * какие файлы содержат "плохие" ссылки (удобно для CI):
 *   node scripts/fix-image-paths.js --check
 */

const fs = require("fs");
const path = require("path");

const POSTS_DIR = path.join(process.cwd(), "_posts");
const CHECK_ONLY = process.argv.includes("--check");

// Ссылка вида ![alt](путь "необязательный title")
const IMAGE_LINK_RE = /!\[([^\]]*)\]\(([^)\s]+)(\s+"[^"]*")?\)/g;

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
  // Frontmatter — это блок между первой и второй строкой "---"
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  if (!match) {
    return { frontmatter: "", body: content };
  }
  const frontmatter = match[0];
  const body = content.slice(frontmatter.length);
  return { frontmatter, body };
}

function fixBody(body) {
  let changed = false;
  const fixed = body.replace(IMAGE_LINK_RE, (full, alt, link, title = "") => {
    if (isExternalOrAbsolute(link)) {
      return full; // внешние и абсолютные ссылки не трогаем
    }
    const base = toBasename(link);
    if (base === link) {
      return full; // уже голое имя файла, менять нечего
    }
    changed = true;
    return `![${alt}](${base}${title})`;
  });
  return { fixed, changed };
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`Папка не найдена: ${POSTS_DIR}`);
    console.error("Запускайте скрипт из корня репозитория блога.");
    process.exit(1);
  }

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"));

  let anyChanged = false;
  let anyBad = false;

  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    const content = fs.readFileSync(filePath, "utf8");
    const { frontmatter, body } = splitFrontmatter(content);
    const { fixed, changed } = fixBody(body);

    if (changed) {
      anyBad = true;
      if (CHECK_ONLY) {
        console.log(`[нужно исправить] ${file}`);
      } else {
        fs.writeFileSync(filePath, frontmatter + fixed, "utf8");
        console.log(`[исправлено] ${file}`);
        anyChanged = true;
      }
    }
  }

  if (!anyBad) {
    console.log("Все ссылки на изображения уже в порядке.");
  } else if (CHECK_ONLY) {
    console.log("\nНайдены посты с некорректными путями к изображениям.");
    process.exit(1); // ненулевой код — удобно для CI, чтобы упасть сборку
  } else if (anyChanged) {
    console.log("\nГотово. Не забудьте git add изменённые файлы.");
  }
}

main();

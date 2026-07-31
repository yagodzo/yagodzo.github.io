<%*
// 1. Запрашиваем название поста (без даты)
const postTitle = await tp.system.prompt("Введите название поста (без даты):");
if (!postTitle) throw new Error("Название не введено");

// 2. Создаём папку _posts, если её нет
const postsFolder = "_posts";
if (!await app.vault.adapter.exists(postsFolder)) {
  await app.vault.createFolder(postsFolder);
}

// 3. Переименовываем файл с датой и перемещаем в _posts
const datePrefix = tp.date.now("YYYY-MM-DD");
const newFileName = `${datePrefix}-${postTitle}`;
const newPath = `${postsFolder}/${newFileName}`;
await tp.file.move(newPath);

// 4. Создаём папку для изображений в корневой images/
const imageFolder = `images/${postTitle}`;
if (!await app.vault.adapter.exists(imageFolder)) {
  await app.vault.createFolder(imageFolder);
}

// 5. Создаём пустой cover.webp
const coverPath = `${imageFolder}/cover.webp`;
if (!await app.vault.adapter.exists(coverPath)) {
  await app.vault.create(coverPath, "");
}

// 4.5 (ключевая строка) — переключаем папку для всех новых вложений на папку этого поста
await app.vault.setConfig("attachmentFolderPath", imageFolder);

// 6. Генерируем front matter
const frontMatter = `---
title: "${postTitle}"
date: ${tp.date.now("YYYY-MM-DD HH:mm")} +0300
categories: [TryHackMe]
tags: []
media_subpath: /${imageFolder}/
image:
  path: cover.webp
  alt: "${postTitle}"
---
`;
tR += frontMatter;
%>
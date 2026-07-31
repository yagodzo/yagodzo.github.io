<%*
// 1. Запрашиваем название поста (без даты)
const postTitle = await tp.system.prompt("Введите название поста (без даты):");
if (!postTitle) {
    throw new Error("Название не введено");
}

// 2. Создаём папку _posts, если её нет
const postsFolder = "_posts";
if (!await app.vault.adapter.exists(postsFolder)) {
    await app.vault.createFolder(postsFolder);
}

// 3. Переименовываем файл с датой и перемещаем в _posts
const datePrefix = tp.date.now("YYYY-MM-DD");
const newFileName = `${datePrefix}-${postTitle}.md`;
const newPath = `${postsFolder}/${newFileName}`;
await tp.file.move(newPath);

// 4. Создаём папку для изображений (assets/images/название/)
const imageFolder = `assets/images/${postTitle}`;
if (!await app.vault.adapter.exists(imageFolder)) {
    await app.vault.createFolder(imageFolder);
}

// 5. Создаём пустой файл cover.webp (если его нет)
const coverPath = `${imageFolder}/cover.webp`;
if (!await app.vault.adapter.exists(coverPath)) {
    await app.vault.create(coverPath, "");
}

// 6. Генерируем front matter и добавляем его в заметку
const frontMatter = `---
title: "${postTitle}"
date: ${tp.date.now("YYYY-MM-DD HH:mm")} +0300
categories: [TryHackMe]
tags: []
media_subpath: /${imageFolder}/
image:
  path: cover.webp
  alt: "${postTitle}"
---`;
tR += frontMatter;
%>
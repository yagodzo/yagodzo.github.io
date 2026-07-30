<%*
// 1. Запрашиваем название поста
const postTitle = await tp.system.prompt("Введите название поста (без даты):");
if (!postTitle) {
    throw new Error("Название поста не введено");
}

// 2. Перемещаем файл в папку _posts (если она ещё не существует)
const postsFolder = "_posts";
const folderExists = await app.vault.adapter.exists(postsFolder);
if (!folderExists) {
    await app.vault.createFolder(postsFolder);
}

// 3. Переименовываем с датой и перемещаем в _posts
const datePrefix = tp.date.now("YYYY-MM-DD");
const newFileName = `${datePrefix}-${postTitle}.md`;
const newPath = `${postsFolder}/${newFileName}`;
await tp.file.move(newPath);

// 4. Создаём папку для изображений в assets/img/
const imageFolder = `assets/img/${postTitle}`;
const imageFolderExists = await app.vault.adapter.exists(imageFolder);
if (!imageFolderExists) {
    await app.vault.createFolder(imageFolder);
}

// 5. Копируем заглушку cover.webp
const templateImagePath = "templates/cover_default.webp";
const targetImagePath = `${imageFolder}/cover.webp`;
const imageExists = await app.vault.adapter.exists(templateImagePath);
if (imageExists) {
    const imageContent = await app.vault.adapter.readBinary(templateImagePath);
    await app.vault.createBinary(targetImagePath, imageContent);
} else {
    await app.vault.create(targetImagePath, "");
}
%>
---
title: "<% postTitle %>"
date: <% tp.date.now("YYYY-MM-DD HH:mm") %> +0300
categories: []
tags: []
media_subpath: /<% imageFolder %>/
image:
  path: cover.webp
  alt: "<% postTitle %>"
---
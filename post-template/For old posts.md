<%*
const tfile = tp.file.find_tfile(tp.file.path(true));
const fm = app.metadataCache.getFileCache(tfile)?.frontmatter;
if (fm?.title) {
  await app.vault.setConfig("attachmentFolderPath", `images/${fm.title}`);
  new Notice(`Вложения теперь → images/${fm.title}`);
} else {
  new Notice("Не найден title во frontmatter текущего файла");
}
-%>
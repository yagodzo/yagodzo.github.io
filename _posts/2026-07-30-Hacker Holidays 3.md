---
title: 2026-07-30-Hacker Holidays 3
date: 2026-07-31 10:58 +0300
categories:
  - TryHackMe
tags:
  - ctf
media_subpath: /images/Hacker Holidays 3/
image:
  path: cover.webp
---
Нам предоставили доступ к веб-приложению по адресу `http://complimentary-wellness-app-332173347248.s3-website-us-east-1.amazonaws.com/`. 
![](30-07-2026-11-40.png)
Первым делом открываем DevTools и изучаем исходный код. 
![](30-07-2026-11-41.png)В файле `app.js` замечаем следующую логику:
```
const IDENTITY_POOL_ID = "us-east-1:836c0949-292d-485b-b532-52d5ca7bb688";
const AWS_REGION = "us-east-1";
const TABLE_NAME = "complimentary-GuestWellnessProfiles";

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: IDENTITY_POOL_ID,
});
```
**Гипотеза**: IAM-роль для неаутентифицированных пользователей имеет избыточные права, позволяющие выполнить `dynamodb:Scan` вместо ограниченного `GetItem`. Разработчик ошибочно доверился клиентскому коду, полагая, что пользователь не выйдет за рамки запроса, заложенного в JavaScript.

Проверяем это, извлекая временные ключи и обращаясь к AWS напрямую.

1. Извлекаем ключи через консоль браузера:
![](5121.png)
2. Экспортируем полученные значения в переменные окружения для работы AWS CLI + Обходим бизнес-логику фронтенда и выгружаем всю таблицу:
![](Drawing%202026-07-30%2012.30.17.excalidraw.png)
3. В дампе чужой записи (в поле `notes`) обнаруживается искомый флаг. Для его быстрого извлечения из JSON-вывода можно использовать:
![392](Drawing%202026-07-30%2012.40.48.excalidraw.png)

**Root cause**: Безопасность не должна строиться на ограничениях в браузере. Выдача клиенту прямых AWS-ключей без строгих IAM-условий (или использование прослойки API Gateway + Lambda) неизбежно ведет к компрометации данных.
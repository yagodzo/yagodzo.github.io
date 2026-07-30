---
title: Hacker Holidays 3 - AWS Cognito & DynamoDB Enumeration
date: 2026-07-30 11:27 +0300
categories:
  - TryHackMe
tags:
  - ctf
aliases:
  - assets/img/posts/30-07-2026-11-40.png
---
Нам предоставили доступ к веб-приложению по адресу `http://complimentary-wellness-app-332173347248.s3-website-us-east-1.amazonaws.com/`. 
![](assets/img/posts/30-07-2026-11-40.png)
Первым делом открываем DevTools и изучаем исходный код. 
![](assets/img/posts/30-07-2026-11-41.png)В файле `app.js` замечаем следующую логику:
```
const IDENTITY_POOL_ID = "us-east-1:836c0949-292d-485b-b532-52d5ca7bb688";
const AWS_REGION = "us-east-1";
const TABLE_NAME = "complimentary-GuestWellnessProfiles";

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: IDENTITY_POOL_ID,
});
```
Приложение использует Amazon Cognito Identity Pool для автоматической выдачи временных AWS-ключей неаутентифицированным пользователям. Фронтенд использует метод `getItem`, чтобы прочитать из DynamoDB только свою запись по сгенерированному `guest_id`.

Возникает вопрос: что если IAM-роль, привязанная к этому пулу, настроена с избыточными привилегиями? Если мы получим эти временные ключи, сможем ли мы выйти за рамки бизнес-логики фронтенда и прочитать данные других гостей?

```
AWS.config.credentials.get(function() {
  console.log({
    accessKeyId: AWS.config.credentials.accessKeyId,
    secretAccessKey: AWS.config.credentials.secretAccessKey,
    sessionToken: AWS.config.credentials.sessionToken
  });
});
```
![](assets/img/posts/5121.png)
![](assets/img/posts/Drawing%202026-07-30%2012.30.17.excalidraw.png)
![](assets/img/posts/Drawing%202026-07-30%2012.40.48.excalidraw.png)

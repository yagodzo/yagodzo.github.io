---
title: Packed Light
date: 2026-08-04 10:08 +0300
categories:
  - TryHackMe
tags:
  - ctf
media_subpath: /images/Packed Light/
image:
  path: cover.webp
---
Изучили `Protocol Hierarchy` в Wireshark, выявили аномальный объем данных, передаваемый через малое количество HTTP-пакетов.
![395](31-07-2026-16-13.png)
В предоставленном файле `traffic.pcapng` видно, как жертва (`192.168.1.141`) скачивает вредоносный Python-скрипт **`updates.py`** с сервера злоумышленника (`byte-lotus-hotel.thm:8080`)

Этот скрипт является **кейлоггером**. Он перехватывает каждое нажатие клавиши, шифрует данные с помощью XOR-ключа (`H0t3lSt@ff0NlyK3epS3cr3t!`)[](https://dev.to/exploitnotes/tryhackme-packed-light-writeup-1n39), кодирует результат в Base64 и отправляет его обратно на сервер злоумышленника в HTTP-заголовке `Cookie`[](https://dev.to/exploitnotes/tryhackme-packed-light-writeup-1n39)
![](31-07-2026-16-14.png)

![](31-07-2026-16-15.png)

С помощью `tshark` отфильтровали вредоносные запросы по уникальному `User-Agent` и массово извлекли значения Cookie.
![](31-07-2026-16-25.png)

Автоматизировали процесс: декодировали Base64 и применили обратный XOR с первым байтом ключа для восстановления исходного текста.
![](31-07-2026-16-26.png)
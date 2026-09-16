---
title: Linux guid
date: 2026-09-10 15:13 +0300
categories:
  - TryHackMe
tags:
  - Обучение
media_subpath: /images/Linux guid/
image:
  path: cover.webp
---
Find files based on filename 
`find /home/Andy -type f -name sales.txt` 

Find Directory based on directory name
`find /home/Andy -type d -name pictures`

Find files based on size
`find /home/Andy -type f -size 10c`

Find files based on username
`find /etc/server -type f -user john`

Find files based on group name
`find /etc/server -type f -group teamstar`

Find files modified after a specific date
`find / -type f -newermt '6/30/2020 0:00:00'

Find files based on date modified
`find / -type f -newermt 2013-09-12 ! -newermt 2013-09-14`

Find files based on date accessed
`find / -type f -newerat 2017-09-12 ! -newerat 2017-09-14`

Find files with a specific keyword
`grep -iRl '/folderA/flag'

read the manual for the find command
`man find`
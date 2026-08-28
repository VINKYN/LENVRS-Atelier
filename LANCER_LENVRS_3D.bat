@echo off
title LENVRS By You - Atelier 3D
chcp 65001 > nul
cls
echo ========================================================
echo       L E N V R S   B Y   Y O U   -   A T E L I E R   3 D
echo ========================================================
echo.
echo [1/2] Initialisation du serveur 3D...
cd /d "%~dp0"

echo [2/2] Ouverture automatique de votre navigateur...
start "" http://localhost:3000/

echo.
echo Le configurateur 3D est actif sur : http://localhost:3000/
echo (Vous pouvez reduire cette fenetre sans la fermer)
echo.
npm run dev
pause

#!/bin/bash
cd /home/kavia/workspace/code-generation/webtictactoe-arena-71088-fd27a2dc/frontend_app
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


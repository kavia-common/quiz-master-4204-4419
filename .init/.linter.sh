#!/bin/bash
cd /home/kavia/workspace/code-generation/quiz-master-4204-4419/quiz_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


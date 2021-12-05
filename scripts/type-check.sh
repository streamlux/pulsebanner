#!/bin/sh

echo "\nType checking apps/next ..."
npx tsc -p apps/next/tsconfig.json --noEmit --incremental
echo "\nType checking apps/remotion ..."
npx tsc -p apps/remotion/tsconfig.json --noEmit --incremental
echo "\nType checking apps/nest ..."
npx tsc -p apps/nest/tsconfig.json --noEmit --incremental

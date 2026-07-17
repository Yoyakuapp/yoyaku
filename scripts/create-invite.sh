#!/usr/bin/env bash
set -euo pipefail

read -r -p "招待先のメモ(店舗名など、任意): " label

printf '%s\n' "$label" | npx tsx scripts/create-invite.ts

#!/usr/bin/env bash
set -euo pipefail

read -r -p "Email: " admin_email
read -r -p "Name: " admin_name

read -rs -p "Password: " admin_password
printf '\n'
read -rs -p "Confirm password: " admin_password_confirm
printf '\n'

if [[ "$admin_password" != "$admin_password_confirm" ]]; then
  printf 'Passwords do not match.\n' >&2
  exit 1
fi

if [[ ${#admin_password} -lt 12 ]]; then
  printf 'Password must be at least 12 characters.\n' >&2
  exit 1
fi

printf '%s\n%s\n%s\n' "$admin_email" "$admin_name" "$admin_password" |
  npx tsx scripts/create-admin.ts

#!/usr/bin/env bash
set -euo pipefail

read -r -p "Organization name: " organization_name
read -r -p "Store name: " store_name
read -r -p "Slug (e.g. sakura-massage): " slug
read -r -p "Owner email: " owner_email
read -r -p "Owner name: " owner_name

read -rs -p "Owner password: " owner_password
printf '\n'
read -rs -p "Confirm password: " owner_password_confirm
printf '\n'

if [[ "$owner_password" != "$owner_password_confirm" ]]; then
  printf 'Passwords do not match.\n' >&2
  exit 1
fi

if [[ ${#owner_password} -lt 12 ]]; then
  printf 'Password must be at least 12 characters.\n' >&2
  exit 1
fi

read -r -p "Allow phone booking? (y/n): " allow_phone
read -r -p "Allow WhatsApp booking? (y/n): " allow_whatsapp
read -r -p "Allow Yoyaku booking? (y/n): " allow_yoyaku
read -r -p "WhatsApp number (leave blank if none): " whatsapp_number

printf '%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n' \
  "$organization_name" \
  "$store_name" \
  "$slug" \
  "$owner_email" \
  "$owner_name" \
  "$owner_password" \
  "$allow_phone" \
  "$allow_whatsapp" \
  "$allow_yoyaku" \
  "$whatsapp_number" |
  npx tsx scripts/provision-store.ts

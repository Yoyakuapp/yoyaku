# 08 Development Guide

## 開発ガイド

Yoyakuの開発では、予約・決済・個人情報を扱うため、変更の安全性と再現性を重視します。

## ブランチ運用

- `main`: 本番反映可能な状態
- `feature/*`: 機能追加
- `fix/*`: 不具合修正
- `docs/*`: ドキュメント更新

## Migration

Prisma Migrationはスキーマ変更ごとに作成します。

- DBを削除しない
- `prisma migrate reset` は本番・共有環境で使用しない
- 本番反映は `prisma migrate deploy`
- Migration適用後はPrisma Clientを再生成する

## Prisma

Prisma schemaはDB構造の唯一の定義元です。予約、決済、認証に関わる変更は、必ずデータ整合性とロールバック方針を確認します。

## Build

本番反映前に必ず実行します。

```bash
npm run build
```

## Test

予約重複判定、決済状態、認証など、事業上重要なロジックを優先してテストします。

```bash
npm test
```

## Commitルール

コミットは目的ごとに小さく分けます。

- `feat: add payment intent flow`
- `fix: prevent duplicate booking`
- `docs: add operation manual`
- `chore: update dependencies`

## Review

レビューでは以下を確認します。

- 予約・決済の整合性
- 個人情報の取り扱い
- 認証・認可
- Migrationの安全性
- build/test/lintの結果

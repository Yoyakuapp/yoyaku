# 03 Infrastructure

## インフラ構成

Yoyakuは、小さく始めて段階的に拡張できるマネージドサービス中心の構成を採用します。

## 開発環境

- Node.js
- Next.js
- Prisma CLI
- ローカル開発サーバー
- GitHubによるバージョン管理
- `.env` による環境変数管理

## 本番環境

- VercelでNext.jsをホスティング
- Neon PostgreSQLを本番DBとして利用
- Stripeを本番決済として利用
- GitHubをデプロイ元として利用

## データベース

データベースはNeon PostgreSQLを利用します。Prisma Migrationでスキーマ変更を管理し、本番反映は `prisma migrate deploy` を使用します。

## バックアップ

バックアップ方針は以下です。

- Neonの自動バックアップ機能を利用
- 重要な変更前にDBスナップショットを確認
- 復旧手順を定期的に見直す
- 顧客情報を含むため、バックアップの取り扱い権限を制限する

## 環境変数

主な環境変数は以下です。

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

環境変数はGitHubへコミットしません。Vercel、ローカル `.env`、CI環境で個別に管理します。

## CI/CD

基本方針は以下です。

- GitHubに変更をpush
- Pull Requestでレビュー
- Vercel Previewで確認
- mainブランチへのマージで本番デプロイ
- 本番DB Migrationは明示的に実行し、結果を確認する

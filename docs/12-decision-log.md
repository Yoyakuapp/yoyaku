# 12 Decision Log

## 開発の意思決定ログ

Yoyakuの重要な技術・事業・運用判断を時系列で記録します。後から判断の背景を確認できるように、決定事項だけでなく理由と代替案も残します。

## 記録フォーマット

```markdown
## YYYY-MM

### 決定事項

- 内容

### 理由

- 内容

### 代替案

- 内容

### 決定者

- 内容
```

## 2026-07

### 決定事項

- Next.jsを採用する。
- Prismaを採用する。
- Neonを採用する。
- Stripeを採用する。
- Tailwind CSSを採用する。
- GitHubをプロジェクトの正本とする。
- Codexを実装担当とする。
- ChatGPTを設計レビュー担当とする。

### 理由

- Next.jsは顧客向け画面、管理画面、APIをひとつのリポジトリで構築しやすい。
- PrismaはDB schema、migration、型安全なDBアクセスを一貫して管理できる。
- NeonはPostgreSQLをマネージドで利用でき、初期コストを抑えながら拡張しやすい。
- StripeはPaymentIntent、Webhook、返金APIが整っており、予約金決済に適している。
- Tailwind CSSは小規模チームでもUIを素早く構築しやすい。
- GitHubを正本にすることで、コード、ドキュメント、Issue、Pull Requestを一元管理できる。
- Codexはリポジトリ上の実装、修正、検証作業に適している。
- ChatGPTは設計、監査、仕様整理、レビューに適している。

### 代替案

- Next.jsの代替として、Nuxt、Remix、Rails、Laravelを検討可能。
- Prismaの代替として、Drizzle、TypeORM、直接SQLを検討可能。
- Neonの代替として、Supabase、Railway、RDS、Cloud SQLを検討可能。
- Stripeの代替として、Square、PayPal、GMO Payment Gatewayを検討可能。
- Tailwind CSSの代替として、CSS Modules、MUI、Chakra UIを検討可能。
- GitHubの代替として、GitLab、Bitbucket、Notion中心の運用を検討可能。
- Codexの代替として、人手実装または他のAI実装支援ツールを検討可能。
- ChatGPTの代替として、人手レビューまたは他の設計支援ツールを検討可能。

### 決定者

- Yoyakuプロジェクトオーナー

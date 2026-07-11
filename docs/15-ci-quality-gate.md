# 15 CI Quality Gate

## GitHub Actionsの目的

Yoyaku CIは、mainブランチへ入る変更が最低限の品質基準を満たしていることを自動確認するためのquality gateです。コード、Prisma schema、型、テスト、lint、buildを同じ順序で検査し、リリース前の見落としを減らします。

## 自動検査の内容

GitHub Actionsでは以下を順番に実行します。

1. `npx prisma validate`
2. `npx prisma generate`
3. `npx tsc --noEmit`
4. `npm test`
5. `npm run lint -- --max-warnings=0`
6. `npm run build`

CIではNeonへの接続、Prisma Migration、Stripe API通信、Vercelデプロイ、GitHubへのpushは行いません。buildに必要な環境変数は、CI専用の安全なダミー値を使用します。

## Pull Request運用

mainへ直接変更を入れず、Pull Requestを作成してCI結果を確認します。CIが成功し、レビューで問題がないことを確認してからmainへマージします。

## quality-gate失敗時の確認方法

1. GitHub Actionsの失敗したworkflowを開く。
2. `quality-gate` job内で失敗したstepを確認する。
3. ログから失敗したコマンドとエラー内容を確認する。
4. ローカルで同じコマンドを実行して再現する。
5. 修正後に再度Pull Requestへpushし、CIを再実行する。

## mainへ直接pushしない方針

mainは常にリリース可能な状態を保つブランチです。通常の開発ではfeatureブランチを作成し、Pull RequestとCIを通してmainへ反映します。

## GitHub Secretsへ秘密情報を登録する際の注意

CI quality gateでは本番の秘密情報を使いません。将来、デプロイや外部サービス連携用にGitHub Secretsを使う場合は、以下を守ります。

- `.env` の内容をそのまま貼り付けない
- 必要なsecretだけを登録する
- 本番secretと検証用secretを分ける
- secretをログへ出力しない
- secretの閲覧・更新権限を最小限にする

## mainブランチRulesetの設定方法

GitHubのRepository settingsでRulesetsを作成し、mainブランチを保護します。

1. Settingsを開く。
2. Rulesを開く。
3. Rulesetsを作成する。
4. 対象ブランチに`main`を指定する。
5. Pull Request必須を有効にする。
6. Required status checksに`quality-gate`を追加する。
7. force pushと削除を禁止する。
8. 管理者にもルールを適用するかを運用方針に合わせて決める。

## 緊急時の例外対応

緊急修正が必要な場合も、原則としてPull RequestとCIを通します。CI障害やGitHub障害で通常手順が使えない場合は、例外理由、実施者、影響範囲、後追い確認結果を`12-decision-log.md`またはIssueに記録します。

# 21 Data Migration Plan

## 目的

既存の単一店舗データを削除せず、将来の複数店舗対応に必要なOrganizationとStoreへ安全に紐づけます。

## 前提

- 現在はYoyakus SingleとしてOrganization 1件、Store 1件で運用します。
- 既存UIと予約フローは単一店舗のまま維持します。
- Neon本番相当DBへMigrationを適用する前に、Migration SQLをレビューします。
- `prisma migrate reset`、DB削除、`prisma db push` は使用しません。

## 既存データ移行手順

1. Organization、Store、StoreMemberを作成する。
2. 初期Organizationを1件作成する。
3. 初期Storeを1件作成する。
4. Booking、BookingPaymentAttempt、Staff、BusinessHour、HolidayへstoreIdをnullableで追加する。
5. 既存Bookingを初期Storeへbackfillする。
6. 既存BookingPaymentAttemptを初期Storeへbackfillする。
7. 既存Staffを初期Storeへbackfillする。
8. 既存BusinessHourを初期Storeへbackfillする。
9. 既存Holidayを初期Storeへbackfillする。
10. 既存AdminUserを初期StoreのSTORE_MANAGERとしてStoreMemberへ紐づける。
11. storeIdがNULLの既存行が残っていないことをMigration内で検査する。
12. storeIdをrequired化する。
13. BusinessHourとHolidayのunique制約を店舗単位へ変更する。

## 店舗単位制約

- BusinessHour: `@@unique([storeId, dayOfWeek])`
- Holiday: `@@unique([storeId, date])`

これにより、複数店舗が同じ曜日設定や同じ休業日を個別に持てます。

## ShiftにstoreIdを持たせない理由

ShiftはStaffに紐づき、StaffはStoreに所属します。そのためShiftにstoreIdを重複保持しなくても、Staff relation経由で店舗を一意に特定できます。

横断検索の性能上、ShiftへstoreIdを持たせる必要が出た場合は、実測後に追加します。Singleではデータ重複と不整合を避けます。

## 管理者権限移行

既存AdminUserは初期StoreのSTORE_MANAGERとしてStoreMemberへ登録します。将来はOrganization単位、Store単位、Platform単位のロールを追加できます。

## Stripe移行

新規PaymentIntentにはstoreIdをmetadataとして保存します。Webhook処理では、Stripe metadataのstoreIdとBookingPaymentAttemptのstoreIdが一致することを確認してから予約確定または失敗更新を行います。

既存PaymentAttemptは初期Storeへbackfillされます。

## 適用前チェック

Migration適用前に以下を確認します。

- Migration SQLに既存データ削除がない
- backfill後のNULL検査がある
- unique制約の変更が店舗単位になっている
- Prisma validateが通る
- TypeScript、Test、Lint、Buildが通る

## ロール設計

将来ロール:

- PLATFORM_ADMIN
- ORGANIZATION_ADMIN
- STORE_MANAGER
- STAFF

SingleではSTORE_MANAGERのみで運用します。

# 18 Multi-store Architecture

## 目的

Yoyakusは、1店舗向け完成製品であるYoyakus Singleを維持しながら、将来の複数店舗運用と予約流通ネットワークへ拡張できる基盤を持ちます。

## サービス段階

### Yoyakus Single

1店舗向けの予約・決済・管理画面です。SingleではOrganization 1件、Store 1件で運用します。画面上の店舗選択、複数店舗切替、横断検索は提供しません。

### Yoyakus Group

同一事業者が複数店舗を管理する段階です。Organization配下に複数Storeを持ち、管理者はStoreMemberとして店舗権限を持ちます。

### Yoyakus Network

複数事業者・複数店舗による地域の予約流通・送客ネットワークです。場所・日時・人数・施術時間・サービス内容で検索できる体験と、満席店舗から近隣参加店舗への送客を扱います。

### Yoyakus Platform

Yoyakus Single、Yoyakus Group、Yoyakus Networkを支える店舗運営共通基盤です。

## OrganizationとStore

- Organizationは事業者または運営単位です。
- Storeは実際に予約を受ける店舗です。
- Singleでは初期Organizationと初期Storeを1件ずつ作成し、既存データをすべて初期Storeへ紐づけます。
- Booking、BookingPaymentAttempt、Staff、BusinessHour、HolidayはStoreに所属します。
- ShiftはStaffに紐づくため、StaffのStoreから一意に店舗を特定します。

## StoreMemberとロール

StoreMemberはAdminUserとStoreの関係を表します。

将来ロール:

- PLATFORM_ADMIN
- ORGANIZATION_ADMIN
- STORE_MANAGER
- STAFF

SingleではSTORE_MANAGERだけで運用可能です。不要な権限画面や複数店舗切替UIはまだ実装しません。

## 今回実装する範囲

- Organization、Store、StoreMemberの追加
- 既存主要データへのstoreId追加
- 管理APIのStoreMemberによる店舗スコープ化
- 予約、空き時間、決済、Webhookの初期Storeスコープ化
- Stripe PaymentIntent metadataへのstoreId保存
- 既存単一店舗UIと予約導線の維持

## 今回実装しない範囲

- 複数店舗UI
- 店舗切替
- 横断検索
- 地図検索
- 位置情報取得
- SaaS課金
- 複数店舗管理ダッシュボード
- Yoyakus Platform上の追加機能

## 将来のAPI移行方針

既存APIは壊さず、内部的に初期Storeへ解決します。将来は次のように段階移行します。

- 特定店舗の公開情報: `/api/public/stores/[slug]`
- 特定店舗の空き確認: `/api/public/stores/[storeId]/availability`
- 横断検索: `/api/search/availability`
- 管理API: `/api/admin/stores/[storeId]/...`
- Webhook: `/api/stripe/webhook`

旧APIはSingle互換として残し、画面側を新APIへ移行してから廃止を検討します。

# 暗記サイト MVP（Next.js + Supabase）

## セットアップ
1. リポジトリ取得
   ```bash
   pnpm install
   ```
2. Supabase プロジェクト作成 → URL と anon key を取得し `.env.local` に設定
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=xxxxxxxx
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxx
   ```
3. Supabase SQL エディタで `supabase.sql` を実行（テーブル・RLS・RPC）
4. 開発起動
   ```bash
   pnpm dev
   ```

## 使い方
- トップでメールアドレスを入力して OTP ログイン
- 「カード管理」でカードを追加
- 「学習を開始」でSM-2に基づく復習

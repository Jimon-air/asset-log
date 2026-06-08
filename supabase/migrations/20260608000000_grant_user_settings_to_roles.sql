-- user_settings テーブルへの GRANT が欠落していたため保存が失敗していた
-- asset_snapshots と同様に anon / authenticated ロールに必要な権限を付与する
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.user_settings
  TO anon, authenticated;

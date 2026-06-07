-- asset_snapshots テーブルへの GRANT が欠落していたため 403 が発生していた
-- anon / authenticated ロールに必要な権限を付与する
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.asset_snapshots
  TO anon, authenticated;

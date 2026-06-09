-- デモデータ投入スクリプト
-- Supabase SQL Editor で実行してください
-- asset_snapshots: 2025年1〜6月（6ヶ月分）
-- user_settings: goal_amount = 6,000,000

DO $$
DECLARE
  uid uuid := '62c96be0-c348-4350-b7a9-d04215c8891a';
BEGIN

INSERT INTO public.asset_snapshots
  (user_id, snapshot_month, cash_amount, investment_trust_amount, stock_amount, buying_power_amount, other_amount, total_amount)
VALUES
  (uid, '2025-01-01', 850000, 1050000, 520000, 350000, 130000, 2900000),
  (uid, '2025-02-01', 880000, 1100000, 560000, 380000, 130000, 3050000),
  (uid, '2025-03-01', 900000, 1150000, 590000, 400000, 160000, 3200000),  -- 追加: 追加投資
  (uid, '2025-04-01', 920000, 1200000, 640000, 420000, 170000, 3350000),
  (uid, '2025-05-01', 950000, 1280000, 700000, 450000, 180000, 3560000),
  (uid, '2025-06-01', 980000, 1350000, 760000, 470000, 190000, 3750000)   -- 追加: 含み益増加
ON CONFLICT (user_id, snapshot_month) DO NOTHING;

INSERT INTO public.user_settings (user_id, goal_amount)
VALUES (uid, 6000000)
ON CONFLICT (user_id) DO UPDATE SET goal_amount = EXCLUDED.goal_amount, updated_at = now();

END $$;

insert into public.games (slug, name, description) values
  ('pokemon', 'ポケモン系', '旅の思い出や推しポケモンを語ろう。'),
  ('minecraft', 'Minecraft（マインクラフト）', '建築・冒険・日々の気づきをシェア。'),
  ('animal-crossing', 'あつまれ どうぶつの森', '島づくりと住民との暮らしをゆったり共有。'),
  ('mariokart-world', 'マリオカート ワールド', 'レースの感想と楽しかった出来事を語ろう。'),
  ('splatoon3', 'スプラトゥーン3', 'バトルの熱量やナイスプレイを分かち合おう。')
on conflict (slug) do nothing;

insert into public.categories (game_id, name, slug)
values
  (null, 'みんなの感想', 'general-impressions'),
  (null, '雑談', 'chat'),
  (null, '好き・推し語り', 'favorites'),
  (null, '印象に残ったシーン', 'memorable-scenes'),
  (null, '初心者の感想', 'beginner-impressions'),
  (null, 'アプデの感想', 'update-feedback'),
  (null, '質問・相談', 'questions'),
  (null, '一緒に遊ぶ人募集', 'looking-for-players')
on conflict (game_id, slug) do nothing;

insert into public.categories (game_id, name, slug)
values
  ((select id from public.games where slug = 'pokemon'), '旅の思い出', 'journey-memories'),
  ((select id from public.games where slug = 'pokemon'), '推しポケモン', 'favorite-pokemon'),
  ((select id from public.games where slug = 'minecraft'), '建築紹介', 'building-showcase'),
  ((select id from public.games where slug = 'minecraft'), '今日の冒険', 'todays-adventure'),
  ((select id from public.games where slug = 'animal-crossing'), '島づくり', 'island-design'),
  ((select id from public.games where slug = 'animal-crossing'), '住民の話', 'villager-talk'),
  ((select id from public.games where slug = 'mariokart-world'), 'レースの感想', 'race-impressions'),
  ((select id from public.games where slug = 'mariokart-world'), '面白かった出来事', 'fun-moments'),
  ((select id from public.games where slug = 'splatoon3'), 'バトルの感想', 'battle-impressions'),
  ((select id from public.games where slug = 'splatoon3'), 'ナイスプレイ共有', 'nice-plays')
on conflict (game_id, slug) do nothing;

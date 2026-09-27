# POLARIS DROP teaser

Ameluna 3rd Album「POLARIS DROP」(2026.09.28 release) の 9:16 / 15 秒ループ告知モーション。

| File | 役割 |
| --- | --- |
| `polaris-drop.template.html` | 編集用ソース（Canvas アニメーション本体） |
| `assets/jacket.webp` | ジャケット画像 (2000×2000) |
| `build.py` | ジャケットを data URI で埋め込み `polaris-drop.html` を生成 |
| `polaris-drop.html` | 生成物。Artifact として公開しているファイル |
| `export/export.cjs` | ヘッドレス Chromium でフレームを描画し ffmpeg で MP4 化 |

## MP4 書き出し（1080×1920 / 30fps / H.264）

必要なもの: Node.js 18+、Python 3、ネット接続（Google Fonts 読み込みのため）。

```sh
cd teaser
npm install                          # playwright + ffmpeg-static（ffmpeg も同梱される）
npx playwright install chromium      # 初回のみ
npm run export                       # -> dist/polaris-drop_1080x1920.mp4
```

`npm run export` は `build.py` を実行してから全 450 フレームを書き出します（1 分半ほど）。

### オプション

```sh
node export/export.cjs --loops 2                      # 30 秒（2 ループ）
node export/export.cjs --fps 60                       # 60fps
node export/export.cjs --audio song.wav               # 音源を付ける（AAC 192k、末尾 1 秒フェードアウト）
node export/export.cjs --crf 18 --out dist/x.mp4      # 画質（小さいほど高画質）と出力先
npm run export:loop2                                  # 30 秒版のショートカット
```

環境変数:

- `FFMPEG=/path/to/ffmpeg` — システムの ffmpeg を使う場合
- `CHROMIUM_PATH=/path/to/chrome` — Playwright の同梱ブラウザ以外を使う場合
- `EXPORT_PROXY=1` — TLS を中継するプロキシ下（クラウドのサンドボックス等）で Google Fonts を読むとき。通常の PC では不要

## 注意点

- **フォントが読めないと書き出しは止まります。** タイトル書体が代替フォントのまま動画化されるのを防ぐためです。承知の上で進めるなら `--allow-fallback-fonts`。
- **画面録画ではなく時刻指定で 1 コマずつ描画**するため、PC の性能に関係なくコマ落ちせず、最終フレームから 0 フレーム目へ自然につながります。
- マウス追従のパララックスは書き出し時は無効（中央固定）です。
- 出力は `yuv420p` / BT.709 / `+faststart` で、X・Instagram リール・TikTok・YouTube ショートにそのまま投稿できます。音なしのままでも投稿可能です。
- 演出を変えたら `polaris-drop.template.html` を編集し、`npm run export` を再実行するだけで反映されます（`build.py` も自動で走ります）。

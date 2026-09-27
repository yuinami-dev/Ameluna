# POLARIS DROP teaser

Ameluna 3rd Album「POLARIS DROP」(2026.09.28 release) の 9:16 / 15 秒ループ告知モーション。

| File | 役割 |
| --- | --- |
| `polaris-drop.template.html` | 編集用ソース（Canvas アニメーション本体） |
| `assets/jacket.webp` | ジャケット画像 (2000×2000) |
| `build.py` | ジャケットを data URI で埋め込み `polaris-drop.html` を生成 |
| `audio/make-chorus.sh` | 曲からサビ前後 15 秒を切り出し `audio/chorus.mp3` を作る |
| `polaris-drop.html` | 生成物（git 管理外）。Artifact として公開しているファイル |
| `export/export.cjs` | ヘッドレス Chromium でフレームを描画し ffmpeg で MP4 化 |

## サウンド

曲「ポラリスドロップ」の 1 番サビ（45.32 秒、106 BPM）が、星が着地する 5.0 秒ちょうどに入るよう 40.32〜55.32 秒を切り出しています。
0.8 秒のフェードインと、13〜15 秒のフェードアウト（映像のネイビーへの暗転と同期）を焼き込み済みです。

```sh
cd teaser
npm install
sh audio/make-chorus.sh /path/to/ポラリスドロップ.mp3   # -> audio/chorus.mp3
```

このリポジトリは public なので、音源（`audio/*.mp3`）と音源入りの `polaris-drop.html` は `.gitignore` で除外しています。
ブラウザでは自動再生が止められるため、画面上の「音ありで再生」かスピーカーボタンで音が出ます。音を出している間は音声の時計に合わせて映像を描画するので、ずれません。

## MP4 書き出し（1080×1920 / 30fps / H.264）

必要なもの: Node.js 18+、Python 3、ネット接続（Google Fonts 読み込みのため）。

```sh
cd teaser
npm install                          # playwright + ffmpeg-static（ffmpeg も同梱される）
npx playwright install chromium      # 初回のみ
npm run export                       # -> dist/polaris-drop_1080x1920.mp4
```

`audio/chorus.mp3` があれば自動で AAC 192kbps の音声として入ります。音なし版は `--no-audio` を付けてください。

`npm run export` は `build.py` を実行してから全 450 フレームを書き出します（1 分半ほど）。

### オプション

```sh
node export/export.cjs --loops 2                      # 30 秒（2 ループ）
node export/export.cjs --fps 60                       # 60fps
node export/export.cjs --audio other.wav              # 別の音源を使う（末尾 1 秒フェードアウトを付加）
node export/export.cjs --no-audio                     # 音なし
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
- 出力は `yuv420p` / BT.709 / `+faststart` で、X・Instagram リール・TikTok・YouTube ショートにそのまま投稿できます。
- 演出を変えたら `polaris-drop.template.html` を編集し、`npm run export` を再実行するだけで反映されます（`build.py` も自動で走ります）。

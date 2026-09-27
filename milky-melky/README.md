# Milky Melky motion

Ameluna 3rd Album「POLARIS DROP」Track 03「ミルキーメルキー / Milky Melky」の 16:9 / 30 秒モーション（1920×1080 Canvas）。

| File | 役割 |
| --- | --- |
| `milky-melky.template.html` | 編集用ソース（Canvas アニメーション本体） |
| `assets/illust.webp` | イラスト (1672×941) |
| `audio/make-clip.sh` | 曲から 30 秒（Bメロ頭〜1番サビ終わり）を切り出し `audio/clip.mp3` を作る |
| `build.py` | イラストと音源を data URI で埋め込み `milky-melky.html` を生成 |
| `milky-melky.html` | 生成物（git 管理外）。Artifact として公開しているファイル |

## 構成（128 BPM、1 小節 = 1.875 秒）

曲の 35.606〜65.606 秒を使用。Bメロ 8 小節で溜めて、t = 15.0 秒ちょうどに 1 番サビが入ります。

| 時間 | 歌詞 | 演出 |
| --- | --- | --- |
| 0.0–3.75 | ひとりの時も 浮かぶ顔 | ミルクの一滴 → 波紋 → 円形ポータルで顔が開く |
| 3.75–7.5 | 理由もなくて 笑っちゃう | 寄りのアップ、瞳のきらめきと頬のハートが拍で弾む |
| 7.5–11.25 | 静かに満ちてく この気持ち | いちごミルクの溶けるカーテン → ラテから顔へパン、ミルクが満ちる |
| 11.25–15.0 | 大事に包んで | カードに引いてリボンでラッピング → 夜空に暗転、星の雫が落ちる |
| 15.0–18.75 | ミルキーメルキー 溶けてゆくように | ドロップ：フラッシュ・紙吹雪・タイトル。「溶けてゆく」で文字が垂れる |
| 18.75–22.5 | 甘い想いが 広がってく | ハート型アイリス、胸元からハートの輪が広がる |
| 22.5–26.25 | ミルキーメルキー 優しい時間が | 空色＋マーキー、ポラロイドとステッカー |
| 26.25–30.0 | 胸の奥で 光ってる | 胸元に北極星の光 → ミルクに溶けてエンドカード |

```sh
FFMPEG=/path/to/ffmpeg sh audio/make-clip.sh /path/to/milky-melky.mp3   # -> audio/clip.mp3
python3 build.py                                                         # -> milky-melky.html
```

音源は未発表曲でこのリポジトリは public なので、`audio/*.mp3` と `milky-melky.html` は `.gitignore` で除外しています。
`window.polarisExport` は teaser と同じ形なので、`teaser/export/export.cjs` を流用して MP4 化できます（パスと解像度の差し替えが必要）。

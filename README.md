# 小译同学 · iPad 本地课本点读

给家里小学生使用的译林版英语课本点读与练习工具。当前教材数据覆盖三至六年级上下册共 8 册、64 个单元、784 页，全部从家庭持有的教材 PDF 生成。

教材导入 iPad 后，翻页、点读、练习和语音播放都在 iPad 上完成：不需要电脑保持开机，不需要连接同一 Wi‑Fi，也不需要后台服务器。

## iPad 使用方法

1. 用 iPad Safari 打开 [小译同学](https://tideonezpp.github.io/xiaoyi-english/)。
2. 点“共享”→“添加到主屏幕”，再从桌面打开“小译同学”。
3. 把 `textbooks/packages/` 中需要的 `.xiaoyi` 教材包保存到 iPad“文件”App。可通过 iCloud Drive、OneDrive、网盘或一次性文件传输完成。
4. 点“从‘文件’加入课本”，一次选择一册或多册。
5. 导入完成后即可断网使用，电脑可以关闭。

每册教材包约 18–20 MB，8 册合计约 154 MB。建议使用 iPadOS 17 或更高版本，并从主屏幕运行，以获得更可靠的本地存储。

## 已实现功能

- 课本整页展示，横竖屏自动适配。
- 点击课页英文区域直接朗读。
- 长按选择英文后朗读。
- 点词跟读、听音辨句、原句补全、句子排序。
- 每道练习标注课本来源页码。
- 单册导入、重复导入覆盖更新、继续加入其他册次。
- 教材保存在 iPad IndexedDB，本地读取不发起网络请求。

## 数据与隐私

- `.xiaoyi` 教材包、PDF、课页图片和 OCR 数据均被 Git 忽略，不上传公开 GitHub。
- GitHub 只保存程序、教材包生成脚本和 HTML 使用说明。
- 没有账号、儿童资料上传、录音上传或学习数据库服务器。
- iPad 只保存教材、上次阅读册次与页码。
- 清除 Safari 网站数据或删除主屏幕 Web App 后，可能需要重新导入教材包。
- 语音使用 iPad 自带的英文合成语音，不是出版社配套真人录音。

## 生成 iPad 教材包

家庭本地 PDF 位于 `textbooks/` 时运行：

```powershell
python scripts/build-textbook-data.py --packages
```

输出目录为 `textbooks/packages/`，每册对应一个 `.xiaoyi` 文件。包内包含该册课页图片、点读坐标、已审核的单元信息和课本来源练习数据。

## 开发命令

```bash
npm install
npm run dev
npm run build
```

`启动学习.bat` 仅保留给本地开发和内容审核，不再是 iPad 日常使用的必要条件。

完整说明见 [HTML 使用说明](https://tideonezpp.github.io/xiaoyi-english/guide.html)。

# 四年級中文詞語彈弓大冒險 (Angry Birds 詞語大作戰)

專為小學四年級學生設計的互動中文詞語學習平台，結合經典彈弓射擊闖關機制，涵蓋課文重點字詞對照、多套隨機題庫練習與即時反饋獎勵。

---

## 🚀 如何發布至 GitHub Pages (How to publish through GitHub)

本專案已為您配置好 **`vite.config.ts` (相對路徑 `base: './'`)** 以及 **GitHub Actions 自動部署工作流程 (`.github/workflows/deploy.yml`)**。

### 步驟 1：建立 GitHub 儲存庫 (Create Repository)
1. 登入 [GitHub](https://github.com/)。
2. 點擊右上角的 **+** 號，選擇 **New repository**。
3. 輸入儲存庫名稱（例如：`p4-chinese-angrybirds`）。
4. 設定為 **Public**（公開），不要勾選「Initialize this repository with a README」（因為本地已有程式碼）。
5. 點擊 **Create repository**。

---

### 步驟 2：將本地專案推送到 GitHub (Push Code to GitHub)
在您的專案根目錄開啟終端機（Terminal / PowerShell），依序執行以下指令：

```bash
# 1. 初始化 Git 倉庫（若尚未初始化）
git init

# 2. 將所有檔案加入暫存區
git add .

# 3. 提交變更
git commit -m "feat: initial commit for P4 Chinese Angry Birds vocabulary quiz"

# 4. 將預設分支命名為 main
git branch -M main

# 5. 關聯您的遠端 GitHub 儲存庫（請將 YOUR-USERNAME 及 REPO-NAME 替換為您的 GitHub 帳號與專案名）
git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git

# 6. 推送至 GitHub
git push -u origin main
```

---

### 步驟 3：在 GitHub 開啟自動發布 (Enable GitHub Pages)
1. 前往您剛剛建立的 GitHub 專案頁面。
2. 點擊頂部的 **Settings**（設定）標籤頁。
3. 在左側側邊欄點擊 **Pages**。
4. 在 **Build and deployment** > **Source** 下拉選單中：
   - 選擇 **GitHub Actions**。
5. GitHub 會自動偵測到專案中的 `.github/workflows/deploy.yml` 並開始自動編譯與部署！

---

### 步驟 4：查看上線網站 (Access Your Live Website)
- 大約等待 1~2 分鐘後，可在專案的 **Actions** 標籤頁看到綠色勾勾 ✅。
- 返回 **Settings** > **Pages**，頂部會顯示您的專屬網址：
  ```
  https://<你的GitHub用戶名>.github.io/<儲存庫名稱>/
  ```
- 學生及家長點擊該網址即可在任何電腦、iPad、平板或手機上直接遊玩與練習！

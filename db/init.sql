-- データベースの文字コードをUTF-8に設定
CREATE DATABASE IF NOT EXISTS pos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE pos_db;

-- テーブルの文字コードをUTF-8に設定
CREATE TABLE IF NOT EXISTS taxes (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    CODE CHAR(2) UNIQUE NOT NULL,
    NAME VARCHAR(20) NOT NULL,
    PERCENT DECIMAL(5, 2) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
    PRD_ID INT AUTO_INCREMENT PRIMARY KEY,
    CODE CHAR(13) UNIQUE NOT NULL,
    NAME VARCHAR(50) NOT NULL,
    PRICE DECIMAL(10, 2) NOT NULL,
    TAX_CD CHAR(2),
    FOREIGN KEY (TAX_CD) REFERENCES taxes(CODE)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transactions (
    TRD_ID INT AUTO_INCREMENT PRIMARY KEY,
    DATETIME TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    EMP_CD CHAR(10) NOT NULL,
    STORE_CD CHAR(5) NOT NULL,
    POS_NO CHAR(10) NOT NULL,
    TOTAL_AMT DECIMAL(10, 2) NOT NULL,
    TTL_AMT_EX_TAX DECIMAL(10, 2) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transaction_details (
    TRD_ID INT NOT NULL,
    DTL_ID INT AUTO_INCREMENT PRIMARY KEY,
    PRD_ID INT,
    PRD_CODE CHAR(13),
    PRD_NAME VARCHAR(50),
    PRD_PRICE DECIMAL(10, 2),
    TAX_CD CHAR(2),
    FOREIGN KEY (TRD_ID) REFERENCES transactions(TRD_ID),
    FOREIGN KEY (PRD_ID) REFERENCES products(PRD_ID),
    FOREIGN KEY (TAX_CD) REFERENCES taxes(CODE)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 初期税率の追加
INSERT INTO taxes (CODE, NAME, PERCENT) VALUES ('1', '10% Tax', 10.00), ('2', '8% Tax', 8.00);

-- 商品の追加
INSERT INTO products (CODE, NAME, PRICE, TAX_CD) VALUES
('4902102070192', 'カップラーメン 醤油味', 200, '1'),
('4902102070208', 'カップラーメン 塩味', 200, '1'),
('4902102070215', 'カップラーメン 味噌味', 200, '1'),
('4901777031922', 'おにぎり 鮭', 120, '1'),
('4901777031939', 'おにぎり 梅', 120, '1'),
('4901777031946', 'おにぎり ツナマヨ', 130, '1'),
('4901330573816', 'サンドイッチ ハム&チーズ', 250, '1'),
('4901330573823', 'サンドイッチ エッグ', 240, '1'),
('4901330573830', 'サンドイッチ 野菜ミックス', 230, '1'),
('4901360286441', 'サラダ チキン', 280, '1'),
('4901360286458', 'サラダ シーフード', 300, '1'),
('4901360286465', 'サラダ ミックス', 290, '1'),
('4901777010002', 'お茶 500ml', 100, '1'),
('4901777010019', 'お茶 2L', 150, '1'),
('4901777010026', 'ミネラルウォーター 500ml', 90, '1'),
('4901777010033', 'ミネラルウォーター 2L', 130, '1'),
('4901777010040', 'スポーツドリンク 500ml', 120, '1'),
('4901777010057', 'スポーツドリンク 2L', 170, '1'),
('4901777010064', 'コーラ 500ml', 150, '1'),
('4901777010071', 'コーラ 1.5L', 200, '1'),
('4901777010088', 'ジュース オレンジ 500ml', 140, '1'),
('4901777010095', 'ジュース アップル 500ml', 140, '1'),
('4901777010101', 'アイスクリーム バニラ', 100, '1'),
('4901777010118', 'アイスクリーム チョコ', 100, '1'),
('4901777010125', 'アイスクリーム 抹茶', 120, '1'),
('4901777010132', 'パン クリーム', 150, '1'),
('4901777010149', 'パン チョコ', 150, '1'),
('4901777010156', 'パン メロン', 160, '1'),
('4901777010163', 'パン 食パン', 180, '1'),
('4901777010170', '菓子 チョコレート', 200, '1'),
('4901777010187', '菓子 ビスケット', 220, '1'),
('4901777010194', '菓子 ポテトチップス', 150, '1'),
('4901777010200', 'カレー レトルト', 300, '1'),
('4901777010217', 'スープ レトルト', 250, '1'),
('4901777010224', '鍋つゆ しょうゆ', 350, '1'),
('4901777010231', '鍋つゆ 味噌', 350, '1'),
('4901777010248', '鍋つゆ しお', 350, '1'),
('4901777010255', 'ティッシュペーパー', 200, '2'),
('4901777010262', 'トイレットペーパー', 250, '2'),
('4901777010279', '洗剤 食器用', 300, '2'),
('4901777010286', '洗剤 衣類用', 400, '2'),
('4901777010293', 'シャンプー', 500, '2'),
('4901777010309', 'コンディショナー', 500, '2'),
('4901777010316', 'ボディソープ', 600, '2'),
('4901777010323', 'ハンドソープ', 250, '2'),
('4901777010330', '歯磨き粉', 300, '2'),
('4901777010347', '歯ブラシ', 200, '2'),
('4901777010354', 'シェービングクリーム', 350, '2');

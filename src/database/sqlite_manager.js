const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class SQLiteManager {
    constructor(dbPath = 'mathdown_divination.db') {
        this.dbPath = path.resolve(dbPath);
        this.db = null;
        this.isConnected = false;
    }

    // 连接数据库
    async connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    this.isConnected = true;
                    this.initializeTables().then(resolve).catch(reject);
                }
            });
        });
    }

    // 初始化数据表
    async initializeTables() {
        const tables = [
            // 基础数据表
            `CREATE TABLE IF NOT EXISTS data_points (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                input_value REAL NOT NULL,
                output_value REAL NOT NULL,
                timestamp INTEGER NOT NULL,
                session_id TEXT,
                data_type TEXT DEFAULT 'manual',
                confidence REAL DEFAULT 0.0,
                source TEXT DEFAULT 'user_input'
            )`,
            
            // 预测历史表
            `CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                input_value REAL NOT NULL,
                predicted_value REAL NOT NULL,
                actual_value REAL,
                confidence REAL NOT NULL,
                method TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                accuracy REAL,
                session_id TEXT
            )`,
            
            // 模式识别表
            `CREATE TABLE IF NOT EXISTS patterns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pattern_type TEXT NOT NULL,
                pattern_data TEXT NOT NULL,
                frequency INTEGER DEFAULT 1,
                accuracy REAL DEFAULT 0.0,
                last_seen INTEGER NOT NULL,
                created_at INTEGER NOT NULL
            )`,
            
            // 占卜会话表
            `CREATE TABLE IF NOT EXISTS divination_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE NOT NULL,
                session_type TEXT NOT NULL,
                start_time INTEGER NOT NULL,
                end_time INTEGER,
                total_predictions INTEGER DEFAULT 0,
                successful_predictions INTEGER DEFAULT 0,
                average_confidence REAL DEFAULT 0.0,
                notes TEXT
            )`,
            
            // 随机事件表
            `CREATE TABLE IF NOT EXISTS random_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type TEXT NOT NULL,
                event_data TEXT NOT NULL,
                hash_value TEXT,
                timestamp INTEGER NOT NULL,
                source_url TEXT,
                randomness_score REAL DEFAULT 0.0
            )`,
            
            // 黄金分割计算表
            `CREATE TABLE IF NOT EXISTS golden_ratio_calculations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                input_sequence TEXT NOT NULL,
                fibonacci_level INTEGER,
                golden_ratio_value REAL,
                calculation_type TEXT,
                result_value REAL,
                timestamp INTEGER NOT NULL
            )`
        ];

        for (const tableSQL of tables) {
            await this.runQuery(tableSQL);
        }

        // 创建索引
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_data_points_timestamp ON data_points(timestamp)',
            'CREATE INDEX IF NOT EXISTS idx_predictions_timestamp ON predictions(timestamp)',
            'CREATE INDEX IF NOT EXISTS idx_patterns_type ON patterns(pattern_type)',
            'CREATE INDEX IF NOT EXISTS idx_sessions_id ON divination_sessions(session_id)',
            'CREATE INDEX IF NOT EXISTS idx_random_events_type ON random_events(event_type)'
        ];

        for (const indexSQL of indexes) {
            await this.runQuery(indexSQL);
        }
    }

    // 执行SQL查询
    runQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        });
    }

    // 查询数据
    queryData(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // 添加数据点
    async addDataPoint(input, output, sessionId = null, dataType = 'manual', source = 'user_input') {
        const sql = `INSERT INTO data_points 
                    (input_value, output_value, timestamp, session_id, data_type, source) 
                    VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [input, output, Date.now(), sessionId, dataType, source];
        return await this.runQuery(sql, params);
    }

    // 记录预测
    async recordPrediction(input, predicted, confidence, method, sessionId = null) {
        const sql = `INSERT INTO predictions 
                    (input_value, predicted_value, confidence, method, timestamp, session_id) 
                    VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [input, predicted, confidence, method, Date.now(), sessionId];
        return await this.runQuery(sql, params);
    }

    // 更新预测准确性
    async updatePredictionAccuracy(predictionId, actualValue) {
        const prediction = await this.queryData(
            'SELECT predicted_value FROM predictions WHERE id = ?', 
            [predictionId]
        );
        
        if (prediction.length > 0) {
            const predicted = prediction[0].predicted_value;
            const accuracy = 1 - Math.abs(actualValue - predicted) / (Math.abs(actualValue) + 1e-8);
            
            const sql = 'UPDATE predictions SET actual_value = ?, accuracy = ? WHERE id = ?';
            return await this.runQuery(sql, [actualValue, accuracy, predictionId]);
        }
    }

    // 保存模式
    async savePattern(patternType, patternData, frequency = 1) {
        const existingPattern = await this.queryData(
            'SELECT id, frequency FROM patterns WHERE pattern_type = ? AND pattern_data = ?',
            [patternType, JSON.stringify(patternData)]
        );

        if (existingPattern.length > 0) {
            // 更新现有模式
            const sql = 'UPDATE patterns SET frequency = ?, last_seen = ? WHERE id = ?';
            return await this.runQuery(sql, [
                existingPattern[0].frequency + frequency,
                Date.now(),
                existingPattern[0].id
            ]);
        } else {
            // 创建新模式
            const sql = `INSERT INTO patterns 
                        (pattern_type, pattern_data, frequency, last_seen, created_at) 
                        VALUES (?, ?, ?, ?, ?)`;
            const now = Date.now();
            return await this.runQuery(sql, [
                patternType, JSON.stringify(patternData), frequency, now, now
            ]);
        }
    }

    // 获取历史数据
    async getHistoricalData(limit = 1000) {
        const sql = `SELECT input_value, output_value, timestamp 
                    FROM data_points 
                    ORDER BY timestamp DESC 
                    LIMIT ?`;
        return await this.queryData(sql, [limit]);
    }

    // 分析数据模式
    async analyzePatterns() {
        const results = {};

        // 获取最常见的模式
        results.commonPatterns = await this.queryData(
            'SELECT pattern_type, COUNT(*) as count FROM patterns GROUP BY pattern_type ORDER BY count DESC LIMIT 10'
        );

        // 获取预测准确性统计
        results.predictionStats = await this.queryData(
            `SELECT method, 
                    COUNT(*) as total_predictions,
                    AVG(confidence) as avg_confidence,
                    AVG(accuracy) as avg_accuracy
             FROM predictions 
             WHERE accuracy IS NOT NULL 
             GROUP BY method`
        );

        // 获取数据趋势
        results.dataTrends = await this.queryData(
            `SELECT 
                DATE(timestamp/1000, 'unixepoch') as date,
                COUNT(*) as data_points,
                AVG(input_value) as avg_input,
                AVG(output_value) as avg_output
             FROM data_points 
             WHERE timestamp > ? 
             GROUP BY DATE(timestamp/1000, 'unixepoch')
             ORDER BY date DESC
             LIMIT 30`,
            [Date.now() - 30 * 24 * 60 * 60 * 1000] // 最近30天
        );

        return results;
    }

    // 寻找相似模式
    async findSimilarPatterns(inputValue, tolerance = 0.1) {
        const sql = `SELECT input_value, output_value, timestamp 
                    FROM data_points 
                    WHERE ABS(input_value - ?) <= ? 
                    ORDER BY ABS(input_value - ?) ASC 
                    LIMIT 10`;
        return await this.queryData(sql, [inputValue, tolerance, inputValue]);
    }

    // 记录随机事件
    async recordRandomEvent(eventType, eventData, hashValue = null, sourceUrl = null) {
        const sql = `INSERT INTO random_events 
                    (event_type, event_data, hash_value, timestamp, source_url) 
                    VALUES (?, ?, ?, ?, ?)`;
        return await this.runQuery(sql, [
            eventType, JSON.stringify(eventData), hashValue, Date.now(), sourceUrl
        ]);
    }

    // 保存黄金分割计算
    async saveGoldenRatioCalculation(inputSequence, fibLevel, goldenValue, calcType, result) {
        const sql = `INSERT INTO golden_ratio_calculations 
                    (input_sequence, fibonacci_level, golden_ratio_value, calculation_type, result_value, timestamp) 
                    VALUES (?, ?, ?, ?, ?, ?)`;
        return await this.runQuery(sql, [
            JSON.stringify(inputSequence), fibLevel, goldenValue, calcType, result, Date.now()
        ]);
    }

    // 创建占卜会话
    async createDivinationSession(sessionType) {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const sql = `INSERT INTO divination_sessions 
                    (session_id, session_type, start_time) 
                    VALUES (?, ?, ?)`;
        await this.runQuery(sql, [sessionId, sessionType, Date.now()]);
        return sessionId;
    }

    // 结束占卜会话
    async endDivinationSession(sessionId) {
        // 计算会话统计
        const stats = await this.queryData(
            `SELECT COUNT(*) as total, AVG(confidence) as avg_conf 
             FROM predictions WHERE session_id = ?`,
            [sessionId]
        );

        const sql = `UPDATE divination_sessions 
                    SET end_time = ?, total_predictions = ?, average_confidence = ? 
                    WHERE session_id = ?`;
        return await this.runQuery(sql, [
            Date.now(),
            stats[0]?.total || 0,
            stats[0]?.avg_conf || 0,
            sessionId
        ]);
    }

    // 获取占卜统计
    async getDivinationStats() {
        const stats = {};

        // 总体统计
        stats.overall = await this.queryData(
            `SELECT 
                COUNT(*) as total_data_points,
                (SELECT COUNT(*) FROM predictions) as total_predictions,
                (SELECT COUNT(*) FROM patterns) as total_patterns,
                (SELECT AVG(confidence) FROM predictions) as avg_confidence
             FROM data_points`
        );

        // 最近活动
        stats.recentActivity = await this.queryData(
            `SELECT 
                DATE(timestamp/1000, 'unixepoch') as date,
                COUNT(*) as activity_count
             FROM data_points 
             WHERE timestamp > ?
             GROUP BY DATE(timestamp/1000, 'unixepoch')
             ORDER BY date DESC
             LIMIT 7`,
            [Date.now() - 7 * 24 * 60 * 60 * 1000]
        );

        return stats;
    }

    // 关闭数据库连接
    async close() {
        return new Promise((resolve) => {
            if (this.db) {
                this.db.close((err) => {
                    this.isConnected = false;
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    // 备份数据库
    async backup(backupPath) {
        const fs = require('fs');
        return new Promise((resolve, reject) => {
            const readStream = fs.createReadStream(this.dbPath);
            const writeStream = fs.createWriteStream(backupPath);
            
            readStream.pipe(writeStream);
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
    }
}

module.exports = { SQLiteManager };
const readlineSync = require('readline-sync');
const MathDown = require('./src/mathdown');
const { RandomOracle } = require('./src/divination/random_oracle');
const { GoldenRatio } = require('./src/algorithms/golden_ratio');
const { SQLiteManager } = require('./src/database/sqlite_manager');
const AdvancedMath = require('./src/algorithms/advanced_math');
const { displayBanner, displayHelp, showSuccess: displaySuccess, showError: displayError, showInfo: displayInfo, displayPredictionResult, displayAnalysisResult } = require('./src/utils/display');

class MathDownCLI {
    constructor() {
        this.mathdown = new MathDown();
        this.oracle = new RandomOracle();
        this.golden = new GoldenRatio();
        this.db = new SQLiteManager();
        this.advancedMath = new AdvancedMath();
        this.running = true;
        this.initializeDatabase();
    }

    async initializeDatabase() {
        try {
            await this.db.connect();
            displaySuccess('数据库连接成功！');
        } catch (error) {
            displayError('数据库连接失败: ' + error.message);
        }
    }

    async start() {
        displayBanner();
        console.log('欢迎使用 MathDown - 数学规律占卜工具!');
        console.log('输入 "help" 查看命令列表\n');

        while (this.running) {
            const input = readlineSync.question('MathDown> ');
            await this.processCommand(input.trim());
        }
    }

    async processCommand(command) {
        const [cmd, ...args] = command.split(' ');

        switch (cmd.toLowerCase()) {
            case 'help':
                this.showHelp();
                break;
            case 'add':
                this.addData(args);
                break;
            case 'predict':
                this.predict(args);
                break;
            case 'list':
                this.listData();
                break;
            case 'clear':
                this.clearData();
                break;
            case 'save':
                this.saveData(args[0]);
                break;
            case 'load':
                this.loadData(args[0]);
                break;
            case 'analyze':
                this.analyzePattern();
                break;
            // 彩票预测
             case 'lottery':
                 await this.handleLottery(args[0] || 'double_color_ball');
                 break;

             // 股票预测
             case 'stock':
                 await this.handleStock(args[0] || 'UNKNOWN');
                 break;

             // 掷骰子
             case 'dice':
                 await this.handleDice(parseInt(args[0]) || 6, parseInt(args[1]) || 1);
                 break;

             // 幸运数字
             case 'lucky':
                 await this.handleLucky(parseInt(args[0]) || 5);
                 break;

             // 随机选择
             case 'choice':
                 await this.handleChoice(args.join(' '));
                 break;

             // 运势预测
             case 'fortune':
                 await this.handleFortune();
                 break;

             // 黄金分割占卜
             case 'golden-divination':
                 await this.handleGolden(args.join(' '));
                 break;

             // 神经网络预测
             case 'neural-predict':
                 await this.handleNeural(args.join(' '));
                 break;

             // 矩阵随机生成
             case 'matrix-random':
                 await this.handleMatrixRandom(parseInt(args[0]) || 3, parseInt(args[1]) || 3);
                 break;

             // 矩阵占卜
             case 'matrix-divination':
                 await this.handleMatrixDivination(args.join(' '));
                 break;

             // PI值计算
             case 'pi-calculate':
                 await this.handlePICalculate(args[0] || 'leibniz');
                 break;

             // PI值占卜
             case 'pi-divination':
                 await this.handlePIDivination(args.join(' '));
                 break;

             // 数值积分
             case 'integrate':
                 await this.handleIntegrate(args[0], parseFloat(args[1]), parseFloat(args[2]));
                 break;

             // 数值微分
             case 'differentiate':
                 await this.handleDifferentiate(args[0], parseFloat(args[1]));
                 break;

             // 综合数学占卜
             case 'math-divination':
                 await this.handleMathDivination(args.join(' '));
                 break;

             // 随机MIDI生成
             case 'midi-random':
                 await this.handleMIDIRandom(parseInt(args[0]) || 16);
                 break;

             // 数学函数MIDI
             case 'midi-math':
                 await this.handleMIDIMath(args[0] || 'sin');
                 break;

             // 判断题预测
             case 'predict-tf':
                 await this.handlePredictTF(args.join(' '));
                 break;

             // 选择题预测
             case 'predict-choice':
                 await this.handlePredictChoice(args.join(' '));
                 break;

             // 数学题预测
             case 'predict-math':
                 await this.handlePredictMath(args.join(' '));
                 break;

            // 斐波那契
            case 'fibonacci':
                this.handleFibonacci(parseInt(args[0]) || 10);
                break;

            // 黄金比例预测
            case 'golden-predict':
                this.handleGoldenPredict(args.join(' '));
                break;

            // 网络随机数
            case 'web-random':
                await this.handleWebRandom();
                break;

            // 统计信息
            case 'stats':
                await this.handleStats();
                break;

            // 备份数据库
            case 'backup':
                await this.handleBackup();
                break;

            case 'exit':
            case 'quit':
                await this.cleanup();
                this.exit();
                break;
            default:
                console.log('未知命令。输入 "help" 查看可用命令。');
        }
    }

    addData(args) {
        if (args.length < 2) {
            console.log('用法: add <输入值> <输出值>');
            return;
        }
        const input = parseFloat(args[0]);
        const output = parseFloat(args[1]);
        
        if (isNaN(input) || isNaN(output)) {
            console.log('请输入有效的数字');
            return;
        }

        this.mathdown.addDataPoint(input, output);
        console.log(`已添加数据点: ${input} -> ${output}`);
    }

    predict(args) {
        if (args.length < 1) {
            console.log('用法: predict <输入值>');
            return;
        }
        const input = parseFloat(args[0]);
        
        if (isNaN(input)) {
            console.log('请输入有效的数字');
            return;
        }

        const result = this.mathdown.predict(input);
        console.log(`\n=== 占卜结果 ===`);
        console.log(`输入值: ${input}`);
        console.log(`预测输出: ${result.prediction.toFixed(4)}`);
        console.log(`置信度: ${(result.confidence * 100).toFixed(2)}%`);
        console.log(`使用方法: ${result.method}`);
        console.log(`===============\n`);
    }

    listData() {
        const data = this.mathdown.getData();
        if (data.length === 0) {
            console.log('暂无数据');
            return;
        }
        
        console.log('\n=== 已收录的数据 ===');
        data.forEach((point, index) => {
            console.log(`${index + 1}. ${point.input} -> ${point.output}`);
        });
        console.log(`总计: ${data.length} 个数据点\n`);
    }

    clearData() {
        this.mathdown.clearData();
        console.log('已清空所有数据');
    }

    saveData(filename) {
        if (!filename) {
            filename = 'mathdown_data.json';
        }
        this.mathdown.saveToFile(filename);
        console.log(`数据已保存到 ${filename}`);
    }

    loadData(filename) {
        if (!filename) {
            filename = 'mathdown_data.json';
        }
        try {
            this.mathdown.loadFromFile(filename);
            console.log(`数据已从 ${filename} 加载`);
        } catch (error) {
            console.log(`加载失败: ${error.message}`);
        }
    }

    analyzePattern() {
        const analysis = this.mathdown.analyzePattern();
        console.log('\n=== 模式分析 ===');
        console.log(`数据点数量: ${analysis.dataCount}`);
        console.log(`平均输入: ${analysis.avgInput.toFixed(4)}`);
        console.log(`平均输出: ${analysis.avgOutput.toFixed(4)}`);
        console.log(`相关系数: ${analysis.correlation.toFixed(4)}`);
        console.log(`主要频率: ${analysis.dominantFrequency.toFixed(4)}`);
        console.log(`===============\n`);
    }

    showHelp() {
        console.log('\n🎯 MathDown - 数学规律占卜系统 🎯');
        console.log('作者：一个精神状态不太正常的开发者 😵‍💫\n');
        
        console.log('📊 数据管理:');
        console.log('  add <input> <output>  - 添加数据点');
        console.log('  list                  - 显示所有数据');
        console.log('  clear                 - 清除所有数据');
        console.log('  save <filename>       - 保存数据到文件');
        console.log('  load <filename>       - 从文件加载数据\n');
        
        console.log('🔮 预测功能:');
        console.log('  predict <input>       - 预测输出值');
        console.log('  analyze              - 分析数据模式\n');
        
        console.log('🎰 占卜娱乐:');
        console.log('  lottery [type]       - 彩票号码预测 (double_color_ball/super_lotto/three_d)');
        console.log('  stock [symbol]       - 股票趋势预测');
        console.log('  dice [sides] [count] - 掷骰子');
        console.log('  lucky [count]        - 生成幸运数字');
        console.log('  choice <opt1,opt2>   - 随机选择');
        console.log('  fortune              - 运势预测');
        console.log('  golden <numbers>     - 黄金分割占卜\n');
        
        console.log('🧮 高级算法:');
        console.log('  neural <data>        - 神经网络预测');
        console.log('  fibonacci <n>        - 斐波那契数列');
        console.log('  golden-predict <data> - 黄金比例预测');
        console.log('  web-random           - 网络随机数生成\n');
        
        console.log('⚙️ 系统命令:');
        console.log('  help                 - 显示帮助');
        console.log('  stats                - 显示统计信息');
        console.log('  backup               - 备份数据库');
        console.log('  exit                 - 退出程序\n');
        
        console.log('💡 使用示例:');
        console.log('  add 1 2              - 添加输入1，输出2的数据点');
        console.log('  predict 5            - 预测输入5的输出');
        console.log('  lottery              - 预测双色球号码');
        console.log('  stock AAPL           - 预测苹果股票');
        console.log('  choice 选项A,选项B,选项C - 随机选择一个选项\n');
        
        console.log('🔬 算法说明:');
        console.log('  • 多层卷积神经网络 - 深度学习模式识别');
        console.log('  • 傅里叶变换分析 - 频域特征提取');
        console.log('  • K近邻算法 - 相似性匹配预测');
        console.log('  • 黄金分割比例 - 自然界的神秘规律');
        console.log('  • 网络熵源随机数 - 真随机数生成\n');
        
        console.log('⚠️ 重要声明:');
        console.log('  此工具纯属娱乐，预测结果仅供参考！');
        console.log('  投资有风险，占卜需谨慎！');
        console.log('  作者精神状态异常，请理性使用！😂\n');
    }

    // 彩票预测处理
    async handleLottery(type) {
        try {
            displayInfo(`🎰 正在预测${type}彩票号码...`);
            const result = await this.oracle.predictLottery(type);
            
            console.log('\n🎯 彩票预测结果:');
            console.log(`类型: ${result.type}`);
            
            if (result.predictions.redBalls) {
                console.log(`红球: ${result.predictions.redBalls.join(', ')}`);
                console.log(`蓝球: ${result.predictions.blueBall}`);
            } else if (result.predictions.frontNumbers) {
                console.log(`前区: ${result.predictions.frontNumbers.join(', ')}`);
                console.log(`后区: ${result.predictions.backNumbers.join(', ')}`);
            } else if (result.predictions.numbers) {
                console.log(`号码: ${result.predictions.numbers.join('')}`);
            }
            
            console.log(`置信度: ${(result.confidence * 100).toFixed(1)}%`);
            console.log(`宇宙对齐度: ${(result.cosmicAlignment * 100).toFixed(1)}%`);
            console.log(`⚠️ ${result.disclaimer}`);
            
            // 保存到数据库
            await this.db.recordPrediction('lottery', JSON.stringify(result.predictions), result.confidence);
        } catch (error) {
            displayError('彩票预测失败: ' + error.message);
        }
    }

    // 股票预测处理
    async handleStock(symbol) {
        try {
            displayInfo(`📈 正在预测${symbol}股票趋势...`);
            const result = await this.oracle.predictStock(symbol);
            
            console.log('\n📊 股票预测结果:');
            console.log(`股票代码: ${result.symbol}`);
            console.log(`趋势: ${result.trend} ${result.trendEmoji}`);
            console.log(`预测变化: ${result.predictedChange}`);
            console.log(`波动率: ${result.volatility}`);
            console.log(`置信度: ${(result.confidence * 100).toFixed(1)}%`);
            console.log(`时间框架: ${result.timeframe}`);
            console.log(`宇宙影响: ${result.cosmicInfluence}`);
            console.log(`⚠️ ${result.disclaimer}`);
            
            await this.db.recordPrediction('stock', JSON.stringify(result), result.confidence);
        } catch (error) {
            displayError('股票预测失败: ' + error.message);
        }
    }

    // 掷骰子处理
    async handleDice(sides, count) {
        try {
            displayInfo(`🎲 掷${count}个${sides}面骰子...`);
            const result = await this.oracle.rollDice(sides, count);
            
            console.log('\n🎲 掷骰子结果:');
            console.log(`结果: ${result.results.join(', ')}`);
            console.log(`总和: ${result.sum}`);
            console.log(`平均值: ${result.average.toFixed(2)}`);
            
            await this.db.recordRandomEvent('dice', JSON.stringify(result));
        } catch (error) {
            displayError('掷骰子失败: ' + error.message);
        }
    }

    // 幸运数字处理
    async handleLucky(count) {
        try {
            displayInfo(`🍀 生成${count}个幸运数字...`);
            const result = await this.oracle.generateLuckyNumbers(count);
            
            console.log('\n🍀 幸运数字:');
            console.log(`数字: ${result.numbers.join(', ')}`);
            console.log(`范围: ${result.range}`);
            console.log(`幸运等级: ${result.luckyLevel}`);
            console.log(`宇宙对齐度: ${(result.cosmicAlignment * 100).toFixed(1)}%`);
        } catch (error) {
            displayError('生成幸运数字失败: ' + error.message);
        }
    }

    // 随机选择处理
    async handleChoice(optionsStr) {
        try {
            if (!optionsStr) {
                displayError('请提供选项，用逗号分隔。例如: choice 选项A,选项B,选项C');
                return;
            }
            
            const options = optionsStr.split(',').map(opt => opt.trim());
            displayInfo(`🎯 从${options.length}个选项中随机选择...`);
            
            const result = await this.oracle.randomChoice(options);
            
            console.log('\n🎯 随机选择结果:');
            console.log(`选择: ${result.choice}`);
            console.log(`位置: ${result.index + 1}/${result.totalOptions}`);
            console.log(`置信度: ${(result.confidence * 100).toFixed(1)}%`);
            
            await this.db.recordRandomEvent('choice', JSON.stringify(result));
        } catch (error) {
            displayError('随机选择失败: ' + error.message);
        }
    }

    // 运势预测处理
    async handleFortune() {
        try {
            displayInfo('🔮 正在预测运势...');
            const result = await this.oracle.predictRandomEvent();
            
            console.log('\n🔮 运势预测:');
            console.log(`总体运势: ${result.overallLuck}`);
            console.log(`宇宙对齐度: ${(result.cosmicAlignment * 100).toFixed(1)}%`);
            console.log('\n具体预测:');
            
            result.predictions.forEach(pred => {
                console.log(`  ${pred.event}: ${(pred.probability * 100).toFixed(1)}%`);
            });
            
            console.log(`\n⚠️ ${result.disclaimer}`);
            
            await this.db.recordPrediction('fortune', JSON.stringify(result), result.cosmicAlignment);
        } catch (error) {
            displayError('运势预测失败: ' + error.message);
        }
    }

    // 黄金分割占卜处理
    async handleGolden(question) {
        try {
            displayInfo('✨ 正在进行黄金分割占卜...');
            const result = this.golden.goldenDivination(question);
            
            console.log('\n✨ 黄金分割占卜结果:');
            if (question) console.log(`问题: ${question}`);
            console.log(`${result.interpretation.emoji} ${result.interpretation.meaning}`);
            console.log(`宇宙对齐度: ${(result.cosmicAlignment * 100).toFixed(1)}%`);
            console.log(`黄金建议: ${result.goldenAdvice}`);
            console.log(`幸运数字: ${result.luckyNumbers.numbers.join(', ')}`);
            console.log(`黄金比例 φ: ${result.phi.toFixed(6)}`);
            
            await this.db.saveGoldenRatioCalculation('divination', result.phi, JSON.stringify(result));
        } catch (error) {
            displayError('黄金分割占卜失败: ' + error.message);
        }
    }

    // 神经网络预测处理
    async handleNeural(dataStr) {
        try {
            if (!dataStr) {
                displayError('请提供数据，用逗号分隔。例如: neural 1,2,3,4,5');
                return;
            }
            
            const data = dataStr.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x));
            if (data.length < 2) {
                displayError('至少需要2个数据点');
                return;
            }
            
            displayInfo('🧠 正在使用神经网络预测...');
            
            // 使用现有的预测功能
            const result = this.mathdown.predict(data[data.length - 1]);
            
            console.log('\n🧠 神经网络预测结果:');
            console.log(`输入数据: [${data.join(', ')}]`);
            console.log(`预测结果: ${result.prediction.toFixed(4)}`);
            console.log(`置信度: ${(result.confidence * 100).toFixed(1)}%`);
            
            await this.db.recordPrediction('neural', JSON.stringify(result), result.confidence);
        } catch (error) {
            displayError('神经网络预测失败: ' + error.message);
        }
    }

    // 斐波那契处理
    handleFibonacci(n) {
        try {
            displayInfo(`🌀 生成斐波那契数列前${n}项...`);
            const sequence = this.golden.generateFibonacciSequence(n);
            
            console.log('\n🌀 斐波那契数列:');
            console.log(sequence.join(', '));
            
            if (n > 1) {
                const ratios = [];
                for (let i = 1; i < sequence.length; i++) {
                    if (sequence[i-1] !== 0) {
                        ratios.push(sequence[i] / sequence[i-1]);
                    }
                }
                console.log('\n📊 相邻项比值:');
                console.log(ratios.map(r => r.toFixed(6)).join(', '));
                console.log(`\n黄金比例 φ: ${this.golden.phi.toFixed(6)}`);
            }
        } catch (error) {
            displayError('斐波那契计算失败: ' + error.message);
        }
    }

    // 黄金比例预测处理
    handleGoldenPredict(dataStr) {
        try {
            if (!dataStr) {
                displayError('请提供数据，用逗号分隔。例如: golden-predict 1,1,2,3,5');
                return;
            }
            
            const data = dataStr.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x));
            if (data.length < 2) {
                displayError('至少需要2个数据点');
                return;
            }
            
            displayInfo('✨ 正在使用黄金比例预测...');
            const result = this.golden.goldenPredict(data);
            
            if (result) {
                console.log('\n✨ 黄金比例预测结果:');
                console.log(`输入序列: [${data.join(', ')}]`);
                console.log(`最终预测: ${result.finalPrediction.toFixed(4)}`);
                console.log(`置信度: ${(result.confidence * 100).toFixed(1)}%`);
                
                console.log('\n📊 各方法预测:');
                result.predictions.forEach(pred => {
                    console.log(`  ${pred.method}: ${pred.value.toFixed(4)} (置信度: ${(pred.confidence * 100).toFixed(1)}%)`);
                });
                
                if (result.goldenRelations.hasGoldenRatio) {
                    console.log('\n🎯 发现黄金比例关系!');
                    result.goldenRelations.goldenRelations.slice(0, 3).forEach(rel => {
                        console.log(`  ${rel.value1} / ${rel.value2} = ${rel.ratio.toFixed(4)} (差异: ${rel.difference.toFixed(4)})`);
                    });
                }
            } else {
                displayError('无法进行黄金比例预测');
            }
        } catch (error) {
            displayError('黄金比例预测失败: ' + error.message);
        }
    }

    // 网络随机数处理
    async handleWebRandom() {
        try {
            displayInfo('🌐 正在从网络获取随机熵...');
            const result = await this.oracle.getWebHashEntropy();
            
            console.log('\n🌐 网络随机数生成结果:');
            console.log(`访问网址: ${result.url}`);
            console.log(`哈希值: ${result.hash.substr(0, 32)}...`);
            console.log(`随机数字: ${result.numbers.slice(0, 10).join(', ')}`);
            console.log(`生成时间: ${new Date(result.timestamp).toLocaleString()}`);
            
            await this.db.recordRandomEvent('web_hash', JSON.stringify(result));
        } catch (error) {
            displayError('网络随机数生成失败: ' + error.message);
        }
    }

    // 统计信息处理
    async handleStats() {
        try {
            displayInfo('📊 正在获取统计信息...');
            
            const mathStats = this.mathdown.getStats();
            const entropyStats = this.oracle.getEntropyStats();
            const goldenConstants = this.golden.getConstants();
            
            console.log('\n📊 系统统计信息:');
            console.log('\n🔢 数据统计:');
            console.log(`  数据点数量: ${mathStats.dataPoints}`);
            console.log(`  预测次数: ${mathStats.predictions}`);
            console.log(`  平均置信度: ${(mathStats.averageConfidence * 100).toFixed(1)}%`);
            
            console.log('\n🎲 随机熵统计:');
            console.log(`  熵收集次数: ${entropyStats.entropyCollected}`);
            console.log(`  最后网络哈希: ${entropyStats.lastWebHash || '无'}`);
            console.log(`  宇宙对齐度: ${(entropyStats.cosmicAlignment * 100).toFixed(1)}%`);
            console.log(`  混沌等级: ${(entropyStats.chaosLevel * 100).toFixed(1)}%`);
            
            console.log('\n✨ 黄金比例常数:');
            console.log(`  φ (phi): ${goldenConstants.phi.toFixed(8)}`);
            console.log(`  1/φ: ${goldenConstants.inversePhi.toFixed(8)}`);
            console.log(`  黄金角度: ${goldenConstants.goldenAngleDegrees.toFixed(2)}°`);
            
            // 数据库统计
            try {
                const dbStats = await this.db.getDivinationStats();
                console.log('\n🗄️ 数据库统计:');
                console.log(`  总预测次数: ${dbStats.totalPredictions}`);
                console.log(`  平均准确率: ${(dbStats.averageAccuracy * 100).toFixed(1)}%`);
                console.log(`  最后活动: ${dbStats.lastActivity ? new Date(dbStats.lastActivity).toLocaleString() : '无'}`);
            } catch (e) {
                console.log('\n🗄️ 数据库统计: 暂不可用');
            }
        } catch (error) {
            displayError('获取统计信息失败: ' + error.message);
        }
    }

    // 备份数据库处理
    async handleBackup() {
        try {
            displayInfo('💾 正在备份数据库...');
            const backupPath = await this.db.backup();
            displaySuccess(`数据库备份成功: ${backupPath}`);
        } catch (error) {
            displayError('数据库备份失败: ' + error.message);
        }
    }

    // 矩阵随机生成处理
    async handleMatrixRandom(rows, cols) {
        try {
            displayInfo(`🔢 生成 ${rows}x${cols} 随机矩阵...`);
            const matrix = this.advancedMath.matrixOperations.random(rows, cols, -10, 10);
            
            console.log('\n🔢 随机矩阵:');
            matrix.forEach((row, i) => {
                console.log(`第${i+1}行: [${row.map(n => n.toFixed(2)).join(', ')}]`);
            });
            
            const det = this.advancedMath.matrixOperations.determinant(matrix);
            console.log(`\n行列式: ${det.toFixed(4)}`);
            
            await this.db.recordRandomEvent('matrix_generation', JSON.stringify({matrix, determinant: det}));
        } catch (error) {
            displayError('矩阵生成失败: ' + error.message);
        }
    }

    // 矩阵占卜处理
    async handleMatrixDivination(input) {
        try {
            displayInfo('🔮 进行矩阵占卜...');
            
            // 生成神秘矩阵
            const matrix = this.advancedMath.matrixOperations.random(3, 3, 0, 10);
            const result = this.advancedMath.matrixOperations.divination(matrix);
            
            console.log('\n🔮 矩阵占卜结果:');
            console.log(`预测值: ${result.prediction}`);
            console.log(`置信度: ${(result.confidence * 100).toFixed(1)}%`);
            console.log(`神秘值: ${result.mysticalValue.toFixed(4)}`);
            console.log(`矩阵力量: ${result.matrixPower.toFixed(4)}`);
            
            await this.db.recordPrediction('matrix_divination', input, result.prediction, result.confidence);
        } catch (error) {
            displayError('矩阵占卜失败: ' + error.message);
        }
    }

    // PI值计算处理
    async handlePICalculate(method) {
        try {
            displayInfo(`🥧 使用${method}方法计算PI值...`);
            
            let piValue;
            const startTime = Date.now();
            
            switch(method) {
                case 'leibniz':
                    piValue = this.advancedMath.calculatePI.leibniz(1000000);
                    break;
                case 'monte':
                    piValue = this.advancedMath.calculatePI.monteCarlo(1000000);
                    break;
                case 'nilakantha':
                    piValue = this.advancedMath.calculatePI.nilakantha(10000);
                    break;
                default:
                    piValue = this.advancedMath.calculatePI.leibniz(1000000);
            }
            
            const endTime = Date.now();
            const accuracy = Math.abs(piValue - Math.PI);
            
            console.log('\n🥧 PI值计算结果:');
            console.log(`计算方法: ${method}`);
            console.log(`计算结果: ${piValue}`);
            console.log(`标准PI值: ${Math.PI}`);
            console.log(`误差: ${accuracy.toExponential(6)}`);
            console.log(`计算时间: ${endTime - startTime}ms`);
            
            await this.db.recordRandomEvent('pi_calculation', JSON.stringify({method, value: piValue, accuracy}));
        } catch (error) {
            displayError('PI值计算失败: ' + error.message);
        }
    }

    // PI值占卜处理
    async handlePIDivination(question) {
        try {
            if (!question) {
                displayError('请输入要占卜的问题');
                return;
            }
            
            displayInfo('🥧 进行PI值占卜...');
            const result = this.advancedMath.calculatePI.piDivination(question);
            
            console.log('\n🥧 PI值占卜结果:');
            console.log(`问题: ${question}`);
            console.log(`答案: ${result.answer}`);
            console.log(`置信度: ${(result.confidence * 100).toFixed(1)}%`);
            console.log(`PI值: ${result.piValue}`);
            console.log(`神秘数字: ${result.mysticalDigits}`);
            console.log(`宇宙对齐: ${result.cosmicAlignment}`);
            
            await this.db.recordPrediction('pi_divination', question, result.answer, result.confidence);
        } catch (error) {
            displayError('PI值占卜失败: ' + error.message);
        }
    }

    // 数值积分处理
    async handleIntegrate(funcStr, a, b) {
        try {
            if (!funcStr || isNaN(a) || isNaN(b)) {
                displayError('请提供有效的函数和积分区间');
                return;
            }
            
            displayInfo(`🧮 计算函数 ${funcStr} 在 [${a}, ${b}] 的积分...`);
            
            // 定义一些常用函数
            const functions = {
                'sin': Math.sin,
                'cos': Math.cos,
                'tan': Math.tan,
                'exp': Math.exp,
                'log': Math.log,
                'sqrt': Math.sqrt,
                'x': (x) => x,
                'x2': (x) => x * x,
                'x3': (x) => x * x * x
            };
            
            const func = functions[funcStr] || ((x) => Math.sin(x));
            const result = this.advancedMath.advancedCalculus.integrate(func, a, b, 10000);
            
            console.log('\n🧮 数值积分结果:');
            console.log(`函数: ${funcStr}`);
            console.log(`积分区间: [${a}, ${b}]`);
            console.log(`积分值: ${result.toFixed(8)}`);
            
            await this.db.recordRandomEvent('integration', JSON.stringify({function: funcStr, interval: [a, b], result}));
        } catch (error) {
            displayError('数值积分计算失败: ' + error.message);
        }
    }

    // 数值微分处理
    async handleDifferentiate(funcStr, x) {
        try {
            if (!funcStr || isNaN(x)) {
                displayError('请提供有效的函数和求导点');
                return;
            }
            
            displayInfo(`🧮 计算函数 ${funcStr} 在 x=${x} 处的导数...`);
            
            const functions = {
                'sin': Math.sin,
                'cos': Math.cos,
                'tan': Math.tan,
                'exp': Math.exp,
                'log': Math.log,
                'sqrt': Math.sqrt,
                'x': (x) => x,
                'x2': (x) => x * x,
                'x3': (x) => x * x * x
            };
            
            const func = functions[funcStr] || ((x) => Math.sin(x));
            const result = this.advancedMath.advancedCalculus.differentiate(func, x);
            
            console.log('\n🧮 数值微分结果:');
            console.log(`函数: ${funcStr}`);
            console.log(`求导点: x = ${x}`);
            console.log(`导数值: ${result.toFixed(8)}`);
            
            await this.db.recordRandomEvent('differentiation', JSON.stringify({function: funcStr, point: x, result}));
        } catch (error) {
            displayError('数值微分计算失败: ' + error.message);
        }
    }

    // 综合数学占卜处理
    async handleMathDivination(input) {
        try {
            if (!input) {
                displayError('请输入要占卜的内容');
                return;
            }
            
            displayInfo('🔮 进行综合数学占卜...');
            const result = this.advancedMath.comprehensiveDivination(input);
            
            console.log('\n🔮 综合数学占卜结果:');
            console.log(`输入: ${input}`);
            console.log(`数字学: ${result.numerology}`);
            console.log(`PI对齐: ${result.piAlignment.toFixed(6)}`);
            console.log(`黄金和谐: ${result.goldenHarmony.toFixed(6)}`);
            console.log(`矩阵力量: ${result.matrixPower.toFixed(4)}`);
            console.log(`宇宙共振: ${result.cosmicResonance.toFixed(4)}`);
            console.log(`最终预测: ${result.prediction}`);
            console.log(`置信度: ${(result.confidence * 100).toFixed(1)}%`);
            console.log(`神秘建议: ${result.mysticalAdvice}`);
            
            await this.db.recordPrediction('comprehensive_math', input, result.prediction, result.confidence);
        } catch (error) {
            displayError('综合数学占卜失败: ' + error.message);
        }
    }

    // 随机MIDI生成处理
    async handleMIDIRandom(length) {
        try {
            displayInfo(`🎵 生成${length}音符的随机旋律...`);
            
            const scales = ['major', 'minor', 'pentatonic', 'blues'];
            const randomScale = scales[Math.floor(Math.random() * scales.length)];
            
            const melody = this.advancedMath.midiGenerator.generateMelody(length, randomScale);
            const midiData = this.advancedMath.midiGenerator.createMIDIData(melody);
            
            console.log('\n🎵 随机旋律生成结果:');
            console.log(`音阶: ${randomScale}`);
            console.log(`音符数量: ${length}`);
            console.log('旋律预览:');
            
            melody.slice(0, 8).forEach((note, i) => {
                const noteName = this.getNoteNameFromMIDI(note.note);
                console.log(`  ${i+1}. ${noteName} (时长:${note.duration}, 力度:${note.velocity})`);
            });
            
            console.log('\n💡 提示: 这是一个简化的MIDI数据结构，可用于音乐软件导入');
            
            await this.db.recordRandomEvent('midi_generation', JSON.stringify({scale: randomScale, length, preview: melody.slice(0, 5)}));
        } catch (error) {
            displayError('MIDI生成失败: ' + error.message);
        }
    }

    // 数学函数MIDI处理
    async handleMIDIMath(funcName) {
        try {
            displayInfo(`🎵 基于${funcName}函数生成旋律...`);
            
            const functions = {
                'sin': Math.sin,
                'cos': Math.cos,
                'tan': (x) => Math.tan(x) % 2,
                'exp': (x) => Math.exp(x/10) % 2,
                'log': (x) => Math.log(Math.abs(x) + 1)
            };
            
            const func = functions[funcName] || Math.sin;
            const melody = this.advancedMath.midiGenerator.mathMelody(func, 16);
            
            console.log('\n🎵 数学函数旋律结果:');
            console.log(`函数: ${funcName}`);
            console.log('旋律预览:');
            
            melody.slice(0, 8).forEach((note, i) => {
                const noteName = this.getNoteNameFromMIDI(note.note);
                console.log(`  ${i+1}. ${noteName} (时长:${note.duration}, 力度:${note.velocity})`);
            });
            
            await this.db.recordRandomEvent('math_midi', JSON.stringify({function: funcName, preview: melody.slice(0, 5)}));
        } catch (error) {
            displayError('数学函数MIDI生成失败: ' + error.message);
        }
    }

    // 判断题预测处理
    async handlePredictTF(question) {
        try {
            if (!question) {
                displayError('请输入要预测的判断题');
                return;
            }
            
            displayInfo('📝 预测判断题答案...');
            const result = this.advancedMath.questionPredictor.predictTrueFalse(question);
            
            console.log('\n📝 判断题预测结果:');
            console.log(`题目: ${question}`);
            console.log(`预测答案: ${result.answer}`);
            console.log(`置信度: ${(result.confidence * 100).toFixed(1)}%`);
            console.log(`推理依据: ${result.reasoning}`);
            console.log(`神秘值: ${result.mysticalValue.toFixed(4)}`);
            console.log('\n⚠️ 仅供娱乐，请勿用于实际考试！');
            
            await this.db.recordPrediction('true_false', question, result.answer, result.confidence);
        } catch (error) {
            displayError('判断题预测失败: ' + error.message);
        }
    }

    // 选择题预测处理
    async handlePredictChoice(input) {
        try {
            const parts = input.split('|');
            if (parts.length < 2) {
                displayError('请使用格式: predict-choice 题目|选项A|选项B|选项C|选项D');
                return;
            }
            
            const question = parts[0].trim();
            const options = parts.slice(1).map(opt => opt.trim());
            
            displayInfo('📝 预测选择题答案...');
            const result = this.advancedMath.questionPredictor.predictMultipleChoice(question, options);
            
            console.log('\n📝 选择题预测结果:');
            console.log(`题目: ${question}`);
            console.log(`预测答案: ${result.answer} (选项${result.answerIndex + 1})`);
            console.log(`置信度: ${(result.confidence * 100).toFixed(1)}%`);
            console.log(`推理依据: ${result.reasoning}`);
            
            console.log('\n各选项得分:');
            result.allScores.forEach((score, i) => {
                console.log(`  ${String.fromCharCode(65 + i)}. ${score.option}: ${(score.score * 100).toFixed(1)}%`);
            });
            
            console.log('\n⚠️ 仅供娱乐，请勿用于实际考试！');
            
            await this.db.recordPrediction('multiple_choice', question, result.answer, result.confidence);
        } catch (error) {
            displayError('选择题预测失败: ' + error.message);
        }
    }

    // 数学题预测处理
    async handlePredictMath(equation) {
        try {
            if (!equation) {
                displayError('请输入要预测的数学表达式');
                return;
            }
            
            displayInfo('📝 预测数学题答案...');
            const result = this.advancedMath.questionPredictor.predictMathAnswer(equation);
            
            console.log('\n📝 数学题预测结果:');
            console.log(`表达式: ${equation}`);
            console.log(`预测答案: ${result.answer}`);
            console.log(`置信度: ${(result.confidence * 100).toFixed(1)}%`);
            console.log(`计算方法: ${result.method}`);
            console.log(`精确计算: ${result.isExact ? '是' : '否'}`);
            
            if (result.warning) {
                console.log(`⚠️ ${result.warning}`);
            }
            
            await this.db.recordPrediction('math_equation', equation, result.answer.toString(), result.confidence);
        } catch (error) {
            displayError('数学题预测失败: ' + error.message);
        }
    }

    // 辅助函数：MIDI音符转音名
    getNoteNameFromMIDI(midiNote) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor(midiNote / 12) - 1;
        const note = noteNames[midiNote % 12];
        return `${note}${octave}`;
    }

    async cleanup() {
        try {
            await this.db.close();
        } catch (error) {
            console.log('数据库关闭时出错:', error.message);
        }
    }

    exit() {
        console.log('感谢使用 MathDown！愿数学与你同在 🔮');
        this.running = false;
    }
}

// 启动应用
if (require.main === module) {
    const cli = new MathDownCLI();
    cli.start().catch(console.error);
}

module.exports = MathDownCLI;
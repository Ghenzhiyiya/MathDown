const fs = require('fs');
const math = require('mathjs');
const { ConvolutionLayer } = require('./algorithms/convolution');
const { FourierTransform } = require('./algorithms/fourier');
const { NearestNeighbor } = require('./algorithms/nearest');

class MathDown {
    constructor() {
        this.data = [];
        this.convolution = new ConvolutionLayer();
        this.fourier = new FourierTransform();
        this.nearest = new NearestNeighbor();
    }

    // 添加数据点
    addDataPoint(input, output) {
        this.data.push({ input, output, timestamp: Date.now() });
        this.updateModels();
    }

    // 获取所有数据
    getData() {
        return this.data;
    }

    // 清空数据
    clearData() {
        this.data = [];
    }

    // 更新模型
    updateModels() {
        if (this.data.length < 2) return;

        const inputs = this.data.map(d => d.input);
        const outputs = this.data.map(d => d.output);

        // 更新各个算法模型
        this.convolution.train(inputs, outputs);
        this.fourier.analyze(inputs, outputs);
        this.nearest.updateData(this.data);
    }

    // 预测函数
    predict(input) {
        if (this.data.length === 0) {
            return {
                prediction: 0,
                confidence: 0,
                method: '无数据'
            };
        }

        if (this.data.length === 1) {
            return {
                prediction: this.data[0].output,
                confidence: 0.1,
                method: '单点预测'
            };
        }

        // 使用多种方法进行预测
        const predictions = [];

        // 1. 卷积神经网络预测
        try {
            const convPred = this.convolution.predict(input);
            predictions.push({
                value: convPred,
                weight: 0.4,
                method: '多层卷积'
            });
        } catch (e) {
            // 卷积预测失败时使用线性回归
            const linearPred = this.linearRegression(input);
            predictions.push({
                value: linearPred,
                weight: 0.4,
                method: '线性回归'
            });
        }

        // 2. 傅里叶变换预测
        const fourierPred = this.fourier.predict(input);
        predictions.push({
            value: fourierPred,
            weight: 0.3,
            method: '傅里叶变换'
        });

        // 3. 最近邻预测
        const nearestPred = this.nearest.predict(input);
        predictions.push({
            value: nearestPred.value,
            weight: 0.3,
            method: '临近推测'
        });

        // 加权平均
        const weightedSum = predictions.reduce((sum, pred) => sum + pred.value * pred.weight, 0);
        const totalWeight = predictions.reduce((sum, pred) => sum + pred.weight, 0);
        const finalPrediction = weightedSum / totalWeight;

        // 计算置信度
        const variance = predictions.reduce((sum, pred) => {
            return sum + Math.pow(pred.value - finalPrediction, 2) * pred.weight;
        }, 0) / totalWeight;
        
        const confidence = Math.max(0, 1 - Math.sqrt(variance) / Math.abs(finalPrediction + 1));

        return {
            prediction: finalPrediction,
            confidence: Math.min(confidence, 0.95),
            method: '综合预测 (卷积+傅里叶+临近)'
        };
    }

    // 简单线性回归作为备用方法
    linearRegression(input) {
        const n = this.data.length;
        const sumX = this.data.reduce((sum, d) => sum + d.input, 0);
        const sumY = this.data.reduce((sum, d) => sum + d.output, 0);
        const sumXY = this.data.reduce((sum, d) => sum + d.input * d.output, 0);
        const sumXX = this.data.reduce((sum, d) => sum + d.input * d.input, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return slope * input + intercept;
    }

    // 模式分析
    analyzePattern() {
        if (this.data.length === 0) {
            return {
                dataCount: 0,
                avgInput: 0,
                avgOutput: 0,
                correlation: 0,
                dominantFrequency: 0
            };
        }

        const inputs = this.data.map(d => d.input);
        const outputs = this.data.map(d => d.output);

        const avgInput = inputs.reduce((sum, x) => sum + x, 0) / inputs.length;
        const avgOutput = outputs.reduce((sum, y) => sum + y, 0) / outputs.length;

        // 计算相关系数
        const numerator = inputs.reduce((sum, x, i) => {
            return sum + (x - avgInput) * (outputs[i] - avgOutput);
        }, 0);

        const denomX = Math.sqrt(inputs.reduce((sum, x) => sum + Math.pow(x - avgInput, 2), 0));
        const denomY = Math.sqrt(outputs.reduce((sum, y) => sum + Math.pow(y - avgOutput, 2), 0));
        
        const correlation = denomX * denomY === 0 ? 0 : numerator / (denomX * denomY);

        // 获取主要频率
        const dominantFrequency = this.fourier.getDominantFrequency();

        return {
            dataCount: this.data.length,
            avgInput,
            avgOutput,
            correlation,
            dominantFrequency
        };
    }

    // 保存数据到文件
    saveToFile(filename) {
        const dataToSave = {
            data: this.data,
            metadata: {
                created: new Date().toISOString(),
                version: '1.0.0'
            }
        };
        fs.writeFileSync(filename, JSON.stringify(dataToSave, null, 2));
    }

    // 从文件加载数据
    loadFromFile(filename) {
        const fileContent = fs.readFileSync(filename, 'utf8');
        const loadedData = JSON.parse(fileContent);
        this.data = loadedData.data || [];
        this.updateModels();
    }
}

module.exports = MathDown;
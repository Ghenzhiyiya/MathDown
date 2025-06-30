const math = require('mathjs');

class AdvancedNeuralNetwork {
    constructor() {
        this.layers = [];
        this.weights = [];
        this.biases = [];
        this.activations = [];
        this.learningRate = 0.01;
        this.momentum = 0.9;
        this.previousWeightDeltas = [];
        this.dropout = 0.2;
        this.batchSize = 32;
        this.epochs = 1000;
        this.trained = false;
    }

    // 初始化网络结构
    initializeNetwork(inputSize, hiddenLayers = [64, 32, 16], outputSize = 1) {
        this.layers = [inputSize, ...hiddenLayers, outputSize];
        this.weights = [];
        this.biases = [];
        this.previousWeightDeltas = [];
        
        // Xavier初始化
        for (let i = 0; i < this.layers.length - 1; i++) {
            const fanIn = this.layers[i];
            const fanOut = this.layers[i + 1];
            const limit = Math.sqrt(6 / (fanIn + fanOut));
            
            const layerWeights = [];
            const layerBiases = [];
            const layerDeltas = [];
            
            for (let j = 0; j < fanOut; j++) {
                const neuronWeights = [];
                const neuronDeltas = [];
                for (let k = 0; k < fanIn; k++) {
                    neuronWeights.push((Math.random() * 2 - 1) * limit);
                    neuronDeltas.push(0);
                }
                layerWeights.push(neuronWeights);
                layerBiases.push((Math.random() * 2 - 1) * 0.1);
                layerDeltas.push(neuronDeltas);
            }
            
            this.weights.push(layerWeights);
            this.biases.push(layerBiases);
            this.previousWeightDeltas.push(layerDeltas);
        }
    }

    // 激活函数
    relu(x) {
        return Math.max(0, x);
    }

    reluDerivative(x) {
        return x > 0 ? 1 : 0;
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
    }

    sigmoidDerivative(x) {
        const s = this.sigmoid(x);
        return s * (1 - s);
    }

    tanh(x) {
        return Math.tanh(x);
    }

    tanhDerivative(x) {
        const t = this.tanh(x);
        return 1 - t * t;
    }

    // Leaky ReLU
    leakyRelu(x, alpha = 0.01) {
        return x > 0 ? x : alpha * x;
    }

    leakyReluDerivative(x, alpha = 0.01) {
        return x > 0 ? 1 : alpha;
    }

    // 前向传播
    forward(input, training = false) {
        let currentInput = Array.isArray(input) ? [...input] : [input];
        this.activations = [currentInput];
        
        for (let layer = 0; layer < this.weights.length; layer++) {
            const layerOutput = [];
            
            for (let neuron = 0; neuron < this.weights[layer].length; neuron++) {
                let sum = this.biases[layer][neuron];
                
                for (let input_idx = 0; input_idx < currentInput.length; input_idx++) {
                    sum += currentInput[input_idx] * this.weights[layer][neuron][input_idx];
                }
                
                // 选择激活函数
                let activation;
                if (layer === this.weights.length - 1) {
                    // 输出层使用线性激活
                    activation = sum;
                } else if (layer === 0) {
                    // 第一层使用ReLU
                    activation = this.relu(sum);
                } else {
                    // 中间层使用Leaky ReLU
                    activation = this.leakyRelu(sum);
                }
                
                // Dropout (仅在训练时)
                if (training && layer < this.weights.length - 1 && Math.random() < this.dropout) {
                    activation = 0;
                } else if (training && layer < this.weights.length - 1) {
                    activation /= (1 - this.dropout); // 缩放补偿
                }
                
                layerOutput.push(activation);
            }
            
            currentInput = layerOutput;
            this.activations.push(currentInput);
        }
        
        return currentInput[0]; // 返回单个输出值
    }

    // 反向传播
    backward(target, output) {
        const errors = [];
        const outputError = target - output;
        errors.unshift([outputError]);
        
        // 计算隐藏层误差
        for (let layer = this.weights.length - 2; layer >= 0; layer--) {
            const layerErrors = [];
            
            for (let neuron = 0; neuron < this.weights[layer].length; neuron++) {
                let error = 0;
                for (let nextNeuron = 0; nextNeuron < this.weights[layer + 1].length; nextNeuron++) {
                    error += errors[0][nextNeuron] * this.weights[layer + 1][nextNeuron][neuron];
                }
                layerErrors.push(error);
            }
            
            errors.unshift(layerErrors);
        }
        
        // 更新权重和偏置
        for (let layer = 0; layer < this.weights.length; layer++) {
            for (let neuron = 0; neuron < this.weights[layer].length; neuron++) {
                // 更新偏置
                const biasGradient = errors[layer + 1][neuron];
                this.biases[layer][neuron] += this.learningRate * biasGradient;
                
                // 更新权重
                for (let weight = 0; weight < this.weights[layer][neuron].length; weight++) {
                    const gradient = errors[layer + 1][neuron] * this.activations[layer][weight];
                    const weightDelta = this.learningRate * gradient + 
                                      this.momentum * this.previousWeightDeltas[layer][neuron][weight];
                    
                    this.weights[layer][neuron][weight] += weightDelta;
                    this.previousWeightDeltas[layer][neuron][weight] = weightDelta;
                }
            }
        }
    }

    // 训练网络
    train(inputs, outputs) {
        if (inputs.length !== outputs.length || inputs.length === 0) {
            return;
        }

        // 数据归一化
        const inputStats = this.calculateStats(inputs);
        const outputStats = this.calculateStats(outputs);
        
        const normalizedInputs = inputs.map(x => (x - inputStats.mean) / (inputStats.std + 1e-8));
        const normalizedOutputs = outputs.map(y => (y - outputStats.mean) / (outputStats.std + 1e-8));
        
        this.inputStats = inputStats;
        this.outputStats = outputStats;
        
        // 初始化网络
        this.initializeNetwork(1, [32, 16, 8], 1);
        
        // 训练循环
        for (let epoch = 0; epoch < this.epochs; epoch++) {
            let totalError = 0;
            
            // 随机打乱数据
            const indices = Array.from({length: normalizedInputs.length}, (_, i) => i);
            this.shuffleArray(indices);
            
            for (let i = 0; i < normalizedInputs.length; i++) {
                const idx = indices[i];
                const prediction = this.forward(normalizedInputs[idx], true);
                const error = Math.pow(normalizedOutputs[idx] - prediction, 2);
                totalError += error;
                
                this.backward(normalizedOutputs[idx], prediction);
            }
            
            // 学习率衰减
            if (epoch % 100 === 0) {
                this.learningRate *= 0.95;
            }
            
            // 早停条件
            if (totalError / normalizedInputs.length < 0.001) {
                break;
            }
        }
        
        this.trained = true;
    }

    // 预测
    predict(input) {
        if (!this.trained) {
            return 0;
        }
        
        const normalizedInput = (input - this.inputStats.mean) / (this.inputStats.std + 1e-8);
        const normalizedOutput = this.forward(normalizedInput, false);
        
        return normalizedOutput * this.outputStats.std + this.outputStats.mean;
    }

    // 计算统计信息
    calculateStats(data) {
        const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
        const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
        const std = Math.sqrt(variance);
        
        return { mean, std, variance };
    }

    // 随机打乱数组
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // 获取网络信息
    getNetworkInfo() {
        return {
            layers: this.layers,
            totalWeights: this.weights.reduce((sum, layer) => 
                sum + layer.reduce((layerSum, neuron) => layerSum + neuron.length, 0), 0),
            learningRate: this.learningRate,
            trained: this.trained
        };
    }

    // 保存模型
    saveModel() {
        return {
            layers: this.layers,
            weights: this.weights,
            biases: this.biases,
            inputStats: this.inputStats,
            outputStats: this.outputStats,
            trained: this.trained
        };
    }

    // 加载模型
    loadModel(modelData) {
        this.layers = modelData.layers;
        this.weights = modelData.weights;
        this.biases = modelData.biases;
        this.inputStats = modelData.inputStats;
        this.outputStats = modelData.outputStats;
        this.trained = modelData.trained;
    }
}

module.exports = { AdvancedNeuralNetwork };
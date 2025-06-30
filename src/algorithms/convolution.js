const math = require('mathjs');

class ConvolutionLayer {
    constructor() {
        this.weights = [];
        this.biases = [];
        this.layers = 3; // 多层卷积
        this.kernelSize = 3;
        this.trained = false;
        this.inputData = [];
        this.outputData = [];
    }

    // 初始化权重和偏置
    initializeWeights(inputSize) {
        this.weights = [];
        this.biases = [];
        
        for (let layer = 0; layer < this.layers; layer++) {
            const layerWeights = [];
            const layerBiases = [];
            
            const currentSize = Math.max(1, inputSize - layer);
            
            for (let i = 0; i < this.kernelSize; i++) {
                layerWeights.push(Math.random() * 2 - 1); // -1 到 1 之间的随机数
                layerBiases.push(Math.random() * 0.1);
            }
            
            this.weights.push(layerWeights);
            this.biases.push(layerBiases);
        }
    }

    // 激活函数 (ReLU)
    relu(x) {
        return Math.max(0, x);
    }

    // Sigmoid激活函数
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    // 卷积操作
    convolve(input, weights, bias) {
        if (!Array.isArray(input)) {
            input = [input];
        }
        
        let result = 0;
        for (let i = 0; i < Math.min(input.length, weights.length); i++) {
            result += input[i] * weights[i];
        }
        return this.relu(result + bias);
    }

    // 前向传播
    forward(input) {
        let currentInput = Array.isArray(input) ? input : [input];
        
        for (let layer = 0; layer < this.layers; layer++) {
            const layerOutput = [];
            
            for (let i = 0; i < this.weights[layer].length; i++) {
                const convResult = this.convolve(
                    currentInput, 
                    [this.weights[layer][i]], 
                    this.biases[layer][i]
                );
                layerOutput.push(convResult);
            }
            
            currentInput = layerOutput;
        }
        
        // 最终输出层
        return currentInput.reduce((sum, val) => sum + val, 0) / currentInput.length;
    }

    // 训练函数
    train(inputs, outputs) {
        if (inputs.length !== outputs.length || inputs.length < 2) {
            return;
        }

        this.inputData = [...inputs];
        this.outputData = [...outputs];
        
        // 数据归一化
        const maxInput = Math.max(...inputs);
        const minInput = Math.min(...inputs);
        const maxOutput = Math.max(...outputs);
        const minOutput = Math.min(...outputs);
        
        const normalizedInputs = inputs.map(x => (x - minInput) / (maxInput - minInput + 1e-8));
        const normalizedOutputs = outputs.map(y => (y - minOutput) / (maxOutput - minOutput + 1e-8));
        
        this.inputRange = { min: minInput, max: maxInput };
        this.outputRange = { min: minOutput, max: maxOutput };
        
        // 初始化权重
        this.initializeWeights(normalizedInputs.length);
        
        // 简化的训练过程 - 使用梯度下降
        const learningRate = 0.01;
        const epochs = 100;
        
        for (let epoch = 0; epoch < epochs; epoch++) {
            let totalError = 0;
            
            for (let i = 0; i < normalizedInputs.length; i++) {
                const predicted = this.forward(normalizedInputs[i]);
                const error = normalizedOutputs[i] - predicted;
                totalError += error * error;
                
                // 简单的权重更新
                for (let layer = 0; layer < this.layers; layer++) {
                    for (let w = 0; w < this.weights[layer].length; w++) {
                        this.weights[layer][w] += learningRate * error * normalizedInputs[i];
                        this.biases[layer][w] += learningRate * error;
                    }
                }
            }
            
            // 早停条件
            if (totalError < 0.001) break;
        }
        
        this.trained = true;
    }

    // 预测函数
    predict(input) {
        if (!this.trained || this.inputData.length === 0) {
            return 0;
        }
        
        // 归一化输入
        const normalizedInput = (input - this.inputRange.min) / 
                               (this.inputRange.max - this.inputRange.min + 1e-8);
        
        // 前向传播
        const normalizedOutput = this.forward(normalizedInput);
        
        // 反归一化输出
        const output = normalizedOutput * (this.outputRange.max - this.outputRange.min) + 
                      this.outputRange.min;
        
        return output;
    }

    // 获取模型信息
    getModelInfo() {
        return {
            layers: this.layers,
            kernelSize: this.kernelSize,
            trained: this.trained,
            dataPoints: this.inputData.length
        };
    }
}

module.exports = { ConvolutionLayer };
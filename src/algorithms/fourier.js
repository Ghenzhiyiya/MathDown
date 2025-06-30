const math = require('mathjs');

class FourierTransform {
    constructor() {
        this.frequencies = [];
        this.amplitudes = [];
        this.phases = [];
        this.dominantFreq = 0;
        this.inputData = [];
        this.outputData = [];
        this.analyzed = false;
    }

    // 离散傅里叶变换 (DFT)
    dft(signal) {
        const N = signal.length;
        const frequencies = [];
        const amplitudes = [];
        const phases = [];

        for (let k = 0; k < N; k++) {
            let realSum = 0;
            let imagSum = 0;

            for (let n = 0; n < N; n++) {
                const angle = -2 * Math.PI * k * n / N;
                realSum += signal[n] * Math.cos(angle);
                imagSum += signal[n] * Math.sin(angle);
            }

            const amplitude = Math.sqrt(realSum * realSum + imagSum * imagSum) / N;
            const phase = Math.atan2(imagSum, realSum);
            const frequency = k / N;

            frequencies.push(frequency);
            amplitudes.push(amplitude);
            phases.push(phase);
        }

        return { frequencies, amplitudes, phases };
    }

    // 快速傅里叶变换 (简化版)
    fft(signal) {
        // 对于小数据集，直接使用DFT
        if (signal.length <= 8) {
            return this.dft(signal);
        }

        // 简化的FFT实现
        const N = signal.length;
        const isPowerOfTwo = (N & (N - 1)) === 0;
        
        if (!isPowerOfTwo) {
            // 如果不是2的幂，填充到最近的2的幂
            const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(N)));
            const paddedSignal = [...signal];
            while (paddedSignal.length < nextPowerOfTwo) {
                paddedSignal.push(0);
            }
            return this.dft(paddedSignal);
        }

        return this.dft(signal);
    }

    // 分析输入输出数据的频域特性
    analyze(inputs, outputs) {
        if (inputs.length !== outputs.length || inputs.length < 2) {
            return;
        }

        this.inputData = [...inputs];
        this.outputData = [...outputs];

        // 对输出数据进行傅里叶分析
        const fftResult = this.fft(outputs);
        this.frequencies = fftResult.frequencies;
        this.amplitudes = fftResult.amplitudes;
        this.phases = fftResult.phases;

        // 找到主要频率
        let maxAmplitude = 0;
        let dominantIndex = 0;
        
        for (let i = 1; i < this.amplitudes.length / 2; i++) { // 忽略直流分量和镜像频率
            if (this.amplitudes[i] > maxAmplitude) {
                maxAmplitude = this.amplitudes[i];
                dominantIndex = i;
            }
        }
        
        this.dominantFreq = this.frequencies[dominantIndex];
        this.analyzed = true;
    }

    // 基于傅里叶分析进行预测
    predict(input) {
        if (!this.analyzed || this.inputData.length === 0) {
            return 0;
        }

        // 方法1: 基于主要频率的正弦波预测
        const sineWavePrediction = this.predictWithSineWave(input);
        
        // 方法2: 基于频域插值的预测
        const interpolationPrediction = this.predictWithInterpolation(input);
        
        // 方法3: 基于相位关系的预测
        const phasePrediction = this.predictWithPhase(input);
        
        // 综合预测结果
        return (sineWavePrediction * 0.4 + interpolationPrediction * 0.4 + phasePrediction * 0.2);
    }

    // 基于主要频率的正弦波预测
    predictWithSineWave(input) {
        if (this.amplitudes.length === 0) return 0;
        
        const avgOutput = this.outputData.reduce((sum, val) => sum + val, 0) / this.outputData.length;
        const maxAmplitude = Math.max(...this.amplitudes.slice(1, this.amplitudes.length / 2));
        
        // 使用主要频率生成预测
        const normalizedInput = (input - Math.min(...this.inputData)) / 
                               (Math.max(...this.inputData) - Math.min(...this.inputData) + 1e-8);
        
        const prediction = avgOutput + maxAmplitude * Math.sin(2 * Math.PI * this.dominantFreq * normalizedInput);
        return prediction;
    }

    // 基于频域插值的预测
    predictWithInterpolation(input) {
        if (this.inputData.length < 2) return 0;
        
        // 找到最近的两个数据点
        let closestIndex = 0;
        let minDistance = Math.abs(input - this.inputData[0]);
        
        for (let i = 1; i < this.inputData.length; i++) {
            const distance = Math.abs(input - this.inputData[i]);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
            }
        }
        
        // 线性插值
        if (closestIndex === 0) {
            const slope = (this.outputData[1] - this.outputData[0]) / (this.inputData[1] - this.inputData[0]);
            return this.outputData[0] + slope * (input - this.inputData[0]);
        } else if (closestIndex === this.inputData.length - 1) {
            const slope = (this.outputData[closestIndex] - this.outputData[closestIndex - 1]) / 
                         (this.inputData[closestIndex] - this.inputData[closestIndex - 1]);
            return this.outputData[closestIndex] + slope * (input - this.inputData[closestIndex]);
        } else {
            // 在两个点之间插值
            const prevIndex = closestIndex - 1;
            const nextIndex = closestIndex + 1;
            
            const t = (input - this.inputData[prevIndex]) / (this.inputData[nextIndex] - this.inputData[prevIndex]);
            return this.outputData[prevIndex] + t * (this.outputData[nextIndex] - this.outputData[prevIndex]);
        }
    }

    // 基于相位关系的预测
    predictWithPhase(input) {
        if (this.phases.length === 0) return 0;
        
        const avgOutput = this.outputData.reduce((sum, val) => sum + val, 0) / this.outputData.length;
        const avgPhase = this.phases.reduce((sum, val) => sum + val, 0) / this.phases.length;
        
        // 使用平均相位进行预测
        const normalizedInput = (input - Math.min(...this.inputData)) / 
                               (Math.max(...this.inputData) - Math.min(...this.inputData) + 1e-8);
        
        const phaseShift = avgPhase + 2 * Math.PI * normalizedInput;
        const amplitude = Math.max(...this.amplitudes) * 0.5;
        
        return avgOutput + amplitude * Math.cos(phaseShift);
    }

    // 获取主要频率
    getDominantFrequency() {
        return this.dominantFreq;
    }

    // 获取频谱信息
    getSpectrum() {
        return {
            frequencies: this.frequencies,
            amplitudes: this.amplitudes,
            phases: this.phases,
            dominantFrequency: this.dominantFreq
        };
    }

    // 获取分析状态
    isAnalyzed() {
        return this.analyzed;
    }
}

module.exports = { FourierTransform };
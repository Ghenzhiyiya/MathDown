class GoldenRatio {
    constructor() {
        this.phi = (1 + Math.sqrt(5)) / 2; // 黄金比例 φ ≈ 1.618
        this.phiConjugate = (1 - Math.sqrt(5)) / 2; // φ的共轭 ≈ -0.618
        this.inversePhi = 1 / this.phi; // 1/φ ≈ 0.618
        this.sqrt5 = Math.sqrt(5);
    }

    // 计算斐波那契数列
    fibonacci(n) {
        if (n <= 0) return 0;
        if (n === 1) return 1;
        
        // 使用Binet公式快速计算
        const result = (Math.pow(this.phi, n) - Math.pow(this.phiConjugate, n)) / this.sqrt5;
        return Math.round(result);
    }

    // 生成斐波那契数列
    generateFibonacciSequence(count) {
        const sequence = [];
        for (let i = 0; i < count; i++) {
            sequence.push(this.fibonacci(i));
        }
        return sequence;
    }

    // 计算黄金螺旋坐标
    goldenSpiral(t, scale = 1) {
        const r = scale * Math.pow(this.phi, t / (Math.PI / 2));
        return {
            x: r * Math.cos(t),
            y: r * Math.sin(t),
            radius: r,
            angle: t
        };
    }

    // 黄金矩形分割
    goldenRectangle(width, height) {
        const ratio = width / height;
        const isGolden = Math.abs(ratio - this.phi) < 0.01;
        
        // 如果不是黄金矩形，计算最接近的黄金矩形
        let goldenWidth, goldenHeight;
        if (width > height) {
            goldenHeight = height;
            goldenWidth = height * this.phi;
        } else {
            goldenWidth = width;
            goldenHeight = width * this.phi;
        }
        
        return {
            original: { width, height, ratio },
            isGolden: isGolden,
            golden: { width: goldenWidth, height: goldenHeight, ratio: this.phi },
            difference: Math.abs(ratio - this.phi),
            // 分割点
            divisionPoint: {
                x: goldenWidth * this.inversePhi,
                y: goldenHeight * this.inversePhi
            }
        };
    }

    // 黄金角度（约137.5度）
    goldenAngle() {
        return 2 * Math.PI * this.inversePhi; // 弧度
    }

    goldenAngleDegrees() {
        return this.goldenAngle() * 180 / Math.PI; // 度数
    }

    // 在数值序列中寻找黄金比例关系
    findGoldenRatios(numbers) {
        const ratios = [];
        const goldenRelations = [];
        
        for (let i = 0; i < numbers.length - 1; i++) {
            for (let j = i + 1; j < numbers.length; j++) {
                if (numbers[i] !== 0) {
                    const ratio = numbers[j] / numbers[i];
                    ratios.push({
                        index1: i,
                        index2: j,
                        value1: numbers[i],
                        value2: numbers[j],
                        ratio: ratio,
                        isGolden: Math.abs(ratio - this.phi) < 0.1,
                        difference: Math.abs(ratio - this.phi)
                    });
                    
                    // 如果接近黄金比例
                    if (Math.abs(ratio - this.phi) < 0.1) {
                        goldenRelations.push(ratios[ratios.length - 1]);
                    }
                }
            }
        }
        
        return {
            allRatios: ratios,
            goldenRelations: goldenRelations.sort((a, b) => a.difference - b.difference),
            hasGoldenRatio: goldenRelations.length > 0
        };
    }

    // 黄金分割点预测
    predictGoldenPoints(min, max) {
        const range = max - min;
        const majorPoint = min + range * this.inversePhi; // 主要分割点
        const minorPoint = min + range * (1 - this.inversePhi); // 次要分割点
        
        return {
            range: { min, max, span: range },
            majorPoint: majorPoint,
            minorPoint: minorPoint,
            ratio: this.phi,
            segments: {
                first: { start: min, end: minorPoint, length: minorPoint - min },
                second: { start: minorPoint, end: majorPoint, length: majorPoint - minorPoint },
                third: { start: majorPoint, end: max, length: max - majorPoint }
            }
        };
    }

    // 基于黄金比例的数值预测
    goldenPredict(inputData) {
        if (!Array.isArray(inputData) || inputData.length < 2) {
            return null;
        }
        
        const predictions = [];
        const lastValue = inputData[inputData.length - 1];
        const secondLastValue = inputData[inputData.length - 2];
        
        // 方法1: 斐波那契式预测
        const fibPrediction = lastValue + secondLastValue;
        predictions.push({
            method: 'fibonacci',
            value: fibPrediction,
            confidence: 0.6
        });
        
        // 方法2: 黄金比例扩展
        const goldenPrediction = lastValue * this.phi;
        predictions.push({
            method: 'golden_ratio',
            value: goldenPrediction,
            confidence: 0.7
        });
        
        // 方法3: 黄金螺旋预测
        const spiralPrediction = lastValue + (lastValue - secondLastValue) * this.inversePhi;
        predictions.push({
            method: 'golden_spiral',
            value: spiralPrediction,
            confidence: 0.5
        });
        
        // 方法4: 基于序列中的黄金关系
        const goldenRelations = this.findGoldenRatios(inputData);
        if (goldenRelations.hasGoldenRatio) {
            const bestRelation = goldenRelations.goldenRelations[0];
            const relationPrediction = lastValue * bestRelation.ratio;
            predictions.push({
                method: 'sequence_golden_relation',
                value: relationPrediction,
                confidence: 0.8,
                basedOn: bestRelation
            });
        }
        
        // 综合预测
        const weightedSum = predictions.reduce((sum, pred) => sum + pred.value * pred.confidence, 0);
        const totalWeight = predictions.reduce((sum, pred) => sum + pred.confidence, 0);
        const finalPrediction = weightedSum / totalWeight;
        
        return {
            predictions: predictions,
            finalPrediction: finalPrediction,
            confidence: totalWeight / predictions.length,
            goldenRelations: goldenRelations,
            inputSequence: inputData,
            phi: this.phi
        };
    }

    // 黄金比例在时间序列中的应用
    timeSeriesGoldenAnalysis(timestamps, values) {
        if (timestamps.length !== values.length || timestamps.length < 3) {
            return null;
        }
        
        const timeSpan = timestamps[timestamps.length - 1] - timestamps[0];
        const goldenTimePoint = timestamps[0] + timeSpan * this.inversePhi;
        
        // 找到最接近黄金时间点的数据
        let closestIndex = 0;
        let minDiff = Math.abs(timestamps[0] - goldenTimePoint);
        
        for (let i = 1; i < timestamps.length; i++) {
            const diff = Math.abs(timestamps[i] - goldenTimePoint);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        }
        
        return {
            timeSpan: timeSpan,
            goldenTimePoint: goldenTimePoint,
            closestDataPoint: {
                index: closestIndex,
                timestamp: timestamps[closestIndex],
                value: values[closestIndex],
                timeDifference: minDiff
            },
            goldenValue: values[closestIndex],
            analysis: {
                isSignificant: minDiff < timeSpan * 0.05, // 如果差异小于5%认为显著
                significance: 1 - (minDiff / timeSpan)
            }
        };
    }

    // 生成黄金比例相关的幸运数字
    generateGoldenLuckyNumbers(count = 6, max = 100) {
        const numbers = [];
        const fibSeq = this.generateFibonacciSequence(20);
        
        // 基于斐波那契数列生成
        for (let i = 0; i < count; i++) {
            let num;
            if (i < fibSeq.length && fibSeq[i] <= max) {
                num = fibSeq[i];
            } else {
                // 使用黄金比例生成
                num = Math.floor((Math.random() * max * this.inversePhi) + 1);
            }
            
            // 确保不重复且在范围内
            while (numbers.includes(num) || num > max || num < 1) {
                num = Math.floor(Math.random() * max) + 1;
            }
            
            numbers.push(num);
        }
        
        return {
            numbers: numbers.sort((a, b) => a - b),
            goldenRatio: this.phi,
            fibonacciBase: fibSeq.filter(n => n <= max),
            method: 'golden_ratio_fibonacci',
            timestamp: Date.now()
        };
    }

    // 黄金比例占卜
    goldenDivination(question = '') {
        const now = Date.now();
        const goldenMoment = now * this.inversePhi;
        const cosmicAlignment = Math.sin(goldenMoment / 1000000) * 0.5 + 0.5;
        
        const interpretations = [
            { range: [0.8, 1.0], meaning: '极其吉利，黄金时刻已到！', emoji: '✨' },
            { range: [0.6, 0.8], meaning: '大吉，黄金比例眷顾着你', emoji: '🌟' },
            { range: [0.4, 0.6], meaning: '中吉，保持黄金心态', emoji: '⭐' },
            { range: [0.2, 0.4], meaning: '小吉，需要调整到黄金状态', emoji: '🌙' },
            { range: [0.0, 0.2], meaning: '平，等待黄金时机', emoji: '🌑' }
        ];
        
        const interpretation = interpretations.find(interp => 
            cosmicAlignment >= interp.range[0] && cosmicAlignment < interp.range[1]
        ) || interpretations[interpretations.length - 1];
        
        return {
            question: question,
            cosmicAlignment: cosmicAlignment,
            goldenMoment: goldenMoment,
            interpretation: interpretation,
            luckyNumbers: this.generateGoldenLuckyNumbers(3, 99),
            goldenAdvice: this.getGoldenAdvice(cosmicAlignment),
            phi: this.phi,
            timestamp: now
        };
    }

    // 获取黄金建议
    getGoldenAdvice(alignment) {
        if (alignment > 0.8) {
            return '现在是行动的黄金时刻，把握机会！';
        } else if (alignment > 0.6) {
            return '保持黄金比例的平衡，稳步前进。';
        } else if (alignment > 0.4) {
            return '调整心态，寻找生活中的黄金分割点。';
        } else if (alignment > 0.2) {
            return '耐心等待，黄金时机即将到来。';
        } else {
            return '静心修养，为迎接黄金机遇做准备。';
        }
    }

    // 获取黄金比例常数信息
    getConstants() {
        return {
            phi: this.phi,
            phiConjugate: this.phiConjugate,
            inversePhi: this.inversePhi,
            goldenAngle: this.goldenAngle(),
            goldenAngleDegrees: this.goldenAngleDegrees(),
            sqrt5: this.sqrt5,
            properties: {
                'φ² = φ + 1': Math.abs(this.phi * this.phi - (this.phi + 1)) < 0.0001,
                '1/φ = φ - 1': Math.abs(this.inversePhi - (this.phi - 1)) < 0.0001,
                'φ ≈ 1.618': Math.abs(this.phi - 1.618) < 0.001
            }
        };
    }
}

module.exports = { GoldenRatio };
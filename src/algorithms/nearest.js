class NearestNeighbor {
    constructor(k = 3) {
        this.k = k; // K近邻中的K值
        this.data = [];
        this.weights = {
            distance: 0.6,  // 距离权重
            recency: 0.3,   // 时间权重
            similarity: 0.1 // 相似性权重
        };
    }

    // 更新数据
    updateData(data) {
        this.data = [...data];
        // 按时间排序，最新的数据在前
        this.data.sort((a, b) => b.timestamp - a.timestamp);
    }

    // 计算欧几里得距离
    euclideanDistance(x1, x2) {
        return Math.abs(x1 - x2);
    }

    // 计算曼哈顿距离
    manhattanDistance(x1, x2) {
        return Math.abs(x1 - x2);
    }

    // 计算余弦相似度
    cosineSimilarity(x1, x2) {
        const magnitude1 = Math.abs(x1);
        const magnitude2 = Math.abs(x2);
        if (magnitude1 === 0 || magnitude2 === 0) return 0;
        return (x1 * x2) / (magnitude1 * magnitude2);
    }

    // 计算时间衰减权重
    getTimeWeight(timestamp) {
        if (this.data.length === 0) return 1;
        
        const now = Date.now();
        const maxAge = now - Math.min(...this.data.map(d => d.timestamp));
        const age = now - timestamp;
        
        if (maxAge === 0) return 1;
        
        // 指数衰减
        return Math.exp(-age / (maxAge * 0.5));
    }

    // 找到K个最近邻
    findKNearestNeighbors(input) {
        if (this.data.length === 0) {
            return [];
        }

        const neighbors = this.data.map(point => {
            // 计算各种距离和相似度
            const euclidean = this.euclideanDistance(input, point.input);
            const manhattan = this.manhattanDistance(input, point.input);
            const cosine = this.cosineSimilarity(input, point.input);
            const timeWeight = this.getTimeWeight(point.timestamp);
            
            // 综合距离计算
            const combinedDistance = euclidean * 0.7 + manhattan * 0.3;
            
            // 计算综合权重
            const totalWeight = 
                (1 / (combinedDistance + 1e-8)) * this.weights.distance +
                timeWeight * this.weights.recency +
                (cosine + 1) * this.weights.similarity; // cosine范围[-1,1]，转换为[0,2]
            
            return {
                ...point,
                distance: combinedDistance,
                weight: totalWeight,
                timeWeight: timeWeight,
                similarity: cosine
            };
        });

        // 按权重排序，权重高的在前
        neighbors.sort((a, b) => b.weight - a.weight);
        
        // 返回前K个邻居
        return neighbors.slice(0, Math.min(this.k, neighbors.length));
    }

    // 加权平均预测
    weightedAverage(neighbors) {
        if (neighbors.length === 0) return 0;
        
        const totalWeight = neighbors.reduce((sum, neighbor) => sum + neighbor.weight, 0);
        if (totalWeight === 0) {
            // 如果权重都为0，使用简单平均
            return neighbors.reduce((sum, neighbor) => sum + neighbor.output, 0) / neighbors.length;
        }
        
        const weightedSum = neighbors.reduce((sum, neighbor) => {
            return sum + neighbor.output * neighbor.weight;
        }, 0);
        
        return weightedSum / totalWeight;
    }

    // 距离加权预测
    distanceWeighted(neighbors) {
        if (neighbors.length === 0) return 0;
        
        const weights = neighbors.map(neighbor => 1 / (neighbor.distance + 1e-8));
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        
        if (totalWeight === 0) {
            return neighbors.reduce((sum, neighbor) => sum + neighbor.output, 0) / neighbors.length;
        }
        
        const weightedSum = neighbors.reduce((sum, neighbor, index) => {
            return sum + neighbor.output * weights[index];
        }, 0);
        
        return weightedSum / totalWeight;
    }

    // 线性回归预测（基于邻居）
    linearRegression(neighbors) {
        if (neighbors.length < 2) {
            return neighbors.length === 1 ? neighbors[0].output : 0;
        }
        
        const inputs = neighbors.map(n => n.input);
        const outputs = neighbors.map(n => n.output);
        
        const n = inputs.length;
        const sumX = inputs.reduce((sum, x) => sum + x, 0);
        const sumY = outputs.reduce((sum, y) => sum + y, 0);
        const sumXY = inputs.reduce((sum, x, i) => sum + x * outputs[i], 0);
        const sumXX = inputs.reduce((sum, x) => sum + x * x, 0);
        
        const denominator = n * sumXX - sumX * sumX;
        if (Math.abs(denominator) < 1e-8) {
            // 如果分母接近0，使用加权平均
            return this.weightedAverage(neighbors);
        }
        
        const slope = (n * sumXY - sumX * sumY) / denominator;
        const intercept = (sumY - slope * sumX) / n;
        
        return slope * inputs[0] + intercept; // 使用最近邻的输入值
    }

    // 主预测函数
    predict(input) {
        if (this.data.length === 0) {
            return { value: 0, confidence: 0, neighbors: [] };
        }
        
        if (this.data.length === 1) {
            return {
                value: this.data[0].output,
                confidence: 0.3,
                neighbors: [this.data[0]]
            };
        }
        
        // 找到K个最近邻
        const neighbors = this.findKNearestNeighbors(input);
        
        if (neighbors.length === 0) {
            return { value: 0, confidence: 0, neighbors: [] };
        }
        
        // 使用多种方法进行预测
        const weightedPred = this.weightedAverage(neighbors);
        const distancePred = this.distanceWeighted(neighbors);
        const regressionPred = this.linearRegression(neighbors);
        
        // 综合预测结果
        const finalPrediction = (weightedPred * 0.4 + distancePred * 0.4 + regressionPred * 0.2);
        
        // 计算置信度
        const avgDistance = neighbors.reduce((sum, n) => sum + n.distance, 0) / neighbors.length;
        const avgTimeWeight = neighbors.reduce((sum, n) => sum + n.timeWeight, 0) / neighbors.length;
        const confidence = Math.min(0.9, (1 / (avgDistance + 1)) * 0.7 + avgTimeWeight * 0.3);
        
        return {
            value: finalPrediction,
            confidence: confidence,
            neighbors: neighbors.map(n => ({
                input: n.input,
                output: n.output,
                distance: n.distance,
                weight: n.weight
            }))
        };
    }

    // 设置K值
    setK(k) {
        this.k = Math.max(1, k);
    }

    // 设置权重
    setWeights(weights) {
        this.weights = { ...this.weights, ...weights };
        
        // 确保权重总和为1
        const total = Object.values(this.weights).reduce((sum, w) => sum + w, 0);
        if (total > 0) {
            Object.keys(this.weights).forEach(key => {
                this.weights[key] /= total;
            });
        }
    }

    // 获取算法信息
    getInfo() {
        return {
            k: this.k,
            dataPoints: this.data.length,
            weights: this.weights
        };
    }
}

module.exports = { NearestNeighbor };
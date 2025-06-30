// 显示横幅
function displayBanner() {
    console.log('\n' + '='.repeat(60));
    console.log('███╗   ███╗ █████╗ ████████╗██╗  ██╗██████╗  ██████╗ ██╗    ██╗███╗   ██╗');
    console.log('████╗ ████║██╔══██╗╚══██╔══╝██║  ██║██╔══██╗██╔═══██╗██║    ██║████╗  ██║');
    console.log('██╔████╔██║███████║   ██║   ███████║██║  ██║██║   ██║██║ █╗ ██║██╔██╗ ██║');
    console.log('██║╚██╔╝██║██╔══██║   ██║   ██╔══██║██║  ██║██║   ██║██║███╗██║██║╚██╗██║');
    console.log('██║ ╚═╝ ██║██║  ██║   ██║   ██║  ██║██████╔╝╚██████╔╝╚███╔███╔╝██║ ╚████║');
    console.log('╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═════╝  ╚═════╝  ╚══╝╚══╝ ╚═╝  ╚═══╝');
    console.log('                    🔮 数学规律占卜工具 🔮                    ');
    console.log('='.repeat(60) + '\n');
}

// 显示帮助信息
function displayHelp() {
    console.log('\n' + '='.repeat(50));
    console.log('                  📚 命令列表 📚');
    console.log('='.repeat(50));
    console.log('\n📊 数据管理:');
    console.log('  add <输入> <输出>     - 添加数据点');
    console.log('  list                  - 显示所有数据');
    console.log('  clear                 - 清空所有数据');
    console.log('  save [文件名]         - 保存数据到文件');
    console.log('  load [文件名]         - 从文件加载数据');
    
    console.log('\n🔮 预测功能:');
    console.log('  predict <输入值>      - 预测输出结果');
    console.log('  analyze               - 分析数据模式');
    
    console.log('\n🛠️  系统命令:');
    console.log('  help                  - 显示此帮助信息');
    console.log('  exit / quit           - 退出程序');
    
    console.log('\n🎯 使用示例:');
    console.log('  add 1 2               - 添加数据点 1->2');
    console.log('  add 2 4               - 添加数据点 2->4');
    console.log('  add 3 6               - 添加数据点 3->6');
    console.log('  predict 4             - 预测输入4的输出');
    console.log('  save my_data.json     - 保存数据');
    
    console.log('\n🧮 算法说明:');
    console.log('  • 多层卷积: 使用神经网络进行模式识别');
    console.log('  • 傅里叶变换: 分析数据的频域特性');
    console.log('  • 临近推测: 基于相似数据点进行预测');
    console.log('  • 综合预测: 结合多种算法的加权结果');
    
    console.log('\n💡 占卜提示:');
    console.log('  • 数据越多，预测越准确');
    console.log('  • 建议至少输入5个数据点');
    console.log('  • 置信度越高，结果越可信');
    console.log('  • 适合发现数字间的神秘规律');
    
    console.log('\n' + '='.repeat(50) + '\n');
}

// 显示加载动画
function showLoadingAnimation(message = '正在计算', duration = 2000) {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    
    const interval = setInterval(() => {
        process.stdout.write(`\r${frames[i]} ${message}...`);
        i = (i + 1) % frames.length;
    }, 100);
    
    setTimeout(() => {
        clearInterval(interval);
        process.stdout.write('\r' + ' '.repeat(message.length + 10) + '\r');
    }, duration);
}

// 显示成功消息
function showSuccess(message) {
    console.log(`✅ ${message}`);
}

// 显示错误消息
function showError(message) {
    console.log(`❌ ${message}`);
}

// 显示警告消息
function showWarning(message) {
    console.log(`⚠️  ${message}`);
}

// 显示信息消息
function showInfo(message) {
    console.log(`ℹ️  ${message}`);
}

// 格式化数字显示
function formatNumber(num, decimals = 4) {
    if (typeof num !== 'number' || isNaN(num)) {
        return '无效数字';
    }
    return num.toFixed(decimals);
}

// 显示数据表格
function displayDataTable(data) {
    if (data.length === 0) {
        console.log('📊 暂无数据');
        return;
    }
    
    console.log('\n📊 数据表格:');
    console.log('┌─────┬──────────┬──────────┬─────────────────────┐');
    console.log('│ 序号│   输入   │   输出   │       时间戳        │');
    console.log('├─────┼──────────┼──────────┼─────────────────────┤');
    
    data.forEach((point, index) => {
        const date = new Date(point.timestamp).toLocaleString('zh-CN');
        const input = formatNumber(point.input, 2).padStart(8);
        const output = formatNumber(point.output, 2).padStart(8);
        const indexStr = (index + 1).toString().padStart(3);
        
        console.log(`│ ${indexStr} │ ${input} │ ${output} │ ${date} │`);
    });
    
    console.log('└─────┴──────────┴──────────┴─────────────────────┘\n');
}

// 显示预测结果
function displayPredictionResult(result) {
    console.log('\n🔮 占卜结果 🔮');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│                预测详情                 │');
    console.log('├─────────────────────────────────────────┤');
    console.log(`│ 预测值: ${formatNumber(result.prediction).padStart(10)}              │`);
    console.log(`│ 置信度: ${(result.confidence * 100).toFixed(1).padStart(6)}%              │`);
    console.log(`│ 方法:   ${result.method.padEnd(20)} │`);
    console.log('└─────────────────────────────────────────┘');
    
    // 根据置信度显示不同的占卜评语
    const confidence = result.confidence;
    let comment = '';
    
    if (confidence >= 0.8) {
        comment = '🌟 极高可信度！数字的奥秘已被揭示！';
    } else if (confidence >= 0.6) {
        comment = '✨ 较高可信度，规律逐渐清晰。';
    } else if (confidence >= 0.4) {
        comment = '🌙 中等可信度，需要更多数据验证。';
    } else if (confidence >= 0.2) {
        comment = '🌫️  较低可信度，建议增加更多数据。';
    } else {
        comment = '❓ 低可信度，数据不足或无明显规律。';
    }
    
    console.log(`\n${comment}\n`);
}

// 显示分析结果
function displayAnalysisResult(analysis) {
    console.log('\n📈 数据分析报告');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│                统计信息                 │');
    console.log('├─────────────────────────────────────────┤');
    console.log(`│ 数据点数: ${analysis.dataCount.toString().padStart(8)}              │`);
    console.log(`│ 平均输入: ${formatNumber(analysis.avgInput).padStart(10)}          │`);
    console.log(`│ 平均输出: ${formatNumber(analysis.avgOutput).padStart(10)}          │`);
    console.log(`│ 相关系数: ${formatNumber(analysis.correlation).padStart(10)}          │`);
    console.log(`│ 主频率:   ${formatNumber(analysis.dominantFrequency).padStart(10)}          │`);
    console.log('└─────────────────────────────────────────┘');
    
    // 相关性解释
    const correlation = Math.abs(analysis.correlation);
    let correlationComment = '';
    
    if (correlation >= 0.8) {
        correlationComment = '🔗 强相关性 - 输入输出关系密切';
    } else if (correlation >= 0.6) {
        correlationComment = '🔗 中强相关性 - 存在明显关系';
    } else if (correlation >= 0.4) {
        correlationComment = '🔗 中等相关性 - 关系较为明显';
    } else if (correlation >= 0.2) {
        correlationComment = '🔗 弱相关性 - 关系不太明显';
    } else {
        correlationComment = '🔗 极弱相关性 - 几乎无关系';
    }
    
    console.log(`\n${correlationComment}\n`);
}

module.exports = {
    displayBanner,
    displayHelp,
    showLoadingAnimation,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    formatNumber,
    displayDataTable,
    displayPredictionResult,
    displayAnalysisResult
};
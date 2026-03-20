// 免责声明管理
class DisclaimerManager {
    constructor() {
        this.disclaimerShown = false;
        this.init();
    }
    
    init() {
        // 检查是否已同意免责声明
        const accepted = localStorage.getItem('disclaimerAccepted');
        const acceptTime = localStorage.getItem('disclaimerAcceptTime');
        
        // 如果从未同意，或者同意超过30天，再次显示
        if (!accepted || this.isExpired(acceptTime)) {
            this.showDisclaimer();
        }
        
        // 添加免责声明栏（如果不存在）
        this.addDisclaimerBar();
    }
    
    isExpired(acceptTime) {
        if (!acceptTime) return true;
        const acceptDate = new Date(parseInt(acceptTime));
        const now = new Date();
        const daysDiff = (now - acceptDate) / (1000 * 60 * 60 * 24);
        return daysDiff > 30; // 30天后过期
    }
    
    showDisclaimer() {
        // 创建免责声明模态框
        const modal = document.createElement('div');
        modal.className = 'disclaimer-modal';
        modal.innerHTML = `
            <div class="disclaimer-modal-content">
                <div class="disclaimer-modal-header">
                    <h3>⚠️ 使用须知</h3>
                </div>
                <div class="disclaimer-modal-body">
                    <p>欢迎使用广州学校招生信息查询系统！</p>
                    <p>在使用本系统前，请仔细阅读以下重要提示：</p>
                    <ul>
                        <li>本系统为非官方查询工具，所有数据仅供参考</li>
                        <li>招生计划可能会有调整，请以官方发布为准</li>
                        <li>建议在填报志愿前咨询目标学校或教育部门</li>
                        <li>继续使用本系统即表示您接受相关免责条款</li>
                    </ul>
                    <p><a href="disclaimer.html" target="_blank">查看完整免责声明</a></p>
                </div>
                <div class="disclaimer-modal-footer">
                    <button class="disclaimer-btn disagree" onclick="disclaimerManager.decline()">拒绝使用</button>
                    <button class="disclaimer-btn agree" onclick="disclaimerManager.accept()">同意并继续</button>
                </div>
            </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .disclaimer-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
                animation: fadeIn 0.3s;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .disclaimer-modal-content {
                background: white;
                border-radius: 16px;
                max-width: 90%;
                width: 400px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: slideUp 0.3s;
            }
            
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .disclaimer-modal-header {
                background: #2c3e50;
                color: white;
                padding: 20px;
                border-radius: 16px 16px 0 0;
            }
            
            .disclaimer-modal-header h3 {
                margin: 0;
                font-size: 18px;
            }
            
            .disclaimer-modal-body {
                padding: 24px;
                line-height: 1.6;
                color: #333;
            }
            
            .disclaimer-modal-body ul {
                margin: 15px 0 15px 20px;
            }
            
            .disclaimer-modal-body li {
                margin-bottom: 8px;
            }
            
            .disclaimer-modal-body a {
                color: #3498db;
                text-decoration: none;
            }
            
            .disclaimer-modal-body a:hover {
                text-decoration: underline;
            }
            
            .disclaimer-modal-footer {
                padding: 16px 24px;
                border-top: 1px solid #dee2e6;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            
            .disclaimer-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                cursor: pointer;
                transition: opacity 0.2s;
            }
            
            .disclaimer-btn:active {
                opacity: 0.8;
            }
            
            .disclaimer-btn.agree {
                background: #27ae60;
                color: white;
            }
            
            .disclaimer-btn.disagree {
                background: #e74c3c;
                color: white;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        this.modal = modal;
    }
    
    accept() {
        localStorage.setItem('disclaimerAccepted', 'true');
        localStorage.setItem('disclaimerAcceptTime', Date.now().toString());
        this.modal.remove();
        this.showToast('感谢您的理解，祝您查询顺利！');
    }
    
    decline() {
        this.modal.remove();
        this.showToast('您拒绝了免责声明，将退出系统');
        setTimeout(() => {
            window.location.href = 'about:blank';
        }, 2000);
    }
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'disclaimer-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 30px;
            font-size: 14px;
            z-index: 2001;
            animation: slideUp 0.3s;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    
    addDisclaimerBar() {
        const disclaimerBar = document.createElement('div');
        disclaimerBar.className = 'disclaimer-bar';
        disclaimerBar.innerHTML = `
            <span class="disclaimer-icon">⚠️</span>
            <span class="disclaimer-text">本系统仅供查询参考，所有数据以官方发布为准</span>
            <a href="disclaimer.html" class="disclaimer-link" target="_blank">查看详情</a>
        `;
        
        // 添加到页面顶部
        const header = document.querySelector('.app-header');
        if (header) {
            header.parentNode.insertBefore(disclaimerBar, header.nextSibling);
        }
    }
}

// 初始化免责声明管理器
const disclaimerManager = new DisclaimerManager();

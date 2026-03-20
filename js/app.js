// 应用主逻辑
class SchoolAdmissionApp {
    constructor() {
        this.data = [];
        this.filteredData = [];
        this.currentDetail = null;
        this.init();
    }

    async init() {
        this.showLoading();
        await this.loadData();
        this.initEventListeners();
        this.updateFilterOptions();
        this.renderResult();
        this.renderStats();
    }

    async loadData() {
        try {
            const files = [
                { name: 'batch1-hk.json', batch: '第一批次(港澳子弟班)' },
                { name: 'batch1-talent.json', batch: '第一批次(特长生)' },
                { name: 'batch1-self.json', batch: '第一批次(自主招生)' },
                { name: 'batch1-art.json', batch: '第一批次(外语艺术)' },
                { name: 'batch1-zb.json', batch: '第一批次(中本贯通)' },
                { name: 'batch1-32.json', batch: '第一批次(三二分段)' },
                { name: 'batch2.json', batch: '第二批次' },
                { name: 'batch3.json', batch: '第三批次' },
                { name: 'batch4.json', batch: '第四批次' }
            ];

            const loadPromises = files.map(async file => {
                try {
                    const response = await fetch(`js/data/${file.name}`);
                    if (response.ok) {
                        const data = await response.json();
                        return data.map(item => ({
                            ...item,
                            招生批次: file.batch
                        }));
                    }
                    return [];
                } catch (e) {
                    console.warn(`加载${file.name}失败:`, e);
                    return [];
                }
            });

            const results = await Promise.all(loadPromises);
            this.data = results.flat();
            this.filteredData = [...this.data];
            
            document.getElementById('data-count').textContent = `共${this.data.length}条`;
            
        } catch (error) {
            console.error('加载数据失败:', error);
            this.showToast('加载数据失败，请刷新重试');
        }
    }

    initEventListeners() {
        // 搜索按钮
        document.getElementById('search-btn').addEventListener('click', () => this.search());
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.search();
        });

        // 筛选器
        document.getElementById('batch-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('region-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('type-filter').addEventListener('change', () => this.applyFilters());

        // 重置按钮
        document.getElementById('reset-btn').addEventListener('click', () => this.resetFilters());

        // 导出按钮
        document.getElementById('export-current').addEventListener('click', () => this.exportData('current'));
        document.getElementById('export-all').addEventListener('click', () => this.exportData('all'));

        // 标签页切换
        document.querySelectorAll('.tab-btn, .nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    search() {
        const type = document.getElementById('search-type').value;
        const keyword = document.getElementById('search-input').value.trim().toLowerCase();

        if (!keyword) {
            this.showToast('请输入关键词');
            return;
        }

        let results = this.data;

        switch(type) {
            case 'school':
                results = this.data.filter(item => 
                    item['学校名称']?.toLowerCase().includes(keyword)
                );
                break;
            case 'major':
                results = this.data.filter(item => 
                    item['项目/专业']?.toLowerCase().includes(keyword)
                );
                break;
            case 'region':
                results = this.data.filter(item => 
                    item['所在区域']?.toLowerCase().includes(keyword)
                );
                break;
            case 'type':
                results = this.data.filter(item => 
                    item['学校类型']?.toLowerCase().includes(keyword)
                );
                break;
            case 'batch':
                results = this.data.filter(item => 
                    item['招生批次']?.toLowerCase().includes(keyword)
                );
                break;
        }

        this.filteredData = results;
        this.renderResult();
        this.updateResultCount();
        
        if (results.length === 0) {
            this.showToast('未找到相关记录');
        }
    }

    applyFilters() {
        const batch = document.getElementById('batch-filter').value;
        const region = document.getElementById('region-filter').value;
        const type = document.getElementById('type-filter').value;

        this.filteredData = this.data.filter(item => {
            if (batch !== 'all' && item['招生批次'] !== batch) return false;
            if (region !== 'all' && item['所在区域'] !== region) return false;
            if (type !== 'all' && !item['学校类型']?.includes(type)) return false;
            return true;
        });

        this.renderResult();
        this.updateResultCount();
    }

    resetFilters() {
        document.getElementById('batch-filter').value = 'all';
        document.getElementById('region-filter').value = 'all';
        document.getElementById('type-filter').value = 'all';
        document.getElementById('search-input').value = '';
        this.filteredData = [...this.data];
        this.renderResult();
        this.updateResultCount();
    }

    updateFilterOptions() {
        const batches = new Set(this.data.map(item => item['招生批次']).filter(Boolean));
        const regions = new Set(this.data.map(item => item['所在区域']).filter(Boolean));
        const types = new Set(this.data.map(item => item['学校类型']).filter(Boolean));

        const batchSelect = document.getElementById('batch-filter');
        batches.forEach(batch => {
            const option = document.createElement('option');
            option.value = batch;
            option.textContent = batch;
            batchSelect.appendChild(option);
        });

        const regionSelect = document.getElementById('region-filter');
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionSelect.appendChild(option);
        });

        const typeSelect = document.getElementById('type-filter');
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });
    }

    renderResult() {
        const container = document.getElementById('result-list');
        
        if (this.filteredData.length === 0) {
            container.innerHTML = '<div class="loading">暂无数据</div>';
            return;
        }

        container.innerHTML = this.filteredData.map(item => `
            <div class="result-card" onclick="app.showDetail('${item['学校名称']}')">
                <div class="card-header">
                    <span class="school-name">${item['学校名称'] || '未知'}</span>
                    <span class="batch-badge">${item['招生批次'] || '未知'}</span>
                </div>
                <div class="card-info">
                    <span>📍 ${item['所在区域'] || '未知'}</span>
                    <span>🏫 ${item['学校类型']?.split(' ')[0] || '未知'}</span>
                </div>
                <div class="card-desc">
                    <span class="major">📖 ${item['项目/专业'] || '未知'}</span>
                    <span class="plan">👥 ${item['招生计划'] || '0'}</span>
                </div>
            </div>
        `).join('');
    }

    showDetail(schoolName) {
        const schoolData = this.data.filter(item => item['学校名称'] === schoolName);
        if (schoolData.length === 0) return;

        const first = schoolData[0];
        const container = document.getElementById('detail-card');

        let majorList = '';
        schoolData.forEach((item, index) => {
            majorList += `
                <div class="major-item">
                    <div class="major-name">${index + 1}. ${item['项目/专业'] || '未知'}</div>
                    <div class="major-detail">
                        <span>👥 计划: ${item['招生计划'] || '0'}</span>
                        <span>💰 要求: ${item['录取要求'] || '无'}</span>
                    </div>
                    ${item['备注'] ? `<div class="major-detail"><span>📝 备注: ${item['备注']}</span></div>` : ''}
                </div>
            `;
        });

        container.innerHTML = `
            <div class="detail-header">
                <h2>${first['学校名称']}</h2>
                <span class="detail-batch">${first['招生批次'] || '未知'}</span>
            </div>
            
            <div class="detail-section">
                <h3>🏫 基本信息</h3>
                <div class="info-grid">
                    <span class="info-label">学校类型</span>
                    <span class="info-value">${first['学校类型'] || '未知'}</span>
                    <span class="info-label">所在区域</span>
                    <span class="info-value">${first['所在区域'] || '未知'}</span>
                    <span class="info-label">联系电话</span>
                    <span class="info-value">${first['联系电话'] || '未知'}</span>
                    <span class="info-label">住宿情况</span>
                    <span class="info-value">${first['住宿情况'] || '未知'}</span>
                </div>
            </div>

            <div class="detail-section">
                <h3>📚 招生项目 (${schoolData.length})</h3>
                <div class="major-list">
                    ${majorList}
                </div>
            </div>
        `;

        this.switchTab('detail');
    }

    renderStats() {
        const container = document.getElementById('stats-container');
        
        // 按批次统计
        const batchStats = {};
        this.data.forEach(item => {
            const batch = item['招生批次'] || '未知';
            batchStats[batch] = (batchStats[batch] || 0) + 1;
        });

        // 按区域统计
        const regionStats = {};
        this.data.forEach(item => {
            const region = item['所在区域'] || '未知';
            regionStats[region] = (regionStats[region] || 0) + 1;
        });

        // 按类型统计
        const typeStats = {};
        this.data.forEach(item => {
            const type = item['学校类型']?.split(' ')[0] || '未知';
            typeStats[type] = (typeStats[type] || 0) + 1;
        });

        container.innerHTML = `
            <div class="stats-section">
                <h3>📦 按批次统计</h3>
                ${Object.entries(batchStats).map(([batch, count]) => `
                    <div class="stats-item">
                        <span class="stats-label">${batch}</span>
                        <span class="stats-value">${count} 条</span>
                    </div>
                `).join('')}
            </div>

            <div class="stats-section">
                <h3>📍 按区域统计</h3>
                ${Object.entries(regionStats).sort((a,b) => b[1] - a[1]).slice(0, 10).map(([region, count]) => `
                    <div class="stats-item">
                        <span class="stats-label">${region}</span>
                        <span class="stats-value">${count} 条</span>
                    </div>
                `).join('')}
            </div>

            <div class="stats-section">
                <h3>🏷️ 按学校类型统计</h3>
                ${Object.entries(typeStats).sort((a,b) => b[1] - a[1]).slice(0, 10).map(([type, count]) => `
                    <div class="stats-item">
                        <span class="stats-label">${type}</span>
                        <span class="stats-value">${count} 条</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    exportData(type) {
        const data = type === 'all' ? this.data : this.filteredData;
        
        if (data.length === 0) {
            this.showToast('没有可导出的数据');
            return;
        }

        // 转换为工作表
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '招生计划');

        // 导出文件
        const filename = type === 'all' 
            ? `广州学校招生计划_全部_${new Date().toISOString().slice(0,10)}.xlsx`
            : `广州学校招生计划_筛选结果_${new Date().toISOString().slice(0,10)}.xlsx`;

        XLSX.writeFile(wb, filename);
        
        document.getElementById('export-status').textContent = `已导出 ${data.length} 条记录`;
        setTimeout(() => {
            document.getElementById('export-status').textContent = '';
        }, 3000);
    }

    switchTab(tab) {
        // 切换标签页
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.getElementById(`tab-${tab}`).classList.add('active');

        // 更新按钮状态
        document.querySelectorAll('.tab-btn, .nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll(`[data-tab="${tab}"]`).forEach(btn => btn.classList.add('active'));
    }

    updateResultCount() {
        document.getElementById('result-count').textContent = `${this.filteredData.length} 条记录`;
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 2000);
    }

    showLoading() {
        const container = document.getElementById('result-list');
        container.innerHTML = '<div class="loading">加载数据中...</div>';
    }
}

// 初始化应用
const app = new SchoolAdmissionApp();

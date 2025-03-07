document.addEventListener('DOMContentLoaded', () => {
    const lineBtn = document.getElementById('lineBtn');
    const parseBtn = document.getElementById('parseBtn');
    const optionsBox = document.querySelector('.line-options');
    const videoUrl = document.getElementById('videoUrl');
    const resultFrame = document.getElementById('resultFrame');
    const iframeContainer = document.querySelector('.iframe-container');

    let currentLine = null;
    let isFirstLoad = true;

    // 处理URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const videoParam = urlParams.get('url');

    // 加载线路数据
    fetch('lines.json')
        .then(res => res.json())
        .then(data => {
            // 设置默认线路
            currentLine = data.线路列表[0];
            lineBtn.textContent = currentLine.name;

            // 加载线路选项
            data.线路列表.forEach(line => {
                const option = document.createElement('div');
                option.className = 'line-option';
                option.textContent = line.name;
                option.onclick = () => {
                    currentLine = line;
                    lineBtn.textContent = line.name;
                    optionsBox.style.display = 'none';
                    if (videoUrl.value) startParsing();
                };
                optionsBox.appendChild(option);
            });

            // 自动解析URL参数
            if (videoParam) {
                videoUrl.value = decodeURIComponent(videoParam);
                startParsing();
            }
        })
        .catch(error => {
            console.error('加载线路失败:', error);
            alert('线路加载失败，请刷新重试');
        });

    // 线路选择切换
    lineBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        optionsBox.style.display = optionsBox.style.display === 'block' ? 'none' : 'block';
    });
    // 解析功能 (完整修复版)
    function startParsing() {
        if (!currentLine) return alert('请选择解析线路');
        if (!videoUrl.value.trim()) return alert('请输入视频地址');
        
        const encodedUrl = encodeURIComponent(videoUrl.value.trim()); // 提前声明
        
        // 创建新iframe
        const newFrame = document.createElement('iframe');
        newFrame.id = 'resultFrame';
        newFrame.allow = 'fullscreen';
        newFrame.src = `${currentLine.url}${encodedUrl}`;

        // 清空容器并添加新iframe
        iframeContainer.innerHTML = '';
        iframeContainer.appendChild(newFrame);

        // 更新浏览器URL
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('url', videoUrl.value.trim());
        history.replaceState(null, null, newUrl);

        // 加载状态控制
        iframeContainer.classList.add('loading');
    }

    // 解析按钮点击
    parseBtn.addEventListener('click', startParsing);
    // iframe加载处理更新
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('resultFrame').onload = () => {
            iframeContainer.classList.remove('loading');
            // ... 原有加载动画代码 ...
        };
    });
    // 全局点击关闭选项
    document.addEventListener('click', () => {
        optionsBox.style.display = 'none';
    });
    // 输入框回车触发解析
    videoUrl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startParsing();
    });
});
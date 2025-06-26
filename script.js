// 全域變數
let actresses = [];
let movies = [];
let currentActressName = null;
let currentMovieId = null;
let filteredActresses = [];
let currentActressMovies = []; // 當前演員的影片列表
let isAuthenticated = false;

// 密碼設定
const PASSWORD = "0630";

// 設定密碼檢查
function setupPasswordCheck() {
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');
    const errorMsg = document.getElementById('errorMsg');
    
    // 登入按鈕點擊
    loginBtn.addEventListener('click', checkPassword);
    
    // Enter 鍵登入
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
    
    // 輸入時清除錯誤訊息
    passwordInput.addEventListener('input', () => {
        errorMsg.classList.remove('show');
    });
    
    // 自動聚焦密碼輸入框
    passwordInput.focus();
}

// 檢查密碼
function checkPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const errorMsg = document.getElementById('errorMsg');
    const inputPassword = passwordInput.value;
    
    if (inputPassword === PASSWORD) {
        // 密碼正確
        isAuthenticated = true;
        showPage('homePage');
        
        // 如果資料已載入，初始化首頁
        if (actresses.length > 0) {
            initHomePage();
        }
    } else {
        // 密碼錯誤
        errorMsg.classList.add('show');
        passwordInput.value = '';
        passwordInput.focus();
        
        // 3秒後自動隱藏錯誤訊息
        setTimeout(() => {
            errorMsg.classList.remove('show');
        }, 3000);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 先檢查密碼
    setupPasswordCheck();
    
    try {
        // 載入演員資料
        const actressResponse = await fetch('actresses.json');
        const actressData = await actressResponse.json();
        actresses = actressData.actresses;
        
        console.log('🔍 載入的演員資料:', actresses);
        
        // 載入影片資料
        const movieResponse = await fetch('movies.json');
        const movieData = await movieResponse.json();
        movies = movieData.movies;
        
        console.log('✅ 載入完成！', actresses.length, '位演員，', movies.length, '部影片');
        console.log('📋 演員列表：', actresses.map(a => a.name).join('、'));
        
        // 如果已認證，初始化首頁
        if (isAuthenticated) {
            initHomePage();
        }
        
        // 綁定事件
        bindEvents();
        
    } catch (error) {
        console.error('載入資料失敗:', error);
        alert('載入資料失敗，請檢查 actresses.json 和 movies.json 檔案');
    }
});

// 綁定事件
function bindEvents() {
    // 搜尋功能
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    
    // 篩選和排序
    document.getElementById('cupFilter').addEventListener('change', handleFilter);
    document.getElementById('sortBy').addEventListener('change', handleSort);
    
    // 影片排序事件
    document.getElementById('movieSortBy').addEventListener('change', handleMovieSort);
    
    // 返回按鈕
    document.getElementById('backToHome').addEventListener('click', () => showPage('homePage'));
    document.getElementById('backToActress').addEventListener('click', () => showActressPage(currentActressName));
    document.getElementById('backToHomeFromMovie').addEventListener('click', () => showPage('homePage'));
    
    // Enter 鍵搜尋
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}

// 處理影片排序
function handleMovieSort() {
    const sortBy = document.getElementById('movieSortBy').value;
    sortMovies(currentActressMovies, sortBy);
    renderMovieCards(currentActressName, currentActressMovies);
}

// 排序影片
function sortMovies(movies, sortBy) {
    switch (sortBy) {
        case 'newest':
            movies.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
            break;
        case 'oldest':
            movies.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
            break;
    }
}

// 初始化首頁
function initHomePage() {
    filteredActresses = [...actresses];
    sortActresses('name');
    renderActressCards();
}

// 處理搜尋
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredActresses = [...actresses];
    } else {
        filteredActresses = actresses.filter(actress => 
            actress.name.toLowerCase().includes(searchTerm)
        );
    }
    
    handleFilter(); // 重新應用篩選
}

// 處理篩選
function handleFilter() {
    const cupFilter = document.getElementById('cupFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    let filtered = actresses;
    
    // 先應用搜尋
    if (searchTerm) {
        filtered = filtered.filter(actress => 
            actress.name.toLowerCase().includes(searchTerm)
        );
    }
    
    // 再應用罩杯篩選
    if (cupFilter) {
        filtered = filtered.filter(actress => actress.cupSize === cupFilter);
    }
    
    filteredActresses = filtered;
    handleSort(); // 重新應用排序
}

// 處理排序
function handleSort() {
    const sortBy = document.getElementById('sortBy').value;
    sortActresses(sortBy);
    renderActressCards();
}

// 排序演員
function sortActresses(sortBy) {
    switch (sortBy) {
        case 'name':
            filteredActresses.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'debutDate':
            filteredActresses.sort((a, b) => new Date(a.debutDate) - new Date(b.debutDate));
            break;
        case 'cupSizeLarge':
            filteredActresses.sort((a, b) => {
                const cupOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
                return cupOrder.indexOf(b.cupSize) - cupOrder.indexOf(a.cupSize);
            });
            break;
        case 'cupSizeSmall':
            filteredActresses.sort((a, b) => {
                const cupOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
                return cupOrder.indexOf(a.cupSize) - cupOrder.indexOf(b.cupSize);
            });
            break;
    }
}

// 渲染演員卡片
function renderActressCards() {
    const container = document.getElementById('actressCards');
    container.innerHTML = '';
    
    if (filteredActresses.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: white; font-size: 18px; grid-column: 1/-1; margin-top: 50px;">😅 找不到符合條件的演員呢</div>';
        return;
    }
    
    filteredActresses.forEach(actress => {
        const card = createActressCard(actress);
        container.appendChild(card);
    });
}

// 創建演員卡片
function createActressCard(actress) {
    const card = document.createElement('div');
    card.className = 'actress-card fade-in';
    card.onclick = () => showActressPage(actress.name);
    
    card.innerHTML = `
        <img src="${actress.avatar}" alt="${actress.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWclueJh+i8ieWFpeWksei0lzwvdGV4dD48L3N2Zz4='">
        <div class="actress-card-info">
            <h3>${actress.name}</h3>
            <p>${actress.cupSize} 罩杯 • ${formatDate(actress.debutDate)} 出道</p>
        </div>
    `;
    
    return card;
}

// 顯示演員詳情頁面
function showActressPage(actressName) {
    currentActressName = actressName;
    const actress = actresses.find(a => a.name === actressName);
    
    if (!actress) {
        alert('找不到演員資料');
        return;
    }
    
    // 填入演員基本資料
    const avatarElement = document.getElementById('actressAvatar');
    avatarElement.style.backgroundImage = `url('${actress.avatar}')`;
    
    document.getElementById('actressName').textContent = actress.name;
    document.getElementById('actressAlias').textContent = actress.alias || '無';
    document.getElementById('actressCup').textContent = actress.cupSize;
    document.getElementById('actressHeight').textContent = actress.height || '未知';
    document.getElementById('actressMeasurements').textContent = actress.measurements || '未知';
    document.getElementById('actressDebut').textContent = formatDate(actress.debutDate);
    
    // 渲染該演員的影片
    renderMovieCards(actressName);
    
    showPage('actressPage');
}

// 渲染影片卡片（含排序功能）
function renderMovieCards(actressName, moviesList = null) {
    const container = document.getElementById('movieCards');
    container.innerHTML = '';
    
    // 如果沒有傳入影片列表，就重新篩選
    if (!moviesList) {
        currentActressMovies = movies.filter(movie => 
            movie.actresses.includes(actressName)
        );
        
        // 預設按最新排序
        sortMovies(currentActressMovies, 'newest');
        
        // 重設排序選項為預設值
        document.getElementById('movieSortBy').value = 'newest';
    } else {
        currentActressMovies = moviesList;
    }
    
    if (currentActressMovies.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: white; font-size: 18px; grid-column: 1/-1; margin-top: 50px;">😢 還沒有收藏這位演員的作品</div>';
        return;
    }
    
    currentActressMovies.forEach(movie => {
        const card = createMovieCard(movie);
        container.appendChild(card);
    });
}

// 創建影片卡片
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card fade-in';
    card.onclick = () => showMoviePage(movie.id);
    
    // 截斷標題，如果太長就加省略號
    const maxTitleLength = 20;
    let displayTitle = movie.title;
    if (movie.title.length > maxTitleLength) {
        displayTitle = movie.title.substring(0, maxTitleLength) + '...';
    }
    
    card.innerHTML = `
        <img src="${movie.image}" alt="${movie.code}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWclueJh+i8ieWFpeWksei0lzwvdGV4dD48L3N2Zz4='">
        <div class="movie-card-info">
            <h4>${movie.code}</h4>
            <p>${displayTitle}</p>
        </div>
    `;
    
    return card;
}

// 顯示影片詳情頁面
function showMoviePage(movieId) {
    currentMovieId = movieId;
    const movie = movies.find(m => m.id === movieId);
    
    if (!movie) {
        alert('找不到影片資料');
        return;
    }
    
    // 填入影片基本資料
    document.getElementById('movieImage').src = movie.image;
    document.getElementById('movieImage').alt = movie.code;
    document.getElementById('movieCode').textContent = movie.code;
    document.getElementById('movieTitle').textContent = movie.title;
    document.getElementById('movieDesc').textContent = movie.description;
    document.getElementById('movieUrl').href = movie.url;
    
    // 處理演員列表（可點擊）
    const actressesContainer = document.getElementById('movieActresses');
    actressesContainer.innerHTML = '';
    
    movie.actresses.forEach((actressName, index) => {
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'actress-link';
        link.textContent = actressName;
        link.onclick = (e) => {
            e.preventDefault();
            showActressPage(actressName);
        };
        
        actressesContainer.appendChild(link);
        
        // 如果不是最後一個演員，加上分隔符
        if (index < movie.actresses.length - 1) {
            actressesContainer.appendChild(document.createTextNode('、'));
        }
    });
    
    // 處理標籤
    const tagsContainer = document.getElementById('movieTags');
    tagsContainer.innerHTML = '';
    
    movie.tags.forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'tag';
        tagSpan.textContent = tag;
        tagsContainer.appendChild(tagSpan);
    });
    
    showPage('moviePage');
}

// 顯示指定頁面
function showPage(pageId) {
    // 隱藏所有頁面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 顯示指定頁面
    document.getElementById(pageId).classList.add('active');
    
    // 滾動到頂部
    window.scrollTo(0, 0);
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
}

// 防止右鍵菜單（簡單的保護措施）
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// 防止選取文字（簡單的保護措施）
document.addEventListener('selectstart', (e) => {
    if (e.target.tagName !== 'INPUT') {
        e.preventDefault();
    }
});

// 簡單的鍵盤快捷鍵
document.addEventListener('keydown', (e) => {
    // ESC 鍵返回首頁
    if (e.key === 'Escape') {
        showPage('homePage');
    }
    
    // Ctrl+F 聚焦搜尋框
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
});

// 載入完成提示
window.addEventListener('load', () => {
    console.log('📚 個人書籤管理系統載入完成！');
    console.log('💡 小提示：按 ESC 可以快速返回首頁，Ctrl+F 可以快速聚焦搜尋框');
});
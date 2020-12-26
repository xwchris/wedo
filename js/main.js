(function() {
    const $ = document.querySelector.bind(document);
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const chatId = params.get('chatId');
    const userId = params.get('userId');
    const channel = new BroadcastChannel(chatId);
    console.log('channel build, chatId:', chatId, 'userId:', userId);
    let messages = [];
    let user = {};

    function contentScrollToBottom() {
        $('#content').scroll(0, Number.MAX_SAFE_INTEGER);
    }

    function sendMessage(message) {
        const next = { userId, message }
        channel.postMessage(JSON.stringify(next));
        messages.push(next);
        renderMessage(message, true);
    }

    function renderMessage(message, isRight) {
        const $m = document.createElement('div');
        $m.setAttribute('class', `message ${isRight ? 'right' : ''}`);
        $m.innerHTML = `
            <div class="avatar" style="background-image: url('${user.avatar}');"></div>
            <div class="text">${message}</div>
        `
        $('#content').appendChild($m);
        // 渲染消息后滚动到最底部
        contentScrollToBottom();
    }

    function init() {
        // 监听输入事件
        window.onkeyup = (e) => {
            const keyCode = e.keyCode;
            if (keyCode === 13) {
                const message = $('#input').value;
                sendMessage(message);
                // 清空输入框
                $('#input').value = '';
            }
        }

        // 监听消息
        channel.onmessage = (e) => {
            console.log('listen:', e.data);
            const message = JSON.parse(e.data);
            messages.push(message);
            renderMessage(message.message, message.userId === userId);
        }

        const storagePrefix = 'wedo';
        const messageStorageId = `${storagePrefix}_chat_${chatId}_${userId}`;
        const userStorageId = `${storagePrefix}_user`;
        

        // 操作事件绑定
        $('#dot').onclick = () => {
            const shouldHiden = $('#operate').className.indexOf('hidden') === -1;
            $('#operate').setAttribute('class', `operate ${shouldHiden ? 'hidden' : ''}`)
        }
        $('#save').onclick = () => {
            localStorage.setItem(messageStorageId, JSON.stringify(messages));
            console.log("record save success");
        }
        $('#clear').onclick = () => {
            messages = [];
            localStorage.setItem(messageStorageId, '');
            $('#content').innerHTML = '';
            console.log("record clear success");
        }
        $('#name').onchange = (e) => {
            const name = e.target.value;
            user.name = name;
            users[userId] = user;
            localStorage.setItem(userStorageId, JSON.stringify(users));
            console.log("name", name);
        }
        $('#input').onfocus = () => {
            contentScrollToBottom();
        }


        // 初始渲染
        // 获取当前用户完整信息
        const userRes = localStorage.getItem(userStorageId);
        const users = JSON.parse(userRes || '{}');
        user = users[userId] || { userId, name: '未命名', avatar: './images/avatar.jpg' };
        $('#name').value = user.name;
        console.log('current user', user);
        // 初始渲染消息
        const messagesRes = localStorage.getItem(messageStorageId)
        messages = JSON.parse(messagesRes || '[]');
        messages.forEach(m => renderMessage(m.message, m.userId === userId));
    }

    init();
})();
(function() {
    const $ = document.querySelector.bind(document);
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const chatId = params.get('chatId');
    const userId = params.get('userId');
    const channel = new BroadcastChannel(chatId);
    console.log('channel build, chatId:', chatId, 'userId:', userId);
    let messages = [];
    const defaultUser = { userId, name: '此人是无名氏', avatar: './images/avatar.jpg', bg: '' };
    let users = {};
    let user = {};

    function random() {
        return Math.random().toString(36).slice(-6);
    }

    function contentScrollToBottom() {
        $('#content').scroll(0, Number.MAX_SAFE_INTEGER);
    }

    function sendMessage(message) {
        const next = { userId, message }
        channel.postMessage(JSON.stringify(next));
        messages.push(next);
        renderMessage(next);
    }

    function renderMessage(message) {
        const isOwn = message.userId === userId;
        const currentUser = users[message.userId] || defaultUser;
        const $m = document.createElement('div');
        $m.setAttribute('class', `message ${isOwn ? 'right' : ''}`);
        $m.innerHTML = `
            <div class="avatar" style="background-image: url('${currentUser.avatar}');"></div>
            <div class="text">${message.message}</div>
        `
        $('#content').appendChild($m);
        // 渲染消息后滚动到最底部
        contentScrollToBottom();
    }

    function renderUser(user) {
        const isOwn = user.userId === userId;
        const $a = document.createElement('a');
        $a.setAttribute('class', `user-item ${isOwn ? 'current' : ''}`);
        $a.setAttribute('style', `background-image: url('${user.avatar}')`);
        $a.setAttribute('target', '_blank');
        $a.setAttribute('id', user.userId);
        $a.setAttribute('href', `/chat.html?chatId=${chatId}&userId=${user.userId}`);
        $('#users').insertBefore($a, $('#add-user'));
    }

    function render() {
        $('#content').innerHTML = '';
        messages.forEach(renderMessage);
    }

    function renderUsers() {
        $('#users').innerHTML = '<a class="user-item user-add" id="add-user"></a>';
        Object.keys(users).forEach(userId => renderUser(users[userId]));
    }

    function imageRead(file, callback) {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = (e) => {
            const image = e.target.result;
            callback(image);
        };
    }

    function updateBg() {
        if (user.bg) {
            $('#content').style.backgroundImage = `url('${user.bg}')`;
        }
    }


    function init() {
        const storagePrefix = 'wedo';
        const messageStorageId = `${storagePrefix}_chat_${chatId}_${userId}`;
        const userStorageId = `${storagePrefix}_user_${chatId}`;

        // 获取当前用户完整信息
        const userRes = localStorage.getItem(userStorageId);
        users = JSON.parse(userRes || '{}');
        user = users[userId] || defaultUser;
        users[userId] = user;
        localStorage.setItem(userStorageId, JSON.stringify(users));
        $('#name').value = user.name;
        console.log('current user', user);

        function updateUser({ name, avatar, bg }) {
            user.name = name || user.name;
            user.avatar = avatar || user.avatar;
            user.bg = bg || user.bg;
            users[userId] = user;
            localStorage.setItem(userStorageId, JSON.stringify(users));
        }

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
            renderMessage(message);
        }
        

        // 操作事件绑定
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
            updateUser({ name });
        }
        $('#input').onfocus = () => {
            contentScrollToBottom();
        }
        $('#avatar').onclick = (e) => {
            $('#file').click();
        }
        $('#bg').onclick = () => {
            $('#bgFile').click();
        }
        $('#file').onchange = (e) => {
            imageRead(e.target.files[0], (url) => {
                updateUser({ avatar: url });
                render();
                $(`#${userId}`).setAttribute('style', `background-image: url('${url}')`);
            });
        }
        $('#bgFile').onchange = (e) => {
            imageRead(e.target.files[0], (url) => {
                updateUser({ bg: url });
                updateBg(url);
                render();
            });
        }
        $('#root').oncontextmenu = (e) => {
            const $menu = $('#menu');
            $menu.style.display = 'block';
            $menu.style.top = `${e.clientY + 2}px`;
            $menu.style.left = `${e.clientX + 2}px`;
            e.preventDefault();
            return false;
        }
        document.onclick = () => {
            $('#menu').style.display = 'none';
        }

        // 初始渲染消息
        const messagesRes = localStorage.getItem(messageStorageId)
        messages = JSON.parse(messagesRes || '[]');
        render();
        renderUsers();
        updateBg();

        $('#add-user').onclick = (e) => {
            const newUser = { ...defaultUser, userId: random() }
            users[newUser.userId] = newUser;
            localStorage.setItem(userStorageId, JSON.stringify(users));
            renderUser(newUser);
        }
    }

    init();
})();
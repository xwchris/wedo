(function() {
    const $ = document.querySelector.bind(document);

    function random() {
        return Math.random().toString(36).slice(-6);
    }
    
    function init() {
        const storagePrefix = 'wedo';
        const storageId = `${storagePrefix}_chat`;
        const defaultUser = { name: '此人是无名氏', avatar: './images/avatar.jpg', bg: '' };

        const list = JSON.parse(localStorage.getItem(storageId) || '[]');
        let html = list.map(chatId => {
            const users = JSON.parse(localStorage.getItem(`${storagePrefix}_user_${chatId}`))
            const firstUser = users[Object.keys(users)[0]];
            return `
                <a class="chat" href="/chat.html?chatId=${chatId}&userId=${firstUser.userId}" target="_blank">
                    <div class="chat-id">chat: ${chatId}</div>
                    <div class="user">用户数 ${Object.keys(users).length}</div>
                </a>
            `
        }).join('')
        html += `
            <div class="chat chat-line" id="plus">
                <div class="plus"></div>
            </div>
        `
        $('#root').innerHTML = html;

        $('#plus').onclick = (e) => {
            const chatId = random();
            const userStorageId = `${storagePrefix}_user_${chatId}`;
            list.push(chatId);
            localStorage.setItem(storageId, JSON.stringify(list));
            const users = JSON.parse(localStorage.getItem(userStorageId) || '{}');
            let usersLength = Object.keys(users);
            if (usersLength <= 0) {
                const userId = random();
                users[userId] = { ...defaultUser, userId };
                usersLength = 1;
                localStorage.setItem(userStorageId, JSON.stringify(users));
            }
            const firstUser = users[Object.keys(users)[0]];
            const $chat = document.createElement("a");
            $chat.setAttribute('class', 'chat');
            $chat.setAttribute('target', '_blank');
            $chat.setAttribute('href', `/chat.html?chatId=${chatId}&userId=${firstUser.userId}`)
            $chat.innerHTML = `
                <div class="chat-id">chat: ${chatId}</div>
                <div class="user">用户数 ${usersLength}</div>
            `
            $('#root').insertBefore($chat, e.currentTarget);
        }
    }

    init();
})();
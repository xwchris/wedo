(function() {
    const $ = document.querySelector.bind(document);

    function random() {
        return Math.random().toString(36).slice(-6);
    }
    
    function init() {
        const defaultUserId = 1;
        const storageId = 'wedo_chat';

        const list = JSON.parse(localStorage.getItem(storageId) || '[]');
        let html = list.map(item => `
            <a class="chat" href="/chat.html?chatId=${item.chatId}&userId=${item.users[0]}" target="_blank">
                <div class="chat-id">chat: ${item.chatId}</div>
                <div class="user">用户数 ${item.users.length}</div>
            </a>
        `).join('')
        html += `
            <div class="chat chat-line" id="plus">
                <div class="plus"></div>
            </div>
        `
        $('#root').innerHTML = html;

        $('#plus').onclick = (e) => {
            const chatId = random();
            const chat = { chatId, users: [defaultUserId] };
            list.push(chat);
            localStorage.setItem(storageId, JSON.stringify(list));
            const $chat = document.createElement("a");
            $chat.setAttribute('class', 'chat');
            $chat.setAttribute('target', '_blank');
            $chat.setAttribute('href', `/chat.html?chatId=${chatId}&userId=${chat.users[0]}`)
            $chat.innerHTML = `
                <div class="chat-id">chat: ${chat.chatId}</div>
                <div class="user">用户数 ${chat.users.length}</div>
            `
            $('#root').insertBefore($chat, e.currentTarget);
        }
    }

    init();
})();
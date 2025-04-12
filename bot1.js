const http = require('http');
const mineflayer = require('mineflayer');
require('colors').enable();

// --- Configlar ---
const botUsername = 'lavash_kibr';
const botPassword = 'fambot';
const admin = 'lavash_city';
let mcData;

// --- Bot sozlamalari ---
const botOption = {
    host: 'hypixel.uz',
    port: 25565,
    username: botUsername,
    password: botPassword,
    version: '1.18.1',
};

// --- HTTP server (UptimeRobot uchun) ---
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot ishlayapti\n');
}).listen(process.env.PORT || 3000, () => {
    console.log('HTTP server ishga tushdi (uptime uchun)');
});

// --- Botni ishga tushirish ---
init();

function init() {
    const bot = mineflayer.createBot(botOption);

    bot.on('spawn', () => {
        mcData = require('minecraft-data')(bot.version);
        console.log('Bot serverga kirdi!'.green);

        // Kirganda buyrug‘i
        bot.chat('/is warp miner2');

        // 20 soniyadan keyin avtomatik qazish boshlanadi
        setTimeout(() => {
            dig();
        }, 20000);
    });

    // Chat event
    bot.on('messagestr', (message) => {
        if (message.startsWith('Skyblock »')) return;
        console.log(message);

        // Restart signal
        if (message === 'Server: Serverni kunlik restartiga 30 sekund qoldi') {
            bot.quit('20min');
        }

        // Ro‘yxatdan o‘tish yoki login
        if (message.includes('register')) {
            bot.chat(`/register ${botPassword} ${botPassword}`);
        }
        if (message.includes('login')) {
            bot.chat(`/login ${botPassword}`);
        }
        if (message.includes('Вы успешно вошли в аккаунт')) {
            bot.chat('/is warp miner1');
        }
    });

    // Admin buyruqlarini bajarish
    bot.on('chat', (usernameSender, message) => {
        if (usernameSender === admin && message.startsWith('! ')) {
            const command = message.replace('! ', '');
            bot.chat(command);
        }
    });

    // Qazish funksiyasi
    async function dig() {
        try {
            if (!bot.heldItem || !bot.heldItem.name.includes('pickaxe')) {
                const pickaxe = bot.inventory.items().find(i => i.name.includes('pickaxe'));
                if (pickaxe) await bot.equip(pickaxe, 'hand');
                else return bot.quit(); // Pickaxe yo‘q bo‘lsa chiqib ketadi
            }

            const block = bot.blockAtCursor(7);
            if (!block) {
                return setTimeout(dig, 100); // Blok topilmasa kutadi
            }

            await bot.dig(block);
            dig(); // Recursive chaqirish
        } catch (err) {
            console.log('Xatolik:', err);
            setTimeout(dig, 500); // Xatolik bo‘lsa keyinroq urinadi
        }
    }
}

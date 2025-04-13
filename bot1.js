const mineflayer = require('mineflayer');
const http = require('http');
require('colors');

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
    console.log('HTTP server ishga tushdi (uptime uchun)'.blue);
});

// --- Botni ishga tushirish ---
init();

function init() {
    const bot = mineflayer.createBot(botOption);

    bot.on('spawn', () => {
        mcData = require('minecraft-data')(bot.version);
        console.log('✅ Bot serverga kirdi!'.green);
        bot.chat('/is warp miner2');

        setTimeout(() => {
            dig();
        }, 20000);
    });

    bot.on('messagestr', (message) => {
        if (message.startsWith('Skyblock »')) return;
        console.log(message);

        if (message === 'Server: Serverni kunlik restartiga 30 sekund qoldi') {
            bot.quit('20min');
        }

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

    bot.on('chat', (usernameSender, message) => {
        if (usernameSender === admin && message.startsWith('! ')) {
            const command = message.replace('! ', '');
            bot.chat(command);
        }
    });

    async function dig() {
        try {
            if (!bot.heldItem || !bot.heldItem.name.includes('pickaxe')) {
                const pickaxe = bot.inventory.items().find(i => i.name.includes('pickaxe'));
                if (pickaxe) await bot.equip(pickaxe, 'hand');
                else {
                    console.log("❌ Pickaxe yo‘q. Bot chiqmoqda.".red);
                    return bot.quit();
                }
            }

            const block = bot.blockAtCursor(7);
            if (!block) {
                return setTimeout(dig, 100);
            }

            console.log("⛏️ Qazish funksiyasi tayyor, ammo algoritm yo'q.");
            // Qazish algoritmini shu yerga yozing (masalan: bot.dig(block))

        } catch (err) {
            console.log(`❌ Qazishda xatolik: ${err.message}`.red);
        }
    }

    bot.on('kicked', (reason) => {
        console.log(`🚫 Serverdan haydaldi: ${reason}`.red);
    });

    bot.on('error', (err) => {
        console.log(`⚠️ Xato yuz berdi: ${err.message}`.yellow);
    });

    bot.on('end', () => {
        console.log("🔁 Bot ulanishni yakunladi. Qayta ulanish...".gray);
        setTimeout(init, 5000);
    });
}

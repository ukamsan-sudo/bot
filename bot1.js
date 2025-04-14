const mineflayer = require('mineflayer'); 
const Vec3 = require('vec3');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalNear } = goals;
const http = require('http');

// --- Uptime uchun HTTP server ---
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('🟢 Bot online\n');
}).listen(process.env.PORT || 3001, () => {
    console.log(`🟢 Keep-alive server ishga tushdi: http://localhost:${process.env.PORT || 3001}`);
});

// --- Sozlamalar ---
const pswd = "fambot";
const username = "lavash_kibr";
const p1 = [2734, 108, 1885];
const p2 = [2735, 108, 1881];

// --- Koordinatalar oralig‘i ---
function range(a, b) {
    a = parseInt(a);
    b = parseInt(b);
    let res = [];
    if (a > b) for (let i = a; i >= b; i--) res.push(i);
    else for (let i = a; i <= b; i++) res.push(i);
    return res;
}

const xrange = range(p1[0], p2[0]);
const yrange = range(p1[1], p2[1]);
const zrange = range(p1[2], p2[2]);

function createBot() {
    const bot = mineflayer.createBot({
        host: 'ir.skyblock.uz',
        port: 25566,
        username,
        skipValidation: true,
        fakeHost: 'ir.skyblock.uz',
        version: '1.17.1',
    });

    bot.loadPlugin(pathfinder);
    let status = "starting";

    bot.once('spawn', async () => {
        console.log('✅ Bot serverga kirdi!');
        console.log(`📍 Botning turgan joyi: X:${bot.entity.position.x} Y:${bot.entity.position.y} Z:${bot.entity.position.z}`);
        status = "waiting_for_login";

        bot.on('message', (message) => {
            const msg = String(message);
            console.log(`💬 Xabar: ${msg}`);

            if (status === "waiting_for_login") {
                if (msg.toLowerCase().includes("register")) {
                    console.log("📝 Ro‘yxatdan o‘tmoqda...");
                    bot.chat(`/register ${pswd} ${pswd}`);
                } else if (msg.toLowerCase().includes("login")) {
                    console.log("🔐 Kirish amalga oshirilmoqda...");
                    bot.chat(`/login ${pswd}`);
                    status = "logged_in";
                }
            }

            // Anti-bot captcha bo‘lsa aniqlab javob berish (agar kerak bo‘lsa)
            const match = msg.match(/\/captcha (\w+)/i);
            if (match) {
                bot.chat(`/captcha ${match[1]}`);
                console.log(`🤖 Captcha javob berildi: ${match[1]}`);
            }
        });

        // 👇 Chat buyruqlar: !say
        bot.on('chat', (username, message) => {
            if (username !== 'lavash_city') return;

            if (message.startsWith('!say ')) {
                const toSay = message.slice(5);
                if (toSay.trim().length > 0) {
                    bot.chat(toSay);
                    console.log(`📢 Bot chatga yozdi: ${toSay}`);
                } else {
                    bot.chat("❌ Yoziladigan matn yo‘q.");
                }
            }
        });

        // 10 soniyadan so‘ng teleport
        setTimeout(() => {
            bot.chat('/is visit KomiljonHelper');
            console.log("🌀 /is visit KomiljonHelper ga teleport...");
        }, 10000);

        // 25 soniyadan so‘ng nuqtaga yurish
        setTimeout(() => {
            const defaultMove = new Movements(bot);
            bot.pathfinder.setMovements(defaultMove);
            bot.pathfinder.setGoal(new GoalNear(2734, 107, 1886, 1));
            console.log("➡️ Belgilangan nuqtaga bormoqda...");
        }, 25000);

        // 30 soniyadan so‘ng qazish boshlanishi (kelajakda funksiyaga o‘tkazish mumkin)
        setTimeout(() => {
            console.log("⛏️ Qazish boshlandi...");
        }, 30000);

        // === ANTI-BOT bypass ===

        // 👀 Kamera burish
        setInterval(() => {
            const yaw = Math.random() * Math.PI * 2;
            const pitch = (Math.random() - 0.5) * Math.PI / 2;
            bot.look(yaw, pitch, true);
            console.log("👀 Kamera burildi");
        }, 5000);

        // 🚶‍♂️ Harakat simulyatsiyasi
        setInterval(async () => {
            try {
                bot.setControlState('forward', true);
                await new Promise(r => setTimeout(r, 800));
                bot.setControlState('forward', false);
                bot.setControlState('back', true);
                await new Promise(r => setTimeout(r, 500));
                bot.setControlState('back', false);
                console.log("🚶‍♂️ Bot harakatlandi");
            } catch (e) {
                console.error("⚠️ Harakatda xatolik:", e);
            }
        }, 10000);

        // 🗨️ Chatga salom berish
        bot.on('message', msg => {
            if (msg.toString().toLowerCase().includes('salom')) {
                bot.chat("Salom!");
                console.log("🗨️ Bot salom berdi.");
            }
        });

    }); // spawn end
} // createBot end

createBot();

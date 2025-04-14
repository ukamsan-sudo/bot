
const mineflayer = require('mineflayer');
const Vec3 = require('vec3');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalNear } = goals;
const http = require('http');

// --- Uptime uchun HTTP server ---
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('🟢 Bot online\n');
}).listen(process.env.PORT  3001, () => {
    console.log(`🟢 Keep-alive server ishga tushdi: http://localhost:${process.env.PORT  3001}`);
});

// --- Sozlamalar ---
const pswd = "fazliddinov";
const username = "lavash_kibr01";
const p1 = [ -6021, 84, 1940];
const p2 = [ -6017, 84, 1941];

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
        console.log(📍 Botning turgan joyi: X:${bot.entity.position.x} Y:${bot.entity.position.y} Z:${bot.entity.position.z});
        status = "waiting_for_login";

        bot.on('message', (message) => {
            const msg = String(message);
            console.log(💬 Xabar: ${msg});

            if (status === "waiting_for_login") {
                if (msg.toLowerCase().includes("register")) {
                    console.log("📝 Ro‘yxatdan o‘tmoqda...");
                    bot.chat(/register ${pswd} ${pswd});
                } else if (msg.toLowerCase().includes("login")) {
                    console.log("🔐 Kirish amalga oshirilmoqda...");
                    bot.chat(/login ${pswd});
                    status = "logged_in";
                }
            }
        });

        setTimeout(() => {
            bot.chat('/is warp miner4');
            console.log("🌀 /is warp miner4 ga teleport...");
        }, 10000);

        setTimeout(() => {
            const defaultMove = new Movements(bot);
            bot.pathfinder.setMovements(defaultMove);
            bot.pathfinder.setGoal(new GoalNear(-6022, 83, 1940, 1));
            console.log("➡️ Belgilangan nuqtaga bormoqda...");
        }, 25000);

        setTimeout(() => {
            digZigZag();
            console.log("⛏️ Qazish boshlandi...");
        }, 30000);
    });

🗿, [14.04.2025 12:43]
async function digZigZag() {
        if (!bot.heldItem  !bot.heldItem.name.includes('pickaxe')) {
            const pickaxe = bot.inventory.items().find(i => i.name.includes('pickaxe'));
            if (pickaxe) await bot.equip(pickaxe, 'hand');
            else {
                console.log("❌ Pickaxe yo‘q. Chiqmoqda...");
                return bot.quit();
            }
        }

        async function digColumn(x, zList, yList) {
            let qazildi = false;
            for (let z of zList) {
                for (let y of yList) {
                    const pos = new Vec3(x, y, z);
                    const block = bot.blockAt(pos);
                    if (block && block.name !== 'air' && bot.canDigBlock(block)) {
                        try {
                            await bot.dig(block, true);
                            qazildi = true;
                        } catch (err) {
                            console.log("❌ Qazishda xatolik:", err.message);
                        }
                    }
                }
            }
            return qazildi;
        }

        async function startLoop() {
            while (true) {
                let qazilgan = false;

                for (let i = 0; i < xrange.length; i++) {
                    const ok = await digColumn(xrange[i], zrange, yrange);
                    qazilgan = qazilgan  ok;
                }

                for (let i = xrange.length - 1; i >= 0; i--) {
                    const ok = await digColumn(xrange[i], [...zrange].reverse(), [...yrange].reverse());
                    qazilgan = qazilgan || ok;
                }

                if (!qazilgan) {
                    console.log("⏳ Qaziladigan blok yo‘q, kutyapti...");
                    await bot.waitForTicks(20);
                }
            }
        }

        startLoop();
    }

    bot.on('kicked', (reason) => {
        console.log(❌ Serverdan haydaldi: ${reason});
    });

    bot.on('error', (err) => {
        console.log(⚠️ Xatolik: ${err.message});
    });

    bot.on('end', () => {
        console.log("🔁 Bot chiqdi. Qayta ulanmoqda...");
        setTimeout(createBot, 5000);
    });
}

createBot();

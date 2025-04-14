const mineflayer = require('mineflayer');
const Vec3 = require('vec3');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalNear } = goals;

const pswd = "fambot";
const username = "lavash_kibr";

const p1 = [2734, 108, 1885];
const p2 = [2735, 108, 1881];

function range(a, b) {
    a = parseInt(a);
    b = parseInt(b);
    let res = [];
    if (a > b) {
        for (let j = a; j >= b; j--) res.push(j);
    } else {
        for (let j = a; j <= b; j++) res.push(j);
    }
    return res;
}

const xrange = range(p1[0], p2[0]);
const yrange = range(p1[1], p2[1]);
const zrange = range(p1[2], p2[2]);

function createBot() {
    const bot = mineflayer.createBot({
        host: 'ir.skyblock.uz',
        port: 25566,
        username: username,
        skipValidation: true,
        fakeHost: 'ir.skyblock.uz',
        version: '1.17.1',
    });

    bot.loadPlugin(pathfinder);
    let status = "starting";

    bot.once('spawn', async () => {
        console.log('✅ Bot spawn qilindi.');
        console.log(`📍 Botning turgan joyi: X:${bot.entity.position.x} Y:${bot.entity.position.y} Z:${bot.entity.position.z}`);
        status = "waiting_for_login";

        // Serverdan kelgan xabarlarni tinglash
        bot.on('message', (message) => {
            const msg = String(message);
            console.log(`💬 Xabar kelgan: ${msg}`);

            if (status === "waiting_for_login") {
                if (msg.toLowerCase().includes("register")) {
                    console.log("📝 Ro‘yxatdan o‘tyapti...");
                    bot.chat(`/register ${pswd} ${pswd}`);
                } else if (msg.toLowerCase().includes("login")) {
                    console.log("🔐 Kirish amalga oshyapti...");
                    bot.chat(`/login ${pswd}`);
                    status = "logged_in";
                }
            }
        });

        // 1. Warp
        setTimeout(() => {
            bot.chat('/is visit KomiljonHelper');
            console.log("🌀 /is visit KomiljonHelper ga teleport...");
        }, 10000);

        // 2. Maqsadga yurish
        setTimeout(() => {
            const defaultMove = new Movements(bot);
            bot.pathfinder.setMovements(defaultMove);
            bot.pathfinder.setGoal(new GoalNear(2734, 107, 1886, 1));
            console.log("➡️ Belgilangan nuqtaga bormoqda...");
        }, 25000);

        // 3. Qazishni boshlash
        setTimeout(() => {
            digZigZag();
            console.log("⛏️ Qazish boshlandi...");
        }, 30000);
    });

    async function digZigZag() {
        if (!bot.heldItem || !bot.heldItem.name.includes('pickaxe')) {
            const pickaxe = bot.inventory.items().find(i => i.name.includes('pickaxe'));
            if (pickaxe) {
                await bot.equip(pickaxe, 'hand');
            } else {
                console.log("❌ Kirka yo‘q, chiqyapti...");
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
                            console.log("⚠️ Qazishda xato:", err.message);
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
                    qazilgan = qazilgan || ok;
                }

                for (let i = xrange.length - 1; i >= 0; i--) {
                    const ok = await digColumn(xrange[i], zrange.slice().reverse(), yrange.slice().reverse());
                    qazilgan = qazilgan || ok;
                }

                if (!qazilgan) {
                    console.log("⏳ Qaziladigan blok yo‘q, kutyapti...");
                    await bot.waitForTicks(20); // 1 sekund kutadi
                }
            }
        }

        startLoop();
    }

    bot.on('kicked', (reason) => {
        console.log(`❌ Serverdan haydaldi: ${reason}`);
    });

    bot.on('error', (err) => {
        console.log(`❌ Xato yuz berdi: ${err.message}`);
    });

    bot.on('end', () => {
        console.log("🔁 Bot ulanmasligi tugadi. Qayta ulanish...");
        setTimeout(createBot, 5000);
    });
}

createBot();

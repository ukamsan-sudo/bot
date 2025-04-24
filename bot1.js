const mineflayer = require('mineflayer');
const http = require('http'); // render uchun sun'iy server

const botUsername = 'Lavash_kibr02';
const botPassword = 'fambot';
const admin = 'lavash_city';

let lastPaidAmount = 0;

function startBot() {
    const botOption = {
        host: 'hypixel.uz',
        port: 25565,
        username: botUsername,
        password: botPassword,
        version: '1.18.1',
        keepAlive: true,
    };

    const bot = mineflayer.createBot(botOption);
    let mcData;

    bot.on("spawn", () => {
        mcData = require("minecraft-data")(bot.version);
        console.log("✅ Bot serverga kirdi!");

        bot.chat("/is warp farm");

        setInterval(() => {
            bot.setControlState("jump", true);
            setTimeout(() => bot.setControlState("jump", false), 500);
        }, 3 * 60 * 1000);

        setInterval(() => {
            withdrawHoney(bot, mcData);
        }, 15 * 60 * 1000);
    });

    bot.on("messagestr", (message) => {
        if (message.startsWith("Skyblock »")) return;
        console.log(message);

        if (message.includes("register")) {
            bot.chat(`/register ${botPassword} ${botPassword}`);
        }
        if (message.includes("login")) {
            bot.chat(`/login ${botPassword}`);
        }
        if (message.includes("Вы успешно вошли в аккаунт")) {
            bot.chat("/is warp farm");
        }

        if (message === "Server: Serverni kunlik restartiga 30 sekund qoldi") {
            bot.quit("Restart bo'lishi sababli chiqdi");
        }

        if (message.includes("Balance: $")) {
            const balanceStr = message.match(/Balance: \$([\d,]+)/);
            if (!balanceStr || balanceStr.length < 2) return;

            const balance = parseInt(balanceStr[1].replace(/,/g, ""));
            if (balance > 0 && balance !== lastPaidAmount) {
                bot.chat(`/pay ${admin} ${balance}`);
                lastPaidAmount = balance;
            }
        }
    });

    bot.on("whisper", (usernameSender, message) => {
        if (usernameSender === admin && message.startsWith("! ")) {
            const command = message.slice(2);
            bot.chat(command);
        }
    });

    bot.on("windowOpen", async (window) => {
        setTimeout(() => bot.closeWindow(window), 19000);

        if (window.title.includes("Island Shop | Food")) {
            let honeySlots = window.slots
                .map((item, index) => ({ item, index }))
                .filter(({ item }) => item?.name === "honey_bottle");

            honeySlots.forEach(({ index }, i) => {
                setTimeout(() => {
                    bot.simpleClick.rightMouse(index);
                }, 20 * i);
            });

            const totalDelay = honeySlots.length * 20 + 100;
            setTimeout(async () => {
                await bot.closeWindow(window);
                bot.chat("/is warp farm");
                bot.chat("/is withdraw money 9999999999999999");
                bot.chat("/bal");
            }, totalDelay);
        }
    });

    bot.on("error", (err) => {
        console.log("❌ Xatolik:", err.message);
    });

    bot.on("end", () => {
        console.log("🔄 Bot uzildi. 5 soniyadan so'ng qayta ulanmoqda...");
        setTimeout(startBot, 5000);
    });

    async function withdrawHoney(bot, mcData) {
        try {
            bot.chat("/is warp farm");
            await new Promise(r => setTimeout(r, 500));

            const chestPosition = await bot.findBlock({
                matching: mcData.blocksByName.chest.id,
                maxDistance: 5,
            });
            if (!chestPosition) return;

            let attempts = 0;
            let chest = null;

            while (!chest && attempts < 3) {
                try {
                    chest = await bot.openChest(chestPosition);
                } catch (err) {
                    console.log(`Chest ochishda xato: ${err}. Urinish: ${attempts + 1}`);
                    attempts++;
                    await new Promise(r => setTimeout(r, 3000));
                }
            }

            if (!chest) return;

            function hasFreeSlot() {
                return bot.inventory.emptySlotCount() > 0;
            }

            for (let slot of chest.slots) {
                if (slot?.name === 'honey_bottle' && slot.count > 0) {
                    while (slot.count > 0 && hasFreeSlot()) {
                        const toWithdraw = Math.min(slot.count, bot.inventory.itemLimit - slot.count);
                        try {
                            await chest.withdraw(slot.type, null, toWithdraw);
                            slot.count -= toWithdraw;
                        } catch {
                            break;
                        }
                    }
                    if (!hasFreeSlot()) break;
                }
            }

            await new Promise(r => setTimeout(r, 1000));
            await chest.close();
            await new Promise(r => setTimeout(r, 1000));
            bot.chat("/is shop Food");
        } catch (err) {
            console.log("❌ withdrawHoney xatoligi:", err.message);
        }
    }
}

startBot();

// 🔧 Render Web Service uchun soxta HTTP server
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot is running\n');
}).listen(port, () => {
    console.log(`Fake HTTP server running on port ${port}`);
});

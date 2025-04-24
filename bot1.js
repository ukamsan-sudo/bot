const mineflayer = require('mineflayer');

const botUsername = 'Lavash_kibr02';
const botPassword = 'fambot';
const admin = 'lavash_city';
var mcData;

const botOption = {
    host: 'hypixel.uz',
    port: 25565,
    username: botUsername,
    password: botPassword,
    version: '1.18.1',
};

function startBot() {
    const bot = mineflayer.createBot(botOption);

    bot.on("spawn", () => {
        mcData = require("minecraft-data")(bot.version);
        console.log("✅ Bot serverga kirdi!");

        setInterval(() => {
            bot.setControlState("jump", true);
            setTimeout(() => bot.setControlState("jump", false), 500);
        }, 3 * 60 * 1000);

        bot.chat("/is warp farm");

        setInterval(() => {
            withdrawHoney(bot, mcData);
        }, 15 * 60 * 1000);
    });

    bot.on("messagestr", (message) => {
        if (message.startsWith("Skyblock »")) return;
        console.log(message);

        if (message === "Server: Serverni kunlik restartiga 30 sekund qoldi") {
            bot.quit("Restart bo'lishi sababli chiqdi");
        }

        if (message.includes("register")) {
            bot.chat(`/register ${botPassword} ${botPassword}`);
        }
        if (message.includes("login")) {
            bot.chat(`/login ${botPassword}`);
        }
        if (message.includes("Вы успешно вошли в аккаунт")) {
            bot.chat(`/is warp farm`);
        }

        if (message.includes("Balance: $")) {
            let balanceStr = message.match(/Balance: \$([\d,]+)/);
            if (!balanceStr || balanceStr.length < 2) return;

            let balance = parseInt(balanceStr[1].replace(/,/g, ""));
            if (balance > 0) {
                bot.chat(`/pay ${admin} ${balance}`);
            }
        }
    });

    bot.on("whisper", (usernameSender, message) => {
        if (usernameSender === admin && message.startsWith("! ")) {
            const command = message.replace("! ", "");
            bot.chat(command);
        }
    });

    bot.on('windowOpen', async (window) => {
        setTimeout(() => bot.closeWindow(window), 19000);

        if (window.title.includes('Island Shop | Food')) {
            let honeyCount = 0;
            bot.inventory.slots.forEach(slot => {
                if (slot?.name === 'honey_bottle') {
                    honeyCount += slot.count;
                }
            });
            for (let i = 0; i < honeyCount; i++) {
                setTimeout(() => {
                    bot.simpleClick.rightMouse(21, 0, 0);
                }, 20 * i);
            }
            setTimeout(async () => {
                await bot.closeWindow(window);
                bot.chat('/is warp farm');
                bot.chat('/is withdraw money 9999999999999999');
                bot.chat('/bal');
            }, honeyCount * 20 + 100);
        }
    });

    bot.on('error', (err) => {
        console.log("❌ Xatolik:", err.message);
    });

    bot.on('end', () => {
        console.log("🔄 Bot uzildi. 5 soniyadan so'ng qayta ulanmoqda...");
        setTimeout(() => startBot(), 5000);
    });

    async function withdrawHoney(bot, mcData) {
        bot.chat('/is warp farm');
        setTimeout(async () => {
            const chestPosition = await bot.findBlock({
                matching: mcData.blocksByName.chest.id,
                maxDistance: 5,
            });
            if (!chestPosition) return;

            let attempts = 0;
            let chest = null;
            const maxAttempts = 3;

            while (!chest && attempts < maxAttempts) {
                try {
                    chest = await bot.openChest(chestPosition);
                } catch (error) {
                    console.log(`Chest ochishda xato: ${error}. Urinish: ${attempts + 1}`);
                    attempts++;
                    if (attempts >= maxAttempts) return;
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }

            if (!chest) return;

            function hasFreeSlot() {
                return bot.inventory.emptySlotCount() > 0;
            }

            for (let slot of chest.slots) {
                if (slot?.name === 'honey_bottle' && slot.count > 0) {
                    while (slot.count > 0 && hasFreeSlot()) {
                        const countToWithdraw = Math.min(slot.count, bot.inventory.itemLimit - slot.count);
                        try {
                            await chest.withdraw(slot.type, null, countToWithdraw);
                            slot.count -= countToWithdraw;
                        } catch (error) {
                            break;
                        }
                    }
                    if (!hasFreeSlot()) break;
                }
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            await chest.close();
            await new Promise(resolve => setTimeout(resolve, 1000));
            bot.chat('/is shop Food');
        }, 500);
    }
}

startBot();

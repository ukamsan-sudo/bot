const mineflayer = require('mineflayer');
require('colors').enable();

const botUsername = 'lavash_kibr1';
const botPassword = 'fazliddinov';
const admin = 'lavash_city';
var playerList = [];
var mcData;

const botOption = {
    host: 'hypixel.uz',
    port: 25565,
    username: botUsername,
    password: botPassword,
    version: '1.18.1',
};

init();

function init() {
    var bot = mineflayer.createBot(botOption);

    bot.on("spawn", () => {
        mcData = require("minecraft-data")(bot.version);
        console.log("Bot serverga kirdi!");

        // Serverga kirganda /is warp sell yozish
        bot.chat("/is warp miner1");

    });

    bot.on("messagestr", (message) => {
        if (message.startsWith("Skyblock »")) return;
        console.log(message);

        // Server restart bo'lsa chiqish
        if (message === "Server: Serverni kunlik restartiga 30 sekund qoldi") {
            bot.quit("20min");
        }

        // Ro‘yxatdan o‘tish yoki login qilish
        if (message.includes("register")) {
            bot.chat(`/register ${botPassword} ${botPassword}`);
        }
        if (message.includes("login")) {
            bot.chat(`/login ${botPassword}`);
        }
    if (message.includes("Вы успешно вошли в аккаунт")) {
            bot.chat(`/is warp miner1`);
        }
    });
  
  async function dig() {
  if (!bot.heldItem || !bot.heldItem.name.includes('pickaxe')) {
    var pickaxe = bot.inventory.items().filter(i => i.name.includes('pickaxe'))[0];
    if (pickaxe) await bot.equip(pickaxe, 'hand')
    if(!pickaxe) bot.quit();
  }
  var block = bot.blockAtCursor(7);
  if (!block) return setTimeout(function() {
    dig();
  }, 100);
  await bot.dig(block, 'ignore', 'raycast')
  dig()
}
bot.once("spawn", () => {
    setTimeout(() => {
        dig();
   }, 20000); 
})


    // Admindan buyruqlarni bajarish
    bot.on("chat", (usernameSender, message) => {
        if (usernameSender === admin && message.startsWith("! ")) {
            const command = message.replace("! ", "");
            bot.chat(command);
        }
    });

}

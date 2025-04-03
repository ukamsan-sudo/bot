const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello Express app!')
});

app.listen(3000, () => {
  console.log('server started');
});
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
host:'ir.skyblock.uz',
port: 25566,
username: 'derfoglive_01'
})
bot.on('messagestr', (message) => {
  if(message.includes("/register"))
  {
    bot.chat("/reg fazliddinov fazliddinov")
  }
  

}


)
bot.on('messagestr', (message) => {
  if(message.includes("/log"))
  {
    bot.chat("/login fazliddinov")
  }
  

}


)
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
bot.on('chat', (username, message) => {
    if (username === ''lavash_city') {
    if (message.indexOf('*') !== -1) {
            var replacement = "*",
                toReplace = "",
                str = message

            str = str.replace(replacement, toReplace)
            bot.chat(str)
        }}})
    bot.on('kicked', console.log)
bot.on('error', console.log)

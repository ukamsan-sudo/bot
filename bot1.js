const mineflayer = require('mineflayer')

const Vec3 = require('vec3');


let status = "starting"
sell_status = "main"

let mcData = undefined;


const bot = mineflayer.createBot({
  host: 'ir.skyblock.uz',
  port: 25566,
  username: 'lavash_kibr02',
  skipValidation: true,
  fakeHost: 'ir.skyblock.uz',
  version: '1.17.1',
  hideErrors: false,
  checkTimeoutInterval: 3600 * 1000
})


bot.once('spawn', () => {
    mcData = require('minecraft-data')(bot.version)

    console.log('spawned')
    
    if(status == "starting")
    {
        status = "waiting_for_login"
    }
    if(status == "selling")
    {
        status = 'ready'
    }
})



pswd = "fambot"

bot.on('messagestr', function(message, pos, jsonMsg) {
    console.log(message)
    if(status == "waiting_for_login")
    {
        if (message.includes('/reg')) {
            bot.chat('/register ' + pswd + ' ' + pswd);
            status = "ready"
            return
        }
        if (message.includes('/log')) {
            bot.chat('/login ' + pswd);
            status = "ready"
            return
        }
    }
})


function range(p1, p2) {
    p1 = parseInt(p1)
    p2 = parseInt(p2)
    
    let res = [];
    if(p1 > p2)
    {
        for(let j=p1;j>=p2;j--)
        {
            res.push(j);
        }
    }
    else
    {
        for(let j=p1;j<=p2;j++)
        {
            res.push(j);
        }
    }
    return res;
}

p1 = [2944, 88, 5136]
p2 = [2944, 88, 5135]
xrange = range(p1[0], p2[0]);
yrange = range(p1[1], p2[1]);
zrange = range(p1[2], p2[2]);

console.log(xrange);
console.log(yrange);
console.log(zrange);

blocks = [];

i = 0;

let sellist = ['honey_bottle']
let savelist = []

let not_trash = sellist.concat(savelist); 

let activeWindow = null

let scanning_block = 0;

let cooldown = 0;

function clean() {
    cooldown = 40
    bot.chat('/is warp sellzone2');
    sell_status = "cleaning"
    
    if(activeWindow != null)
    {
        bot.closeWindow(activeWindow);
    }
}


bot.on('physicsTick', () => {
    i = i + 1;
    
    if(i > 50)
    {
        if(status == "ready")
        {
            gotoPosition()
            status = "going"
            
        }
        
        if(status == 'loading')
        {
            for(let x of xrange)
            {
                for(let y of yrange)
                {
                    for(let z of zrange)
                    {
                        let pos = new Vec3(x, y, z);
                        block = bot.blockAt(pos);
                        if((block._properties.type ?? '') == 'left')
                        {
                            blocks.push(block);
                        }
                    }
                }
            }
            status = 'selling'
        }
        i = 0;
    }
    
    if(cooldown > 0)
    {
        cooldown-=1;
        return;
    }
        
    if(status == 'selling')
    {
        if(sell_status == 'scanning')
        {
            if(scanning_block >= blocks.length)
            {
                scanning_block = 0;
            }
            
            let items_count = bot.inventory.items().length;
                   
            if(activeWindow != null)
            {
                items_count = activeWindow.slots.filter(i => (i?.slot ?? 0) >= activeWindow.inventoryStart).length;
            }
            
            if(items_count > 27)
            {
                clean()
                return;
            }
            else
            {
                if(activeWindow == null)
                {
                    cooldown = 30;
                    bot.openContainer(blocks[scanning_block]);
                    return
                }
                
                if(activeWindow != null)
                {
                    let chest_items = activeWindow.slots.filter(i => i!=null && i.type != null && (i?.count ?? 0) > 10 && (i?.slot ?? 999) < activeWindow.inventoryStart && savelist.indexOf(i.name ?? "") == -1);
                    if(chest_items.length > 0)
                    {
                        cooldown = 2

fzdnv, [24.04.2025 14:54]
activeWindow.withdraw(chest_items[0].type, null, chest_items[0].count);
                    }
                    else
                    {
                        bot.closeWindow(activeWindow);
                        scanning_block+=1;
                    }
                }
            }
        }
        
        if(sell_status == 'main')
        {
            if(bot.inventory.items().length > 5)
            {
                clean()
            }
            else
            {
                sell_status = "scanning"
            }
            return;
        }
        
        if(sell_status == 'cleaning')
        {
            let trash = bot.inventory.items().filter(i => not_trash.indexOf(i.name) < 0);
            console.log(trash.length);
            if(trash.length == 0)
            {
                sell_status = "waiting"
                bot.chat('/is shop Food');
            }
            else
            {
                bot.tossStack(trash[0])
                return
            }
        }
        
        if(sell_status == 'selling_ores')
        {
        
            for(let name of sellist)
            {
                let items = bot.inventory.items().filter(i => i.name == name);
                if(activeWindow == null)
                {
                    sell_status = "waiting"
                    bot.chat('/is shop Food');
                }
                if(activeWindow != null)
                {
                    console.log(items.length);
                    items = activeWindow.slots.filter(i => (i?.slot ?? 0) >= activeWindow.inventoryStart).filter(i => i.name == name);
                    console.log(items.length);
                }
                
                if(items.length > 0)
                {
                    if(name == 'honey_bottle')
                    {
                        bot.simpleClick.rightMouse(21)
                        bot.simpleClick.rightMouse(21)
                        return
                    }
                }
            }
            
            sell_status = 'main'
            bot.closeWindow(activeWindow)
        }
    }
})

currentWindowId = 0;

bot.on('windowOpen', (window) => {
    activeWindow = window
    currentWindowId+=1;
    console.log("Opened window: " + window.title);
    if(window.title.indexOf("Food") > 0)
    {
        sell_status = "selling_ores"
    }
})

bot.on('windowClose', () => {
    activeWindow = null
});

bot.on('updateSlot', console.log)

function gotoPosition() {
    bot.chat("/is warp farm")
    setTimeout(() => {
        status = "loading"
    }, 3000);
}

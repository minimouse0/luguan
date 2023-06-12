// LiteLoader-AIDS automatic generated
/// <reference path="c:\Users\Administrator\.vscode/dts/HelperLib-master/src/index.d.ts"/>

const PLUGIN_Name = "luguan";

/**
 * 配置文件
 */
const CONFIG = new JsonConfigFile(
  `./plugins//${PLUGIN_Name}//config.json`,
  JSON.stringify({
    pl_luguan_max: 3, //单日打飞机次数限制
    randomNumber: 10, //单词打飞机累计次数数量发放加血效果
    cd_m: 5, //cd，按照分钟计算
    扣血: {
      id: 19,
      tick: 50,
      level: 1,
    },
    失明: {
      id: 15,
      tick: 300,
      level: 1,
    },
    虚弱: {
      id: 18,
      tick: 800,
      level: 1,
    },
    加血效果: {
      id: 6,
      tick: 100,
      level: 1,
    },
    //对应代码：pl.addEffect(18, tick, 1, false)
  })
);
/**数据文件 */
const Data = new JsonConfigFile(`./plugins//${PLUGIN_Name}//data.json`);

mc.listen("onJoin", (pl) => {
  if (Data.get(pl.xuid) == null) {
    Data.set(pl.xuid, {
      number_max: 0,
      time_D: system.getTimeObj().D,
      time_cd: system.getTimeStr(),
    });
  } else if (Data.get(pl.xuid).time_D != system.getTimeObj().D) {
    Data.set(pl.xuid, {
      number_max: 0,
      time_D: system.getTimeObj().D,
      time_cd: system.getTimeStr(),
    });
  }
});
let pl_lig_nb = 0;
//服务器启动
mc.listen("onServerStarted", () => {
  colorLog("green", "[定制|撸个管先]");
});
mc.listen("onAttackBlock", (pl, block, item) => {
  //下蹲抬头或潜行炉管
  if (
    pl.isSneaking &&
    pl.direction.pitch > 40 &&
    item.type == "minecraft:paper"
  ) {
    executeLuGuan(pl);
    return false;
  }
});

/**
 * 指定玩家使其炉管
 * @param {Player} pl 执行炉管的玩家
 */
function executeLuGuan(pl) {
  //撸多了
  if (Data.get(pl.xuid).number_max > CONFIG.get("pl_luguan_max")) {
    luguanTooOftenDebuff();
    return;
  }
  //撸快了
  if (
    calculateTimeDifferenceInMinutes(Data.get(pl.xuid).time_cd) <=
    CONFIG.get("cd_m")
  ) {
    pl.tell(
      "贤者时间还剩" +
        (CONFIG.get("cd_m") -
          calculateTimeDifferenceInMinutes(Data.get(pl.xuid).time_cd)) +
        "分钟"
    );
    return;
  }
  let number_max = Data.get(pl.xuid).number_max;
  pl_lig_nb++;
  mc.runcmdEx("playsound mob.slime.big " + pl.realName);
  let pos = pl.feetPos;
  //播放动炉管动画
  spawnParticle(
    pos.x,
    pos.y + 0.5,
    pos.z,
    pos.dimid,
    "minecraft:basic_flame_particle"
  );
  spawnParticle(
    pos.x + 0.1,
    pos.y + 0.5,
    pos.z,
    pos.dimid,
    "minecraft:basic_flame_particle"
  );
  spawnParticle(
    pos.x,
    pos.y + 0.5,
    pos.z + 0.1,
    pos.dimid,
    "minecraft:basic_flame_particle"
  );
  spawnParticle(
    pos.x - 0.1,
    pos.y + 0.5,
    pos.z,
    pos.dimid,
    "minecraft:basic_flame_particle"
  );
  spawnParticle(
    pos.x,
    pos.y + 0.5,
    pos.z - 0.1,
    pos.dimid,
    "minecraft:basic_flame_particle"
  );
  //射出来了
  if (pl_lig_nb > CONFIG.get("randomNumber")) shele(pl, number_max);
}

function shele(pl, number_max) {
  let max = number_max + 1;

  //加血效果
  Effect(CONFIG, pl, "加血效果", true);
  pl_lig_nb = 0;
  playSheleTitle(pl);
  playSheleParticle(pl);
  mc.runcmdEx("clear " + pl.realName + " paper 0 1");
  Data.set(pl.xuid, {
    number_max: max,
    time_D: system.getTimeObj().D,
    time_cd: system.getTimeStr(),
  });
}

function playSheleTitle(player) {
  title(0);
  function color(index) {
    if (index % 2 == 0) {
      return "§0";
    } else {
      return "§f";
    }
  }
  function title(i) {
    if (i >= 10) return;
    player.setTitle(color(i) + "去了去了");
    setTimeout(() => {
      title(i + 1);
    }, 60);
  }
}
/**
 * 射了
 * @param {Player} player
 */
function playSheleParticle(player) {
  function watersplash(i) {
    if (i > 30) return;
    spawnParticle(
      pos.feetPos.x,
      pos.feetPos.y + 0.5,
      pos.feetPos.z + 0.1,
      pos.dimid,
      "minecraft:watersplash"
    );
    setTimeout(() => {
      watersplash(i + 1);
    }, 60);
  }
  watersplash(0);
  spawnParticle(
    pos.feetPos.x,
    pos.feetPos.y + 0.5,
    pos.feetPos.z + 0.1,
    pos.dimid,
    "minecraft:water_evaporation_bucket_emitter"
  );
}

/**
 * 玩家撸多了的时候执行的debuff动作
 * @param {Player} pl 撸多了的玩家
 */
function luguanTooOftenDebuff(pl) {
  //扣血
  Effect(CONFIG, pl, "扣血", false);
  //失明
  Effect(CONFIG, pl, "失明", false);
  //虚弱
  Effect(CONFIG, pl, "虚弱", false);
  pl.tell("休息一下吧，明天~好不好~");
  //Data.set(pl.xuid, { number_max: number_max, time_D: time_D, time_cd: system.getTimeObj() })
}

function calculateTimeDifferenceInMinutes(startTime) {
  let date1 = new Date(startTime);
  let date2 = new Date();

  let differenceInMilliseconds = date2 - date1;
  let differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));

  return differenceInMinutes;
}

/**
 * 为玩家生成粒子效果
 * @param {number} x x偏移角度
 * @param {number} y y偏移角度
 * @param {number} z z偏移角度
 * @param {number} dimId 纬度
 * @param {string} type 粒子效果
 */
let spawnParticle = (x = 0, y = 0, z = 0, dimId, type) => {
  return mc.spawnParticle(x, y, z, dimId, type);
};
/**
 * 为玩家添加效果
 * @param {Player} Player 添加效果的玩家
 * @param {JsonConfigFile} CONFIG
 * @param {string} name 药水效果的id
 * @param {boolean} showParticles 是否显示粒子
 */
let Effect = (CONFIG, Player, name, showParticles) => {
  return Player.addEffect(
    CONFIG.get(name).id,
    CONFIG.get(name).tick,
    CONFIG.get(name).level,
    showParticles
  );
};

ll.registerPlugin(PLUGIN_Name, "打飞机插件", [0, 0, 3, Version.Dev]);

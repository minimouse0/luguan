// LiteLoader-AIDS automatic generated
/// <reference path="c:\Users\Administrator\.vscode/dts/HelperLib-master/src/index.d.ts"/>

const PLUGIN_Name = "luguan";
ll.registerPlugin(PLUGIN_Name, "打飞机插件", [0, 0, 3, Version.Release]);

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
mc.listen("onAttackBlock", (pl, block) => {
  const item = pl.getHand();
  //下蹲抬头或潜行炉管
  if (pl.isSneaking && pl.direction.pitch > 40 && item.id == 387)
    executeLuGuan(pl);
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
      "休息一下,还剩时间（分） ：" +
        (CONFIG.get("cd_m") -
          calculateTimeDifferenceInMinutes(Data.get(pl.xuid).time_cd))
    );
    return;
  }
  let number_max = Data.get(pl.xuid).number_max;
  pl_lig_nb++;
  mc.runcmdEx("playsound mob.slime.big " + pl.realName);
  let pos = pl.feetPos;
  spawnParticle(pos, 0, 0.5, 0);
  spawnParticle(pos, 0.1, 0.5, 0);
  spawnParticle(pos, 0, 0.5, 0.1);
  spawnParticle(pos, -0.1, 0.5, 0);
  spawnParticle(pos, 0, 0.5, -0.1);
  if (pl_lig_nb > CONFIG.get("randomNumber")) {
    let max = number_max + 1;

    //加血效果
    pl.addEffect(
      CONFIG.get("加血效果").id,
      CONFIG.get("加血效果").tick,
      CONFIG.get("加血效果").level,
      true
    );
    pl_lig_nb = 0;
    pl.tell("去了去了");
    mc.runcmdEx("clear " + pl.realName + " paper 0 1");
    Data.set(pl.xuid, {
      number_max: max,
      time_D: system.getTimeObj().D,
      time_cd: system.getTimeStr(),
    });
  }
}

/**
 * 玩家撸多了的时候执行的debuff动作
 * @param {Player} pl 撸多了的玩家
 */
function luguanTooOftenDebuff(pl) {
  //扣血
  Effect(
    pl,
    CONFIG.get("扣血").id,
    CONFIG.get("扣血").tick,
    CONFIG.get("扣血").level,
    false
  );
  //失明
  Effect(
    pl,
    CONFIG.get("失明").id,
    CONFIG.get("失明").tick,
    CONFIG.get("失明").level,
    true
  );
  //虚弱
  Effect(
    pl,
    CONFIG.get("虚弱").id,
    CONFIG.get("虚弱").tick,
    CONFIG.get("虚弱").level,
    false
  );

  pl.tell("休息一下吧，明天~好不好~");
  //CONFIG_pl_luguan_data.set(pl.xuid, { number_max: number_max, time_D: time_D, time_cd: system.getTimeObj() })
}

function calculateTimeDifferenceInMinutes(startTime) {
  let date1 = new Date(startTime);
  let date2 = new Date();

  let differenceInMilliseconds = date2 - date1;
  let differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));

  return differenceInMinutes;
}

/**
 * 为玩家生成 minecraft:basic_flame_particle 粒子效果
 * @param {FloatPos} pos 浮点数坐标对象
 * @param {} x x偏移角度
 * @param {} y y偏移角度
 * @param {} z z偏移角度
 */
let spawnParticle = (pos, x = 0, y = 0, z = 0) => {
  mc.spawnParticle(
    pos.x + x,
    pos.y + y,
    pos.z + z,
    pos.dimid,
    "minecraft:basic_flame_particle"
  );
};
/**
 * 为玩家添加效果
 * @param {Player} Player 添加效果的玩家
 * @param {number} id 药水效果的id
 * @param {number} tick 持续时间
 * @param {number} level 等级
 * @param {boolean} showParticles 是否显示粒子
 */
let Effect = (Player, id, tick, level, showParticles) => {
  return Player.addEffect(id, tick, level, showParticles);
};

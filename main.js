//常量定义
const CHARBULLET_WIDTH_1 = 2;//自机子弹上宽度
const CHARBULLET_WIDTH_2 = 8;//自机子弹下宽度
const CHARBULLET_HEIGHT = 60;//自机子弹长度
const CHAR_JUDGEPOINT = 5;//自机判定点大小
const ENEMY_WIDTH = 80;//敌机宽度
const ENEMY_HEIGHT = 100;//敌机长度
const ENEMY_MAX_HEALTH = 15000;//敌机最大生命值
const BULLET_00_RANGE = 31;//大玉判定范围（比实际看上去小很多）
const BULLET_01_RANGE = 13;//中玉判定范围
const BULLET_02_RANGE = 3;//小玉判定范围
const BULLET_03_RANGE = 2;//米弹判定范围
const BULLET_04_RANGE = 4;//瓜子弹判定范围
const BULLET_05_RANGE = 11;//五角星弹判定范围
const bullet_ranges = [BULLET_00_RANGE, BULLET_01_RANGE, BULLET_02_RANGE, BULLET_03_RANGE, BULLET_04_RANGE, BULLET_05_RANGE];//子弹判定范围数组

var charImg = new Image();
charImg.src = "char.png";

var enemyImg = new Image();
enemyImg.src = "enemy.png";

var bgImg1 = new Image();
bgImg1.src = "stars.jpg"

var bgImg2 = new Image();
bgImg2.src = "bluesky.jpg"

var bgImg3 = new Image();
bgImg3.src = "sun.jpg"

var bgImg4 = new Image();
bgImg4.src = "clouds.jpg"


var charlifeImg = new Image();
charlifeImg.src = "life.png";

var bgm = new Audio();
bgm.src = "bgm.mp3";
bgm.volume = 0.5; //设置音量为50%
function bgm_play() {
    bgm.play();
    setTimeout(bgm_play, 133000);//bgm循环播放效果(133s是由于bgm长度为132s)
}


const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");   //笔
ctx.fillStyle = "#FFFFFF";//设置填充颜色（白色）

const canvas2 = document.getElementById("canvas2");
const ctx2 = canvas2.getContext("2d");

function tishi() {//提示文字
    ctx2.save();
    ctx2.font = "17px 宋体"
    ctx2.fillStyle = "#000000";
    ctx2.fillText("提示：切换关卡前要先按停止键！", 25, 450);
    ctx2.fillText("按q键也可以暂停", 25, 470);
    ctx2.restore();
}

function zhixie() {//致谢的文字
    ctx2.save();
    ctx2.font="13px 宋体"
    ctx2.fillStyle = "#000000";
    ctx2.fillText("致谢：上海爱丽丝幻乐团-ZUN", 20, 630);
    ctx2.fillText("自机角色贴图：https://cloud.lilywhite.cc/s/M8B", 20, 650);
    ctx2.fillText("s2?path=%2F", 20, 670);
    ctx2.fillText("日出背景图：https://www.51yuansu.com/bg/sjrlnl", 20, 690);
    ctx2.fillText("agxg.html", 20, 710);
    ctx2.fillText("乌云背景图：https://www.2amok.com/videoText/34", 20, 730);
    ctx2.fillText("548.html", 20, 750);
    ctx2.fillText("BGM：恋色マジック", 20, 770);
    ctx2.restore();
}

tishi();//提示
zhixie();//致谢

class Char {//自机的类
    x;
    y;
    speed;//高速/低速状态
    fire;//开火状态
    miss;//中弹状态
    invincible;//是否无敌状态
    life;//残机数
}
var char = new Char;//自机变量


class CharBullet {//自机子弹的类
    flag;//子弹存在标志
    //子弹中心位置
    x;
    y;
    constructor(x, y) {//传入的是与自机的相对位置
        this.flag = true;
        this.x = char.x + x;
        this.y = char.y + y;
    }
}


class Enemy {//敌机的类
    //敌机中心位置
    x;
    y;
    health;
    constructor(x, y) {
        this.flag = true;
        this.x = x;
        this.y = y;
        this.health = ENEMY_MAX_HEALTH;
    }
}

var enemy1 = new Enemy(350, 200);


class Bullet {//敌机子弹的类
    flag;//子弹存在标志
    //子弹中心位置
    x;
    y;
    speed;//速度
    type;//类型
    angle;//倾斜角度（顺时针转）
    enemy;//从哪个敌机发出
    constructor(x, y, speed, type, angle, enemy, color) {
        this.flag = true;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.type = type;
        this.angle = angle - Math.PI / 2;
        this.enemy = enemy;
        this.color = color;
    }
}


var cnt = 0;//帧数（初始为0）
var t;//setTimeout的返回值


//画出自机图像（低速状态下显示圆形判定点）
function drawChar(x, y) {
    if (!char.invincible) {
        ctx.drawImage(charImg, char.x - 25, char.y - 35, 50, 70);//绘制自机图像
    }
    else {
        if (cnt % 20 < 10) {
            ctx.drawImage(charImg, char.x - 25, char.y - 35, 50, 70);//绘制自机图像
        }
    }
    if (char.speed) {
        ctx.beginPath();
        ctx.arc(x, y, CHAR_JUDGEPOINT, 0, 2 * Math.PI);//画圆形判定点
        ctx.fill();//填充
        ctx.stroke();//绘制线条
    }
}
//清除左侧图像
function clear() {
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);//清除矩形区域
}


//注册自机子弹
function registerCharBullet() {//开火时注册自机子弹
    if (char.fire) {

        var charBulletArray = new Array();

        for (var i = 0; i < 12; i++) {//从下往上一共11组子弹，每组3个
            if (char.speed) {//低速状态
                var charbullet1 = new CharBullet(0, -60 - i * 70);//注册子弹
                var charbullet2 = new CharBullet(13, -56 - i * 70);
                var charbullet3 = new CharBullet(-13, -56 - i * 70);
                var charbullet4 = new CharBullet(26, -52 - i * 70);
                var charbullet5 = new CharBullet(-26, -52 - i * 70);
                charBulletArray.push(charbullet1, charbullet2, charbullet3, charbullet4, charbullet5);
                
            }
            else {//高速状态
                charbullet1 = new CharBullet(0, -60 - i * 70);
                charbullet2 = new CharBullet(22, -50 - i * 70);
                charbullet3 = new CharBullet(-22, -50 - i * 70);
                charbullet4 = new CharBullet(44, -40 - i * 70);
                charbullet5 = new CharBullet(-44, -40 - i * 70);
                charBulletArray.push(charbullet1, charbullet2, charbullet3, charbullet4, charbullet5);
                
            }
        }
        return charBulletArray; //返回自机子弹数组
    }
}


//右侧画文字
function drawText() {
    ctx2.save();
    ctx2.font = "30px Verdana";
    ctx2.fillText("Life", 30, 150);
    ctx2.restore();
}


//画自机残机数图标
function drawCharLife() {
    for (var i = 0; i < char.life; i++) {
        ctx2.drawImage(charlifeImg, 90 + i * 30, 125, 30, 30);
    }
}

//清除(更新)画布2所有元素
function clearCanvas2() {
    ctx2.clearRect(0, 0, canvas2.offsetWidth, canvas2.offsetHeight);
}



//画出一个自机子弹的图像
function drawCharBullet(charbullet) {
    if (charbullet.flag) {
        var x = charbullet.x;
        var y = charbullet.y;
        ctx.beginPath();
        ctx.moveTo(x - CHARBULLET_WIDTH_1 / 2, y - CHARBULLET_HEIGHT / 2);
        ctx.lineTo(x - CHARBULLET_WIDTH_2 / 2, y + CHARBULLET_HEIGHT / 2);
        ctx.lineTo(x + CHARBULLET_WIDTH_2 / 2, y + CHARBULLET_HEIGHT / 2);
        ctx.lineTo(x + CHARBULLET_WIDTH_1 / 2, y - CHARBULLET_HEIGHT / 2);
        ctx.closePath();
        if (cnt % 3 == 0) {//自机子弹闪烁效果
            ctx.save();
            ctx.fillStyle = "#A00000"; //子弹颜色设置为暗红色
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    }
}

//记录按键
var KeysDown = new Array(91);  //存储按键情况的数组
for (var i = 0; i < 91; i++) {
    KeysDown[i] = false;
}
addEventListener("keydown", function (e) {
    KeysDown[e.keyCode] = true; //将按键情况先存到数组里
}, false);

addEventListener("keyup", function (e) {
    KeysDown[e.keyCode] = false; //松开按键，删除按键数组对应元素
}, false);

//自机移动及状态函数
function charMove() {
    if (!char.miss) {
        var velocity = 8;
        char.speed = false;
        char.fire = false;
        if (KeysDown[16] || KeysDown[75]) {//如果按下shift键或k键（低速模式）
            char.speed = true;//低速状态
            velocity = 4;
        }


        if (KeysDown[90] || KeysDown[74]) {//按z键或j键开火
            char.fire = true;
        }

        if (KeysDown[81]) {//按q键暂停
            if (!flag_pause) {
                pause();
            }
        }

        var modify = 1;//速度的系数（用于防止斜向运动时合速度变为根号2倍）
        var num = 0;//同时按下了几个方向键
        for (var i = 37; i <= 40; i++) {
            if (KeysDown[i]) {
                num++;
            }
        }

        if (num == 2) {
            modify /= Math.sqrt(2);//同时按下两个方向键，每个方向速度除以根号2，才能保证总速度不变
        }
        if (KeysDown[37] || KeysDown[65]) {//左
            var tmp1 = char.x - velocity * modify;
            if (tmp1 > 5 && tmp1 < canvas.offsetWidth - 5) {//保证自机不会移出画面
                char.x = tmp1;
            }
        }
        if (KeysDown[39] || KeysDown[68]) {//右
            var tmp2 = char.x + velocity * modify;
            if (tmp2 > 5 && tmp2 < canvas.offsetWidth - 5) {
                char.x = tmp2;
            }
        }
        if (KeysDown[38] || KeysDown[87]) {//上
            var tmp3 = char.y - velocity * modify;
            if (tmp3 > 5 && tmp3 < canvas.offsetHeight - 5) {
                char.y = tmp3;
            }
        }
        if (KeysDown[40] || KeysDown[83]) {//下
            var tmp4 = char.y + velocity * modify;
            if (tmp4 > 5 && tmp4 < canvas.offsetHeight - 5) {
                char.y = tmp4;
            }
        }
    }
}

//开启自机无敌
function charInvince() {
    char.invincible = true;
    clearTimeout(t);
    
}
//关闭自机无敌
function cancelInvince() {
    char.invincible = false;
}

//画出敌机图像
function drawEnemy(enemy) {
    if (enemy.flag) {
        ctx.drawImage(enemyImg, enemy.x - ENEMY_WIDTH / 2, enemy.y - ENEMY_HEIGHT / 2, ENEMY_WIDTH, ENEMY_HEIGHT);
    }
}

//画敌机血条
function drawEnemyHP(enemy) {
    if (enemy.flag) {
        ctx.beginPath();
        ctx.save();
        ctx.lineWidth = 20;//设置线宽
        ctx.strokeStyle = "#994C00";
        offsetx = enemy.health / ENEMY_MAX_HEALTH * (680 - 20);
        ctx.moveTo(20, 40);
        ctx.lineTo(20 + offsetx, 40);
        ctx.stroke();
        ctx.restore();
    }
}

//敌机子弹类型
//类型1（圆形，大玉）
function BulletType_00(bullet) {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 50, 0, 2 * Math.PI);
    ctx.save();
    ctx.fillStyle = bullet.color;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}
//类型2（圆形，中玉）
function BulletType_01(bullet) {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 25, 0, 2 * Math.PI);
    ctx.save();
    ctx.fillStyle = bullet.color;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}
//类型3（圆形，小玉）
function BulletType_02(bullet) {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 10, 0, 2 * Math.PI);
    ctx.save();
    ctx.fillStyle = bullet.color;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}
//类型4（米弹，近似椭圆，实际由两个圆弧构成）
function BulletType_03(bullet) {
    ctx.beginPath();
    ctx.arc(bullet.x - 8 * Math.sqrt(2) * Math.cos(bullet.angle), bullet.y - 8 * Math.sqrt(2) * Math.sin(bullet.angle), 16 , -Math.PI / 4 + bullet.angle, Math.PI / 4 + bullet.angle);
    ctx.arc(bullet.x + 8 * Math.sqrt(2) * Math.cos(bullet.angle), bullet.y + 8 * Math.sqrt(2) * Math.sin(bullet.angle), 16 , 3 * Math.PI / 4 + bullet.angle, 5 * Math.PI / 4 + bullet.angle);
    ctx.closePath();
    ctx.save();
    ctx.fillStyle = bullet.color;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}
//类型5（瓜子形弹，由两段圆弧和三条线段构成）
function BulletType_04(bullet) {
    ctx.beginPath();
    let point1 = { x: bullet.x - 25 / 2 * Math.cos(bullet.angle), y: bullet.y - 25 / (2 * Math.sqrt(3)) * Math.cos(bullet.angle) - 25 / 2 * Math.sin(bullet.angle) };
    let point2 = { x: bullet.x + 25 / 2 * Math.cos(bullet.angle), y: bullet.y - 25 / (2 * Math.sqrt(3)) * Math.cos(bullet.angle) + 25 / 2 * Math.sin(bullet.angle) };
    ctx.arc(point1.x, point1.y, 25, bullet.angle, Math.PI / 3 + bullet.angle);
    ctx.arc(point2.x, point2.y, 25, 2 * Math.PI / 3 + bullet.angle, Math.PI + bullet.angle);
    ctx.moveTo(point1.x, point1.y);
    ctx.lineTo(point1.x + 7 * Math.sin(bullet.angle), point1.y - 7 * Math.cos(bullet.angle));
    ctx.lineTo(point2.x + 7 * Math.sin(bullet.angle), point2.y - 7 * Math.cos(bullet.angle));
    ctx.lineTo(point2.x, point2.y);
    ctx.save();
    ctx.fillStyle = bullet.color;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}
//类型6（五角星弹）
function BulletType_05(bullet) {
    let R = 28;
    let r = 2 * R / 3;
    let b = bullet.angle // 角度
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
        if (i % 2 == 1) {
            ctx.lineTo(bullet.x + r * Math.sin(b), bullet.y - r * Math.cos(b));
        }
        else {
            ctx.lineTo(bullet.x + R * Math.sin(b), bullet.y - R * Math.cos(b));
        }
        b += Math.PI / 5;
    }
    ctx.closePath();
    ctx.save();
    ctx.fillStyle = bullet.color;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

var bullets_00 = new Array();//bullets数组不能放在函数里面，因为函数每帧执行一次，而子弹不是每帧发一次
var bullets_01 = new Array();
var bullets_02 = new Array();
var bullets_03 = new Array();


//弹幕类型1：自机狙（向着自机发射）
function Danmaku_00(frame, speed, type, enemy, color) {//间隔帧数，子弹速度，子弹种类和发射弹幕的敌机
    if (enemy.flag) {
        if (cnt % frame == 0) {
            var bullet = new Bullet(enemy.x, enemy.y, speed, type, enemyAngle(enemy), enemy, color);
            bullets_00.push(bullet);
        }
        drawBullets(bullets_00);
    }
}
//弹幕类型二：圆形散射(或射线散射)
function Danmaku_01(x, y, frame, n, speed, type, enemy, color) {//n：一圈弹幕个数
    if (enemy.flag) {
        if (cnt % frame == 0) {
            for (var i = 0; i < n; i++) {
                var bullet = new Bullet(x, y, speed, type, i * 2 * Math.PI / n, enemy, color);
                bullets_01.push(bullet);
            }
        }
        drawBullets(bullets_01);
    }
}
//弹幕类型三：旋转散射
function Danmaku_02(frame, n, arcvelo, speed, type, enemy, color) {//arcvelo：旋转角速度
    if (enemy.flag) {
        if (cnt % frame == 0) {
            for (var i = 0; i < n; i++) {
                var bullet = new Bullet(enemy.x, enemy.y, speed, type, i * 2 * Math.PI / n + arcvelo * cnt, enemy, color);
                bullets_02.push(bullet);
            }
        }
        drawBullets(bullets_02);
    }
}
//弹幕类型四：竖直随机弹
function Danmaku_03(frame, n, speed, type, enemy, color) {//n：同时出现的子弹个数
    if (enemy.flag) {
        if (cnt % frame == 0) {
            for (var i = 0; i < n; i++) {
                var x = Math.random() * 701;
                var y = Math.random() * 501;
                var bullet = new Bullet(x, y, speed, type, Math.PI / 2, enemy, color);
                bullets_03.push(bullet);
            }
        }
        drawBullets(bullets_03);
    }
}


//子弹类型数组
var bullettypes = [BulletType_00, BulletType_01, BulletType_02, BulletType_03, BulletType_04, BulletType_05];

//返回某个敌机与自机之间的方位角
function enemyAngle(enemy) {
    return Math.atan2(char.y - enemy.y, char.x - enemy.x);
}


//画出敌机子弹
function drawBullets(bullets) {
    for (bullet of bullets) {
        if (bullet.flag && bullet.enemy.flag) {
            angle = bullet.angle + Math.PI / 2;  //这里相差PI/2是因为子弹朝向画错了()
            bullet.x += bullet.speed * Math.cos(angle);
            bullet.y += bullet.speed * Math.sin(angle);
            bullettypes[bullet.type](bullet);
        }
    }
}


//中弹检测
function checkChar(bullets) {//检测自机是否中弹
    if (!char.invincible && !char.miss) {
        for (bullet of bullets) {
            if (bullet.x < -100 || bullet.x > 100 + canvas.offsetWidth || bullet.y < -100 || bullet.y > 100 + canvas.offsetHeight) {//如果子弹跑到屏幕外（足够远距离）
                bullet.flag = false;//清除子弹
            }
            if (bullet.flag) {
                var dist = Math.sqrt(Math.pow((char.x - bullet.x), 2) + Math.pow((char.y - bullet.y), 2));
                if (dist < (CHAR_JUDGEPOINT + bullet_ranges[bullet.type])) {//中弹
                    char.miss = true//中弹状态
                    char.speed = false;
                    char.fire = false;
                    char.invincible = true;//中弹后的无敌状态
                    char.life--;
                    t = setTimeout(function () {
                        char.invincible = false;
                    }, 5000);//5秒后解除无敌状态
                    char.x = 350;
                    char.y = 815;
                }
            }
        }
    }
    else {
        if (char.y > 700 && char.miss) {
            char.y -= 1;
        }
        else if (char.y <= 700 && char.miss) {
            char.miss = false;
        }
    }
}
function checkEnemy(enemy,charBulletArray) {//检测敌机是否中弹
    if (enemy.flag) {
        for (charbullet of charBulletArray) {
            if (Math.abs(charbullet.x - enemy.x) < (ENEMY_WIDTH + CHARBULLET_WIDTH_2) / 2 && Math.abs(charbullet.y - enemy.y) < (ENEMY_HEIGHT + CHARBULLET_HEIGHT-50) / 2) {
                charbullet.flag = false;
                enemy.health -= 2;
            }
        }
        if (enemy.health < 0) {
            enemy.flag = false;
        }
    }
}


//符卡1
function SpellCard_00(enemy) {
    
    Danmaku_02(27, 15, Math.PI / 110, 1.25, 5, enemy, "#191970");
    Danmaku_02(27, 15, -Math.PI / 110, 1.25, 5, enemy, "#F5ED06");
    ctx.save();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "27px 黑体";
    ctx.fillText("星符「交错星尘」", 475, 80);
    ctx.restore();
}
//符卡2
function SpellCard_01(enemy) {
    
    Danmaku_00(320, 1.7, 0, enemy, "#FFFF99");
    Danmaku_02(9, 20, Math.PI / 345 + (cnt % 200 - 100) / 20000 * Math.PI, 3, 4, enemy, "#CCFFFF");
    ctx.save();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "27px 黑体";
    ctx.fillText("风符「晴空的波纹」", 450, 80);
    ctx.restore();
    //Danmaku_03(120, 20, 3, 3, enemy, "#FFFFFF");
}
//符卡3
function SpellCard_02(enemy) {
    Danmaku_02(17, 17, 2 * Math.PI / 70, Math.abs((cnt % 150) - 75) / 75 + 1, 1, enemy, "#F5ED06");
    Danmaku_02(14, 19, 2 * Math.PI / 70, Math.abs(((cnt + 75) % 150) - 75) / 50 + 1, 2, enemy, "#FFFFFF");
    ctx.save();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "27px 黑体";
    ctx.fillText("日出「云海霞光」", 475, 80);
    ctx.restore();
}
function SpellCard_03(enemy) {
    
    Danmaku_03(2, 1, 2 + (cnt % 300) / 100, 3, enemy, "#FFFFFF");
    Danmaku_01(enemy1.x, enemy1.y, 160, 30, 5, 5, enemy1,"#F5ED06")
    ctx.save();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "27px 黑体";
    ctx.fillText("雨符「骤雨的间隙」", 450, 80);
    ctx.restore();
}

//防止同时调用两个符卡的标记
var flag_00 = false;//调用哪个符卡的标记
var flag_01 = false;
var flag_02 = false;
var flag_03 = false;

//初始化函数
var reset = function () {
    char.x = 350;
    char.y = 700;
    char.speed = false;//默认为高速状态
    char.fire = false;
    char.miss = false;
    char.invincible = false;
    char.life = 3;
    drawChar(char.x, char.y);  //在初始位置画出自机图像（判定点）
    enemy1.flag = true;
    enemy1.x = 350;
    enemy1.y = 200;
    enemy1.health = ENEMY_MAX_HEALTH;
    bullets_00.length = 0; bullets_01.length = 0; bullets_02.length = 0; bullets_03.length = 0;
    cnt = 0;
    clearTimeout(t);
    flag_00 = false;
    flag_01 = false;
    flag_02 = false;
    flag_03 = false;
}


//标记调用的符卡
function dy_00() {//调用00符卡
    flag_00 = true;
}
function dy_01() {//调用01符卡
    flag_01 = true;

}
function dy_02() {//调用02符卡
    flag_02 = true;
}
function dy_03() {//调用03符卡
    flag_03 = true;
}

//绘制背景的函数
function drawBackground() {
    switch (true) {
        case flag_00: ctx.drawImage(bgImg1, 0, 0, canvas.offsetWidth, canvas.offsetHeight); break;
        case flag_01: ctx.drawImage(bgImg2, 0, 0, canvas.offsetWidth, canvas.offsetHeight); break;
        case flag_02: ctx.drawImage(bgImg3, 0, 0, canvas.offsetWidth, canvas.offsetHeight); break;
        case flag_03: ctx.drawImage(bgImg4, 0, 0, canvas.offsetWidth, canvas.offsetHeight); break;
    }
}


var flag_main = false;//防止主函数重复调用的标记（反复按同一个按钮可能出现的bug修正）
var flag_pause = false;//暂停的标记

function pause() {//暂停
    flag_pause = true;
}
function conti() {//继续
    flag_pause = false;
}
function kill() {//终止
    cancelAnimationFrame(m);
    flag_main = false;
    flag_pause = false;
    bullets_00.length = 0; bullets_01.length = 0; bullets_02.length = 0; bullets_03.length = 0;
    cnt = 0;
    flag_00 = false;
    flag_01 = false;
    flag_02 = false;
    flag_03 = false;
    clear();
}

var m;//主函数调用的句柄

function main() { //主函数

    if (!flag_pause) {
        flag_main = true;//防止主函数重复调用的标记

        cnt++;//帧数


        clearCanvas2();//清除右侧画面的函数
        drawText();//插入文字
        drawCharLife();//画自机残机（残余生命值）数
        //自机残余生命数==0时，终止
        if (char.life == 0) {
            ctx.save();
            ctx.font = "120px Verdana";
            ctx.fillStyle = "#CF0000";
            ctx.fillText("Failed", 180, 250);
            ctx.restore();
            flag_main = false;
            return;
        }
        //敌机残余生命值小于等于0时，终止
        if (enemy1.health <= 0) {
            clear();

            drawBackground();


            ctx.drawImage(charImg, char.x - 25, char.y - 35, 50, 70);//绘制自机图像
            ctx.save();
            ctx.font = "120px Verdana";
            ctx.fillStyle = "#CF0000";
            ctx.fillText("Win!", 200, 250);
            ctx.restore();
            flag_main = false;
            return;
        }

        clear();//清除左侧画面的函数
        drawBackground();
        charMove();//自机移动和状态计算函数
        drawChar(char.x, char.y);//画自机
        //画自机子弹
        if (char.fire) {
            var charBulletArray = registerCharBullet(); //自机开火时的子弹数组
            checkEnemy(enemy1, charBulletArray);
            for (var j = 0; j < 5; j++) {//五列子弹分开看
                var flag = true;
                for (var i = j; i < 60; i += 5) {
                    if (!charBulletArray[i].flag) {//如果这一列子弹中有一个撞到敌机了
                        flag = false;//更改标记
                    }
                    if (flag == false) {
                        charBulletArray[i].flag = false;//这一列后面的子弹都没有了
                    }
                }
            }
            for (charbullet of charBulletArray) {
                if (charbullet.flag) {
                    drawCharBullet(charbullet);
                }
            }
        }
        //画敌机和血条
        drawEnemy(enemy1);


        //敌机子弹不能被遮挡，因此最后画
        if (flag_00) {
            SpellCard_00(enemy1);
            ctx2.save();
            ctx2.font = "18px 宋体";
            ctx2.fillStyle = "#000000";
            ctx2.fillText("星尘在夜空中交错，忽明忽暗，很有", 30, 260);
            ctx2.fillText("意境。不过这里却不是星星，而是危", 30, 290);
            ctx2.fillText("险的弹幕。", 30, 320);
            ctx2.restore();
        }
        if (flag_01) {
            SpellCard_01(enemy1);
            ctx2.save();
            ctx2.font = "18px 宋体";
            ctx2.fillStyle = "#000000";
            ctx2.fillText("弹幕的波纹形状很像旋风，故得此名", 30, 260);
            ctx2.fillText("。这弹幕是改参数凑巧改出来的，没", 30, 290);
            ctx2.fillText("想到和东方里的一张符卡有点撞车。", 30, 320);
            ctx2.restore();
        }
        if (flag_02) {
            SpellCard_02(enemy1);
            ctx2.save();
            ctx2.font = "18px 宋体";
            ctx2.fillStyle = "#000000";
            ctx2.fillText("日出的万丈光芒在云海中喷发，想通", 30, 260);
            ctx2.fillText("过弹幕把这种景象展现出来。", 30, 290);
            ctx2.restore();
        }
        if (flag_03) {
            SpellCard_03(enemy1);
            ctx2.save();
            ctx2.font = "18px 宋体";
            ctx2.fillStyle = "#000000";
            ctx2.fillText("雨点是在一定范围内随机生成的，速", 30, 260);
            ctx2.fillText("度则是周期性变化的。看上去就像是", 30, 290);
            ctx2.fillText("间歇性的骤雨。此外，你要做的恰好", 30, 320);
            ctx2.fillText("也是不断穿过雨点之间的间隙。", 30, 350);
            ctx2.restore();
        }
        drawEnemyHP(enemy1);
        //自机中弹判定
        checkChar(bullets_00);
        checkChar(bullets_01);
        checkChar(bullets_02);
        checkChar(bullets_03);
    }
    tishi();//提示
    zhixie();//致谢

    m = requestAnimationFrame(main);//动画效果
}

//按钮调用的函数
function button0() {
    bgm_play();
    if (!flag_main) {
        reset();
        main();
    }
}
function button1() {
    bgm_play();
    if (!flag_main) {
        reset();
        dy_00();
        main();
    }
}
function button2() {
    bgm_play();
    if (!flag_main) {
        reset();
        dy_01();
        main();
    }
}
function button3() {
    bgm_play();
    if (!flag_main) {
        reset();
        dy_02();
        main();
    }
}
function button4() {
    bgm_play();
    if (!flag_main) {
        reset();
        dy_03();
        main();
    }
}
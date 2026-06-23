// ============================================================
//  礼物配置  ——  改这里就能换掉所有文案 / 路线 / 日期
// ============================================================

export const giftConfig = {
  // —— 寿星 & 署名 ——
  name: '春慧',
  fullName: '王春慧',
  age: 19,
  signature: 'hzh',

  // —— 生日日期（用于「已陪伴天数 / 倒计时」） ——
  //   设为今年生日；若今年生日已过，会自动显示「已度过 N 天」
  birthday: '2026-06-24',

  // —— 背景音乐：把你的 mp3 命名为 bgm.mp3 放进 public/ 即可 ——
  bgm: './bgm.mp3',

  // —— 开场打字机 ——
  introLines: [
    '正在为你打包一份 19 岁的惊喜…',
    '它从很远的地方出发，正在穿越山海来找你。',
  ],

  // —— 物流三段式 ——
  //   物流多段式：已发货 → 中转×N → 已签收，段数不限
  stages: [
    {
      key: 'shipped',
      status: '已发货',
      city: '四川·成都',
      time: '清晨 06:12',
      title: '一份心意，启程了',
      desc: '在蓉城的晨雾里，我把想念仔细封箱，贴上写着你名字的标签。',
      accent: '#a8c8ff',
    },
    {
      key: 't1',
      status: '运输中',
      city: '重庆',
      time: '上午 09:40',
      title: '翻过群山，到了山城',
      desc: '包裹在雾都的轻轨间穿梭，江风替我捎了一句「想见你」。',
      accent: '#b8d4ff',
    },
    {
      key: 't2',
      status: '运输中',
      city: '湖北·武汉',
      time: '午后 13:25',
      title: '路过江城，热干面很香',
      desc: '它在长江大桥上停了停，看了一会儿轮渡，又继续往东赶路。',
      accent: '#c4c8ff',
    },
    {
      key: 't3',
      status: '运输中',
      city: '安徽·合肥',
      time: '傍晚 17:50',
      title: '到了庐州，天色渐暗',
      desc: '黄昏的巢湖边亮起灯，它知道，离你只剩最后两段路了。',
      accent: '#c8b6ff',
    },
    {
      key: 't4',
      status: '运输中',
      city: '江苏·南京',
      time: '夜 21:18',
      title: '路过金陵，又近了一点',
      desc: '它在中转站短暂停留，被星河温柔托付给最后一程。',
      accent: '#d4b8ff',
    },
    {
      key: 'arrived',
      status: '已签收',
      city: '江苏·南通',
      time: '此刻',
      title: '它已经到你手里啦',
      desc: '请轻拆封，里面装着整个夏天，和一句迟到了很久的「生日快乐」。',
      accent: '#f9b8d4',
    },
  ],

  // —— 拆包裹提示 ——
  unwrapHint: '点击包裹，拆开你的 19 岁',

  // —— 照片墙标题 ——
  photoWallTitle: '她的一年',

  // —— 祝福页打字机 ——
  wishLines: [
    '亲爱的春慧，',
    '这是你的第 19 个夏天，',
    '愿你被温柔以待，被星光偏爱，',
    '愿你眼里有光，心里有海，所盼皆所愿。',
    '生日快乐。 🎂',
  ],

  // —— 蛋糕上方小字 ——
  cakeCaption: '点一下蜡烛，许个愿吧',
  candleDone: '愿望已生效，正在飞向宇宙 ✨',

  // —— 落款 ——
  signoff: '—— 来自 hzh，寄给你的整个夏天',

  // —— 照片墙：散落 Polaroid，按时间从早到晚排列 ——
  photos: [
    { src: './photos/4.jpg',  caption: '大学军训',     note: '脱离高中苦海进入大学，感觉你活泼了许多。', date: '2025-09-15 · 秋', rot: 5 },
    { src: './photos/5.jpg',  caption: '国庆旅游',     note: '希望你能愉快地度过这个假期。', date: '2025-10-01 · 秋', rot: -4 },
    { src: './photos/6.jpg',  caption: '常州音乐节',   note: '现场的音乐太棒了，所有人都沉浸在旋律里。', date: '2025-10-02 · 秋', rot: 6 },
    { src: './photos/7.jpg',  caption: '大学悠闲时光', note: '你总是那么轻松自在。', date: '2025-10-14 · 秋', rot: -8 },
    { src: './photos/8.jpg',  caption: '泡面',         note: '大学吃泡面可真香！', date: '2025-10-30 · 秋', rot: 3 },
    { src: './photos/9.jpg',  caption: '煎饼',         note: '在南通成功吃到连云港煎饼！', date: '2025-11-03 · 秋', rot: -5 },
    { src: './photos/10.jpg', caption: '高雅人士',     note: '今天的我们也是高雅人士呢。', date: '2025-11-07 · 秋', rot: 7 },
    { src: './photos/11.jpg', caption: '北风呼呼',     note: '北风呼呼地吹，也不知从哪儿来的。', date: '2025-11-17 · 冬', rot: -3 },
    { src: './photos/12.jpg', caption: '体测',         note: '800米测试完喝奶茶，真的太爽了！', date: '2025-11-20 · 冬', rot: 6 },
    { src: './photos/13.jpg', caption: '追剧',         note: '太深奥了，看不懂看不懂！', date: '2025-11-22 · 冬', rot: -7 },
    { src: './photos/14.jpg', caption: '买周边',       note: '买了好多喜欢的周边！', date: '2025-12-19 · 冬', rot: 4 },
    { src: './photos/15.jpg', caption: '圣诞节',       note: '别人的圣诞节甜甜蜜蜜，而我和xyw在宿舍玩冰与火还过不了。', date: '2025-12-25 · 冬', rot: -5 },
    { src: './photos/16.jpg', caption: '元旦',         note: '冬日里见一面，暖和了不少。', date: '2026-01-02 · 冬', rot: 8 },
    { src: './photos/17.jpg', caption: '打工',         note: '寒假打工存钱，真不容易啊。', date: '2026-01-14 · 冬', rot: -4 },
    { src: './photos/18.jpg', caption: '听歌',         note: '刻在我心底的名字，你藏在尘封的位置。', date: '2026-01-30 · 冬', rot: 6 },
    { src: './photos/19.jpg', caption: '逛街',         note: '在这座城市里，又标记了一处属于我们的地点。', date: '2026-02-10 · 冬', rot: -8 },
    { src: './photos/20.jpg', caption: '聚餐',         note: '三角形具有稳固性！', date: '2026-02-24 · 冬', rot: 3 },
    { src: './photos/21.jpg', caption: '做头发',       note: '不知道，反正我的头发很曼妙。', date: '2026-02-28 · 春', rot: -6 },
    { src: './photos/22.jpg', caption: '玩游戏',       note: '四人大战蛋仔，场面一度十分混乱。', date: '2026-03-11 · 春', rot: 5 },
    { src: './photos/23.jpg', caption: '喝酸奶',       note: 'xyw请我喝的"33"块的酸奶，贵但好喝！', date: '2026-03-23 · 春', rot: -3 },
    { src: './photos/24.jpg', caption: 'KFC',          note: '周末KFC一日游，快乐很简单。', date: '2026-03-28 · 春', rot: 7 },
    { src: './photos/25.jpg', caption: '扬州行',       note: '腰缠十万贯，骑鹤下扬州。', date: '2026-04-04 · 春', rot: -5 },
    { src: './photos/26.jpg', caption: '赏樱',         note: '樱花开了，一起去看看吧。', date: '2026-04-25 · 春', rot: 4 },
    { src: './photos/27.jpg', caption: '劳动节',       note: '劳动节聚餐，吃得很满足。', date: '2026-05-04 · 春', rot: -7 },
    { src: './photos/28.jpg', caption: '收集周边',     note: '又收集了好多徐良的周边，开心。', date: '2026-06-11 · 夏', rot: 6 },
    { src: './photos/1.jpg',  caption: '看徐良演唱会', note: '那天阳光很好，你笑得像整片海都亮了。', date: '2026-05-23 · 夏', rot: -7 },
  ],

  // —— 流星许愿：吹完蜡烛后流星划过，点中许一愿 ——
  wishes: [
    '愿你眼里有光，心里有海。',
    '愿你所盼皆所愿，所行皆坦途。',
    '愿你被这世界温柔以待。',
    '愿我们的故事，还有很长很长。',
    '愿你年年岁岁，都有人惦记。',
  ],

}

export default giftConfig

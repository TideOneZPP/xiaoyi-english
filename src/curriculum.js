export const edition = '译林版（三起·现行最新版）'
export const books = ['三年级上册', '三年级下册', '四年级上册', '四年级下册', '五年级上册', '五年级下册', '六年级上册', '六年级下册']
const gradeNumbers = { 三: 3, 四: 4, 五: 5, 六: 6 }
export const editionByBook = Object.fromEntries(books.map((book, index) => [book, index < 4 ? '2024新版' : '现行版（等待新版发布）']))

const officialDetail = contentId => `https://basic.smartedu.cn/tchMaterial/detail?contentType=assets_document&contentId=${contentId}&catalogType=tchMaterial&subCatalog=tchMaterial`

export const officialTextbookByBook = {
  '三年级上册': officialDetail('aa2275a3-f969-c5fe-1c2c-d08b92223b67'),
  '三年级下册': officialDetail('c1a23e1e-a239-1533-bf2f-18332a4f7355'),
  '四年级上册': officialDetail('a9ce6662-f5a5-4561-944a-c3dbcc5a8192'),
  '四年级下册': officialDetail('a4fb0c8b-ebd6-4db9-bca0-705fca8126e4'),
  '五年级上册': officialDetail('06631d69-0865-4694-baf9-dccf22bff2fd'),
  '五年级下册': officialDetail('d3324da8-fe96-4a0d-9259-e60794e27491'),
  '六年级上册': officialDetail('32d2e60a-be5a-4c1c-92d6-8b99e00f6db3'),
  '六年级下册': officialDetail('2b63b996-3f8c-439a-bb0c-3f127c9507af'),
}

const palettes = ['#ff7a68', '#5ecfa2', '#56b8e8', '#f3b84f', '#9b7de3', '#ef78a5', '#55c2c3', '#7f9dea']

const bookSpecs = {
  '三年级上册': [
    ['Hello!', '见面问候', '👋', 'hello:你好:👋|hi:嗨:😊|morning:早晨:🌤️|goodbye:再见:👋', 'Hello, I am Mike.', 'Good morning, Miss Li.', 'Hello'],
    ["What's your name?", '询问姓名', '🏷️', 'name:名字:🏷️|what:什么:❓|my:我的:🙋|your:你的:👉', 'What is your name?', 'My name is Yang Ling.', 'name'],
    ['Are you Su Hai?', '确认他人身份', '🙋', 'are:是:✨|you:你:👉|yes:是的:✅|no:不:🙅', 'Are you Su Hai?', 'Yes, I am.', 'Su'],
    ['This is my friend', '介绍朋友', '🧑‍🤝‍🧑', 'friend:朋友:🧑‍🤝‍🧑|this:这:👉|he:他:👦|she:她:👧', 'This is my friend.', 'She is Yang Ling.', 'friend'],
    ["She's my mother", '介绍家人', '👩', 'mother:妈妈:👩|father:爸爸:👨|sister:姐姐或妹妹:👧|brother:哥哥或弟弟:👦', 'She is my mother.', 'This is my family.', 'mother'],
    ['Is he your grandpa?', '认识长辈', '👴', 'grandpa:爷爷或外公:👴|grandma:奶奶或外婆:👵|family:家庭:🏡|photo:照片:🖼️', 'Is he your grandpa?', 'Yes, he is.', 'grandpa'],
    ['Happy Birthday!', '生日祝福与年龄', '🎂', 'birthday:生日:🎂|cake:蛋糕:🍰|gift:礼物:🎁|happy:快乐的:😊', 'Happy Birthday!', 'This gift is for you.', 'Birthday'],
    ['I can do this for you', '表达帮助与能力', '🤝', 'help:帮助:🤝|draw:画画:🖍️|sing:唱歌:🎤|make:制作:🛠️', 'I can help you.', 'I can make a card for you.', 'help'],
  ],
  '三年级下册': [
    ['School things', '认识学习用品', '🎒', 'pencil:铅笔:✏️|ruler:尺子:📏|book:书:📘|schoolbag:书包:🎒', 'What is that?', 'It is a schoolbag.', 'schoolbag'],
    ['Clean our classroom', '共同打扫教室', '🧹', 'clean:打扫:🧹|desk:课桌:🪑|chair:椅子:🪑|window:窗户:🪟', 'Let us clean the classroom.', 'I can clean the desks.', 'clean'],
    ['School rules', '遵守校园规则', '🚸', 'rule:规则:📋|run:跑:🏃|shout:喊叫:📣|listen:听:👂', 'Do not run in the classroom.', 'Please listen to the teacher.', 'run'],
    ['Have fun after class', '快乐课间活动', '⚽', 'play:玩:⚽|skip:跳绳:🪢|read:阅读:📖|after:在……之后:➡️', 'What do you do after class?', 'I play with my friends.', 'after'],
    ['Fruit', '谈论喜欢的水果', '🍎', 'apple:苹果:🍎|banana:香蕉:🍌|orange:橙子:🍊|grape:葡萄:🍇', 'Do you like apples?', 'Yes, I do.', 'apples'],
    ['On the farm', '观察农场事物', '🚜', 'farm:农场:🚜|cow:奶牛:🐄|pig:猪:🐷|chicken:鸡:🐔', 'What are these?', 'They are cows.', 'these'],
    ['Animals', '描述动物', '🐾', 'animal:动物:🐾|panda:熊猫:🐼|monkey:猴子:🐒|elephant:大象:🐘', 'What animal is it?', 'It is a panda.', 'animal'],
    ['Colours', '发现自然中的颜色', '🎨', 'red:红色:🔴|yellow:黄色:🟡|green:绿色:🟢|blue:蓝色:🔵', 'What colour is the flower?', 'It is yellow.', 'colour'],
  ],
  '四年级上册': [
    ['Our school subjects', '谈论学校课程', '📘', 'English:英语:🔤|Maths:数学:➗|Art:美术:🎨|Music:音乐:🎵', 'What subjects do you like?', 'I like English and Art.', 'subjects'],
    ['My day', '描述每日作息', '🌅', 'breakfast:早餐:🥣|school:学校:🏫|homework:家庭作业:📝|dinner:晚餐:🍲', 'I get up at seven.', 'I do my homework at five.', 'seven'],
    ['My week', '安排一周活动', '🗓️', 'Monday:星期一:1️⃣|Tuesday:星期二:2️⃣|Friday:星期五:5️⃣|week:星期:🗓️', 'What day is it today?', 'It is Friday.', 'day'],
    ['I like sport', '谈论运动喜好', '🏀', 'sport:运动:🏅|basketball:篮球:🏀|football:足球:⚽|table tennis:乒乓球:🏓', 'What sport do you like?', 'I like playing basketball.', 'sport'],
    ['Different toys, same fun', '分享不同玩具', '🧸', 'toy:玩具:🧸|robot:机器人:🤖|kite:风筝:🪁|doll:玩具娃娃:🪆', 'What toys do you have?', 'I have a robot.', 'toys'],
    ['Weather', '谈论天气', '🌦️', 'sunny:晴朗的:☀️|rainy:下雨的:🌧️|cloudy:多云的:☁️|windy:有风的:💨', 'What is the weather like?', 'It is sunny today.', 'weather'],
    ['Seasons', '谈论四季活动', '🍂', 'spring:春天:🌸|summer:夏天:☀️|autumn:秋天:🍂|winter:冬天:❄️', 'Which season do you like?', 'I like summer.', 'season'],
    ['What we wear', '描述衣着', '👕', 'shirt:衬衫:👔|dress:连衣裙:👗|trousers:长裤:👖|coat:外套:🧥', 'What are you wearing?', 'I am wearing a blue coat.', 'wearing'],
  ],
  '四年级下册': [
    ["We're friends", '认识朋友的共同点', '🧑‍🤝‍🧑', 'friend:朋友:🧑‍🤝‍🧑|kind:友善的:💛|same:相同的:=|different:不同的:↔️', 'We are good friends.', 'We both like reading.', 'friends'],
    ['Helping others at school', '在学校帮助他人', '🤝', 'help:帮助:🤝|carry:搬运:📦|show:指引:👉|classmate:同学:🧑‍🎓', 'Can I help you?', 'I can carry the books.', 'help'],
    ['Road safety', '学习道路安全', '🚦', 'road:道路:🛣️|crossing:人行横道:🚸|traffic:交通:🚦|safe:安全的:✅', 'We must follow the rules.', 'Wait for the green light.', 'rules'],
    ['Caring about others', '关心他人感受', '💗', 'care:关心:💗|tired:疲倦的:😴|ill:生病的:🤒|water:水:💧', 'What is the matter?', 'Let me get some water for you.', 'matter'],
    ['Eating out', '在外就餐与点餐', '🍜', 'menu:菜单:📋|noodles:面条:🍜|rice:米饭:🍚|juice:果汁:🧃', 'What would you like?', 'I would like some noodles.', 'noodles'],
    ['Jobs', '了解常见职业', '👩‍⚕️', 'teacher:老师:👩‍🏫|doctor:医生:👩‍⚕️|worker:工人:👷|driver:司机:🚌', 'What does your mother do?', 'She is a doctor.', 'doctor'],
    ['Doing chores at home', '在家做家务', '🧹', 'chore:家务:🧹|wash:清洗:🫧|sweep:扫地:🧹|tidy:整理:🧺', 'What are you doing?', 'I am tidying my room.', 'doing'],
    ['In the kitchen', '在厨房准备食物', '🍳', 'kitchen:厨房:🍳|cook:烹饪:👩‍🍳|soup:汤:🥣|vegetable:蔬菜:🥬', 'What is Dad doing?', 'He is cooking soup.', 'cooking'],
  ],
  '五年级上册': [
    ['Goldilocks and the three bears', '描述房屋与感受', '🐻', 'house:房子:🏠|room:房间:🚪|hard:硬的:🪨|soft:柔软的:🧸', 'There is a house in the forest.', 'This bed is just right.', 'house'],
    ['A new student', '介绍学校设施', '🏫', 'classroom:教室:🏫|library:图书馆:📚|computer:电脑:💻|floor:楼层:🏢', 'Is there a library?', 'Yes, there is.', 'library'],
    ['Our animal friends', '描述动物特征', '🐾', 'body:身体:🧍|wing:翅膀:🪽|leg:腿:🦵|tail:尾巴:🐕', 'It has four legs.', 'It can run and jump.', 'legs'],
    ['Hobbies', '谈论兴趣爱好', '🎯', 'dance:跳舞:💃|draw:画画:🖍️|read:阅读:📖|sing:唱歌:🎤', 'I like reading stories.', 'She likes dancing.', 'reading'],
    ['What do they do?', '谈论职业', '👩‍⚕️', 'teacher:老师:👩‍🏫|doctor:医生:👩‍⚕️|worker:工人:👷|writer:作家:✍️', 'What does your father do?', 'He is a doctor.', 'doctor'],
    ['My e-friend', '介绍网友信息', '💻', 'country:国家:🌍|study:学习:📚|live:居住:🏠|email:电子邮件:📧', 'He lives in the UK.', 'He studies Chinese after school.', 'lives'],
    ['At weekends', '谈论周末活动', '🚲', 'weekend:周末:🗓️|visit:拜访:🚪|often:经常:🔁|sometimes:有时:🔄', 'What do you do at weekends?', 'I often visit my grandparents.', 'weekends'],
    ['At Christmas', '了解圣诞活动', '🎄', 'Christmas:圣诞节:🎄|present:礼物:🎁|stocking:长筒袜:🧦|turkey:火鸡:🦃', 'We put presents under the tree.', 'We have a big lunch.', 'presents'],
  ],
  '五年级下册': [
    ['Cinderella', '阅读童话故事', '👠', 'prince:王子:🤴|fairy:仙女:🧚|shoe:鞋:👠|party:聚会:🎉', 'Cinderella cannot go to the party.', 'The shoe fits her.', 'party'],
    ['How do you come to school?', '谈论交通方式', '🚌', 'metro:地铁:🚇|taxi:出租车:🚕|bike:自行车:🚲|plane:飞机:✈️', 'How do you come to school?', 'I come to school by bus.', 'school'],
    ['Asking the way', '问路与指路', '🗺️', 'street:街道:🛣️|station:车站:🚉|bookshop:书店:📚|hospital:医院:🏥', 'How do I get to the bookshop?', 'Go along this street.', 'bookshop'],
    ['Seeing the doctor', '就医与健康建议', '🩺', 'headache:头痛:🤕|toothache:牙痛:🦷|medicine:药:💊|rest:休息:🛌', 'I have a headache.', 'You should have a rest.', 'headache'],
    ['Helping our parents', '描述正在做的家务', '🧹', 'clean:打扫:🧹|cook:做饭:🍳|wash:清洗:🫧|sweep:扫地:🧹', 'I am cleaning the table.', 'My mother is cooking dinner.', 'cleaning'],
    ['In the kitchen', '描述食物与烹饪', '🍲', 'meat:肉:🥩|vegetable:蔬菜:🥬|tomato:西红柿:🍅|soup:汤:🥣', 'Is there any soup?', 'The meat smells nice.', 'soup'],
    ['Chinese festivals', '介绍中国传统节日', '🏮', 'festival:节日:🏮|dragon:龙:🐉|moon:月亮:🌕|dumpling:饺子:🥟', 'People eat moon cakes.', 'Families get together at this festival.', 'festival'],
    ['Birthdays', '谈论生日日期与活动', '🎂', 'birthday:生日:🎂|date:日期:📅|eleventh:第十一:1️⃣|eighth:第八:8️⃣', 'When is your birthday?', 'It is on the eighth of May.', 'birthday'],
  ],
  '六年级上册': [
    ["The king's new clothes", '复述经典故事', '👑', 'king:国王:👑|clever:聪明的:🧠|foolish:愚蠢的:🤪|wear:穿着:👕', 'The king walked through the city.', 'A little boy told the truth.', 'king'],
    ['What a day!', '记录过去的一天', '🌧️', 'sunny:晴朗的:☀️|cloudy:多云的:☁️|rainy:下雨的:🌧️|weather:天气:🌦️', 'It was sunny in the morning.', 'We saw some interesting parrots.', 'sunny'],
    ['Holiday fun', '分享假期经历', '🏖️', 'holiday:假期:🏖️|museum:博物馆:🏛️|Palace:宫殿:🏯|Bund:外滩:🌆', 'Where did you go for the holiday?', 'I visited the Shanghai Museum.', 'holiday'],
    ['Then and now', '比较过去和现在', '📱', 'ago:以前:⏳|office:办公室:🏢|mobile:手机:📱|Internet:互联网:🌐', 'He could not write ten years ago.', 'Now he can use the Internet.', 'write'],
    ['Signs', '理解公共标识', '🚫', 'sign:标识:🚸|museum:博物馆:🏛️|restaurant:餐馆:🍽️|smoke:吸烟:🚭', 'What does this sign mean?', 'It means you cannot smoke here.', 'sign'],
    ['Keep our city clean', '保护城市环境', '🏙️', 'dirty:肮脏的:🗑️|rubbish:垃圾:🚮|factory:工厂:🏭|clean:干净的:✨', 'What makes our city dirty?', 'We can put rubbish in the bin.', 'dirty'],
    ['Protect the Earth', '保护地球资源', '🌍', 'Earth:地球:🌍|energy:能源:⚡|plastic:塑料:🥤|wood:木材:🪵', 'We should protect the Earth.', 'We should not waste water.', 'Earth'],
    ['Chinese New Year', '规划春节活动', '🧧', 'firework:烟花:🎆|lion:狮子:🦁|packet:红包:🧧|eve:前夜:🌙', 'What are you going to do?', 'We are going to watch fireworks.', 'fireworks'],
  ],
  '六年级下册': [
    ['The lion and the mouse', '理解寓言故事', '🦁', 'lion:狮子:🦁|mouse:老鼠:🐭|net:网:🕸️|bite:咬:🦷', 'The lion caught the mouse.', 'The mouse helped the lion.', 'mouse'],
    ['Good habits', '培养良好习惯', '✅', 'habit:习惯:✅|early:早地:🌅|late:晚地:🌙|tidy:整洁的:🧺', 'He gets up early every day.', 'She keeps her room tidy.', 'early'],
    ['A healthy diet', '建立健康饮食', '🥗', 'diet:饮食:🥗|healthy:健康的:💪|vegetable:蔬菜:🥦|cola:可乐:🥤', 'We should have a healthy diet.', 'She eats a lot of vegetables.', 'healthy'],
    ['Road safety', '学习道路安全', '🚦', 'road:道路:🛣️|crossing:人行横道:🚸|traffic:交通:🚦|pavement:人行道:🚶', 'We must look for a zebra crossing.', 'We must wait for the green man.', 'crossing'],
    ['A party', '筹备班级聚会', '🎉', 'balloon:气球:🎈|snack:零食:🍿|clown:小丑:🤡|appear:出现:✨', 'What are you going to bring?', 'I am going to bring some snacks.', 'bring'],
    ['An interesting country', '了解澳大利亚', '🦘', 'Australia:澳大利亚:🇦🇺|kangaroo:袋鼠:🦘|koala:考拉:🐨|Sydney:悉尼:🌉', 'Australia is an interesting country.', 'You will find kangaroos there.', 'Australia'],
    ['Summer holiday plans', '制订暑假计划', '🧳', 'plan:计划:📝|traveller:旅行者:🧳|stay:停留:🏨|photo:照片:📷', 'Where will you go for the holiday?', 'I will stay there for a week.', 'holiday'],
    ['Our dreams', '谈论职业梦想', '🚀', 'dream:梦想:🌟|dentist:牙医:🦷|astronaut:宇航员:🚀|artist:艺术家:🎨', 'What do you want to be?', 'I want to be an astronaut.', 'astronaut'],
  ],
}

const parseWords = value => value.split('|').map(item => {
  const [en, zh, emoji] = item.split(':')
  return { en, zh, emoji }
})

const cleanWords = sentence => sentence.replace(/[?.!,]/g, '').split(/\s+/).filter(Boolean)

function createUnits(book, specs) {
  const grade = gradeNumbers[book[0]]
  return specs.map((spec, index) => {
    const [title, zh, emoji, wordText, example, secondExample, blank] = spec
    const words = parseWords(wordText)
    const next = specs[(index + 1) % specs.length]
    const previous = specs[(index + specs.length - 1) % specs.length]
    const listenOptions = [example, next[4], previous[4]].filter((item, pos, arr) => arr.indexOf(item) === pos)
    const themeOptions = grade >= 5 ? [title, next[0], previous[0]] : [zh, next[1], previous[1]]
    const themeAnswer = grade >= 5 ? title : zh
    const choiceWord = words[1] || words[0]
    const choiceOptions = [choiceWord.en, words[0].en, words[2]?.en].filter((item, pos, arr) => item && arr.indexOf(item) === pos)
    const fillSentence = example.toLowerCase().includes(blank.toLowerCase()) ? example : secondExample
    const blankIndex = fillSentence.toLowerCase().indexOf(blank.toLowerCase())
    const before = blankIndex >= 0 ? fillSentence.slice(0, blankIndex) : ''
    const after = blankIndex >= 0 ? fillSentence.slice(blankIndex + blank.length) : fillSentence
    const orderWords = cleanWords(secondExample)
    return {
      id: `${book[0]}${book.includes('上') ? 'a' : 'b'}-u${index + 1}`,
      book,
      edition: editionByBook[book],
      grade,
      number: index + 1,
      title,
      zh,
      color: palettes[index % palettes.length],
      emoji,
      words,
      focus: `${example} / ${secondExample}`,
      activities: [
        { type: 'word', label: '核心词汇', words, tip: '每个词都先听清楚，再完整跟读。' },
        { type: 'choice', label: '词义辨析', prompt: `“${choiceWord.zh}”用英语怎么说？`, hint: `回想本单元主题“${zh}”。`, options: choiceOptions, answer: choiceWord.en },
        { type: 'listen', label: '听力挑战', speech: example, prompt: '听一听，选择你听到的句子', options: listenOptions, answer: example },
        { type: 'fill', label: '句型补全', prompt: '补全本单元核心句型', before, after, answer: blank, hint: `完整句子是：${fillSentence}` },
        { type: 'order', label: '排列句子', prompt: '把单词排成一句完整的话', words: [...orderWords.slice(1), orderWords[0]], answer: orderWords },
        { type: 'read', label: grade >= 5 ? '语篇理解' : '情景理解', passage: `${example} ${secondExample}`, prompt: grade >= 5 ? 'Choose the best topic for the text.' : '这段话主要表达什么？', options: themeOptions, answer: themeAnswer, hint: `抓住关键词：${words.slice(0, 2).map(word => word.en).join('、')}` },
      ],
    }
  })
}

export const curriculum = Object.fromEntries(books.map(book => [book, createUnits(book, bookSpecs[book])]))
export const units = curriculum[books[0]]
export const getUnits = book => curriculum[book] || []

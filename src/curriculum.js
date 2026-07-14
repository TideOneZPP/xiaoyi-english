export const books = ['三年级上册', '三年级下册', '四年级上册', '四年级下册', '五年级上册', '六年级上册']

export const units = [
  {
    id: 'u1', number: 1, title: 'Hello', zh: '你好，新朋友', color: '#ff7a68', emoji: '👋',
    words: [
      { en: 'hello', zh: '你好', emoji: '👋' },
      { en: 'hi', zh: '嗨', emoji: '😊' },
      { en: 'good morning', zh: '早上好', emoji: '🌤️' },
      { en: 'class', zh: '同学们；班级', emoji: '🏫' },
    ],
    focus: "Hello. / Hi. / Good morning.",
    activities: [
      { type: 'word', word: 'hello', zh: '你好', emoji: '👋', tip: '见到新朋友时，挥挥手说 hello。' },
      { type: 'choice', prompt: '早上见到老师，你会说？', hint: 'morning 是“早晨”的意思。', options: ['Good morning!', 'Good night!', 'Goodbye!'], answer: 'Good morning!' },
      { type: 'listen', speech: "Hello, I'm Mike.", prompt: '听一听，Mike 说了什么？', options: ["Hello, I'm Mike.", 'Good morning, Liu Tao.', 'Goodbye, Mike.'], answer: "Hello, I'm Mike." },
      { type: 'fill', prompt: '补全这句自我介绍', before: "Hello, ", after: " Liu Tao.", answer: "I'm", alternatives: ['Im', 'i’m'], hint: "I'm 是 I am 的缩写，中间有一个小撇号。" },
      { type: 'order', prompt: '把单词排成一句礼貌的问候', words: ['morning', 'Good', 'class'], answer: ['Good', 'morning', 'class'] },
    ],
  },
  {
    id: 'u2', number: 2, title: "I'm Liu Tao", zh: '介绍我自己', color: '#5ecfa2', emoji: '🙋',
    words: [
      { en: 'I', zh: '我', emoji: '🙋' }, { en: 'am', zh: '是', emoji: '✨' },
      { en: 'are', zh: '是', emoji: '🤝' }, { en: 'yes', zh: '是的', emoji: '✅' },
    ],
    focus: "I'm… / Are you…? / Yes, I am.",
    activities: [
      { type: 'word', word: "I'm", zh: '我是', emoji: '🙋', tip: "I'm 是 I am 的缩写，读起来更自然。" },
      { type: 'choice', prompt: '想介绍自己是王兵，应该说？', hint: "用 I'm + 名字来介绍自己。", options: ["I'm Wang Bing.", 'Are you Wang Bing?', 'Hi, Wang Bing.'], answer: "I'm Wang Bing." },
      { type: 'listen', speech: 'Are you Su Hai?', prompt: '听一听，这是介绍还是提问？', options: ['在询问对方是谁', '在介绍自己', '在和大家告别'], answer: '在询问对方是谁' },
      { type: 'fill', prompt: '补全肯定回答', before: 'Yes, I ', after: '.', answer: 'am', hint: 'Are you…? 的肯定回答是 Yes, I am.' },
      { type: 'order', prompt: '把单词排成一个问题', words: ['Liu Tao', 'you', 'Are'], answer: ['Are', 'you', 'Liu Tao'] },
    ],
  },
  {
    id: 'u3', number: 3, title: 'My friends', zh: '认识新朋友', color: '#56b8e8', emoji: '🧑‍🤝‍🧑',
    words: [
      { en: 'friend', zh: '朋友', emoji: '🧑‍🤝‍🧑' }, { en: 'he', zh: '他', emoji: '👦' },
      { en: 'she', zh: '她', emoji: '👧' }, { en: 'too', zh: '也', emoji: '➕' },
    ],
    focus: "He's… / She's… / He's my friend.",
    activities: [
      { type: 'word', word: 'friend', zh: '朋友', emoji: '🧑‍🤝‍🧑', tip: 'friend 的结尾要轻轻读出 /d/。' },
      { type: 'choice', prompt: '向别人介绍一位男同学，可以说？', hint: "he 指“他”，he is 可以缩写成 he's。", options: ["He's my friend.", "She's my friend.", "I'm your friend."], answer: "He's my friend." },
      { type: 'listen', speech: "She's Yang Ling. She's my friend.", prompt: '听一听，说话的人介绍了谁？', options: ['Yang Ling', 'Mike', 'Liu Tao'], answer: 'Yang Ling' },
      { type: 'fill', prompt: '补全对女同学的介绍', before: '', after: " my friend.", answer: "She's", hint: "she is 可以缩写成 she's。" },
      { type: 'order', prompt: '排成一句完整的介绍', words: ['friend', 'is', 'She', 'my'], answer: ['She', 'is', 'my', 'friend'] },
    ],
  },
  {
    id: 'u4', number: 4, title: 'My family', zh: '介绍我的家人', color: '#f3b84f', emoji: '🏡',
    words: [
      { en: 'family', zh: '家庭', emoji: '🏡' }, { en: 'father', zh: '爸爸', emoji: '👨' },
      { en: 'mother', zh: '妈妈', emoji: '👩' }, { en: 'sister', zh: '姐姐；妹妹', emoji: '👧' },
    ],
    focus: "This is my… / He's… / She's…",
    activities: [
      { type: 'word', word: 'family', zh: '家庭；家人', emoji: '🏡', tip: 'family 是一个温暖的词，重音在第一个音节。' },
      { type: 'choice', prompt: '介绍自己的妈妈，应该说？', hint: 'this is… 用来介绍身边的人或物。', options: ['This is my mother.', 'Are you my mother?', 'He is my mother.'], answer: 'This is my mother.' },
      { type: 'listen', speech: 'This is my sister, Helen.', prompt: '听一听，Helen 是“我”的谁？', options: ['姐姐或妹妹', '妈妈', '朋友'], answer: '姐姐或妹妹' },
      { type: 'fill', prompt: '补全对爸爸的介绍', before: 'This is my ', after: '.', answer: 'father', hint: '爸爸是 father，妈妈是 mother。' },
      { type: 'order', prompt: '排成一句完整的介绍', words: ['my', 'family', 'This', 'is'], answer: ['This', 'is', 'my', 'family'] },
    ],
  },
]

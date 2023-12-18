const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')

const bot = new Telegraf('6572967533:AAFiCVamXtwvC8aka9G4pAOqpsiDYIVzBkY')



// Your classmates, Telegram tags, and lessons data
const classmates1 = [
    "Барицький Cвятослав","Висоцький Тарас","Герасименко Микола","Голюк Ілля",
    "Гонта Дмитро","Гуральник Арсен","Гуцаленко Ярослав","Корінник Богдан","Кудринецький Богдан",
    "Лаппо Роман","Максименко Максим","Моісєєв Данііл","Панченко Михайло","Погоріло Владислав",
    "Сидорук Дмитро","Стадніков Ростислав","Топорівський Владислав","Цимбал Максим"
];

const TelegramTags = [
    "Sviatoslav","vysotskyi_tarasik","Herasimenko","curl1ng","GONTA","arsenja9",
    "Ярослав","jdkk6","ImDrive1488","Роман","maxim_m28","msvvvvvvv","mixa_tut25",
    "mmmaarrrss","dima_sidoruk","Rostik","toporivskyi_vlad","Volodimir17741"
];

const lessons = [
    { name: "Database-Systems", link: "https://meet.google.com/pzc-tpto-wfj" },
    { name: "Electronics-and-Microprocessor-Technology", link: "https://meet.google.com/nmb-idaj-sdk" },
    { name: "Philosophy", link: "https://meet.google.com/tws-stmw-dwt?authuser=0" },
    { name: "Advanced-Mathematics", link: "https://meet.google.com/via-andt-hrt" },
    { name: "Counteraction-Means-of-Mind-Manipulation", link: "https://meet.google.com/aum-rgow-tgx" },
    { name: "Physical-Education", link: "https://meet.google.com/abx-fkis-mqd" },
    { name: "Object-Oriented-Programming", options: ["Lecture", "Practice"], links: ["https://meet.google.com/oes-fdfs-kxy", "https://meet.google.com/osb-rucc-bxe"] },
    { name: "English-Language", options: ["First Group", "Second Group"], links: ["https://meet.google.com/kfx-qrmc-pqy", "https://meet.google.com/sak-ypza-wpv?authuser=0&hl=en"] },
];

// Create an array to store visit log
const visitLog = [];

// Function to log user visits
function logVisit(userId, lessonName) {
    const timestamp = new Date().toLocaleString();
    visitLog.push({ userId, lessonName, timestamp });
}

// Function to display visit log
function displayVisitLog(ctx, date, lesson) {
    let filteredLog = visitLog;

    if (date) {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
            const formattedDate = parsedDate.toLocaleDateString();
            filteredLog = filteredLog.filter(log => log.timestamp.includes(formattedDate));
        } else {
            ctx.reply('Invalid date format. Please use YYYY-MM-DD.');
            return;
        }
    }

    if (lesson) {
        const formattedLesson = lesson.toLowerCase().trim();
        filteredLog = filteredLog.filter(log => log.lessonName.toLowerCase().trim() === formattedLesson);
    }

    const logText = filteredLog.map(log => `${log.timestamp}: ${ctx.user.name} visited ${log.lessonName}`).join('\n');
    ctx.reply(logText || 'No visits recorded for the specified criteria.');
}

// Map Telegram tags to classmates
const tagToNameMap = {};
TelegramTags.forEach((tag, index) => {
    tagToNameMap[tag.toLowerCase()] = classmates1[index];
});

// Handle Ярослав and Роман
const specialCases = {
    'Рома': 'Лаппо Роман',
    'Ярослав': 'Гуцаленко Ярослав'
};

// Middleware to automatically assign names based on Telegram tags
bot.use((ctx, next) => {
    const userId = ctx.from.id;
    const userTag = ctx.from.username ? ctx.from.username.toLowerCase() : '';

    if (tagToNameMap[userTag]) {
        const userName = tagToNameMap[userTag];
        ctx.user = { id: userId, name: userName };
    } else if (specialCases[userTag]) {
        const userName = specialCases[userTag];
        ctx.user = { id: userId, name: userName };
    } else {
        ctx.user = { id: userId, name: null };
    }

    return next();
});

// Function to send the lesson menu
function sendLessonMenu(ctx) {
    const userName = ctx.user.name ? ctx.user.name : 'Unknown User';
    ctx.reply(`Welcome, ${userName}! Choose a lesson:`, {
        reply_markup: {
            inline_keyboard: lessons.map((lesson) => [{ text: lesson.name, callback_data: lesson.name.replace(/\s/g, '_') }])
        },
    });
}

// Command to trigger the inline keyboard with lesson buttons
bot.start((ctx) => {
    sendLessonMenu(ctx);
});

// Handle lesson button callbacks
lessons.forEach((lesson) => {
    const callbackData = lesson.name.replace(/\s/g, '_');
    bot.action(callbackData, (ctx) => {
        const userId = ctx.from.id;
        const lessonName = lesson.name;

        logVisit(userId, lessonName);

        if (lesson.link) {
            ctx.reply(`You selected the lesson: ${lesson.name}\nHere is the link: ${lesson.link}`);
        } else if (lesson.options && lesson.links) {
            const buttons = lesson.options.map((option, index) => ({
                text: option,
                callback_data: `${callbackData}_${index}`
            }));
            ctx.reply(`Choose an option for ${lesson.name}:`, {
                reply_markup: {
                    inline_keyboard: [buttons],
                },
            });
        }
    });
});

// Handle additional options for Object-Oriented Programming and English Language
lessons.filter(lesson => lesson.options && lesson.links).forEach((lesson) => {
    lesson.options.forEach((option, index) => {
        const callbackData = `${lesson.name.replace(/\s/g, '_')}_${index}`;
        bot.action(callbackData, (ctx) => {
            const userId = ctx.from.id;
            const lessonName = lesson.name;

            logVisit(userId, lessonName);

            ctx.reply(`You selected the option: ${option}\nHere is the link: ${lesson.links[index]}`);
        });
    });
});

// Command to display visit log
bot.command('info', (ctx) => {
    const [, date, lesson] = ctx.message.text.split(' ');
    displayVisitLog(ctx, date, lesson);
});

// Start the bot
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))



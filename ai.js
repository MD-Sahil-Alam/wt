
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const OpenAI = require('openai');
require('dotenv').config();



const whatsapp = new Client({
    authStrategy: new LocalAuth(),
});

whatsapp.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

whatsapp.on('message', async (msg) => {

    if (msg.body.charAt(0) === '/' ) {
        msg.reply("Please wait...");
        try {
            let query = msg.body.substring(1);
            const apiKey = process.env.OPENAI_KEY;
            const openai = new OpenAI({ apiKey });
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: " you are healping assistant you can answer every type questions but for any islamic religious questions provide answer from quran and hadith with detail source info" },
                    { role: "user", content: `${query}` },
                ],
                model: "gpt-3.5-turbo",
            });

            const chatId = msg.from;
           await whatsapp.sendMessage(chatId, completion.choices[0].message.content);
            console.log(`Message sent successfully! to ${chatId}`);
        } catch (error) {
            console.error('An error occurred:', error);
            msg.reply("Sorry, something went wrong 🫤. Please try again");
        }
    }
});

whatsapp.on('ready', () => {
    console.log('WhatsApp client is ready!');
});

whatsapp.initialize();

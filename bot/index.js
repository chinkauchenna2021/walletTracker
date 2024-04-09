const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios')
const cors = require('cors')
require('dotenv').config()

const token = process.env.YOUR_TELEGRAM_BOT_TOKEN; // Replace with your own bot token
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (messageText === '/start') {
    bot.sendMessage(chatId, `
    👋 Welcome to our Wallet Address AI Telegram Bot!

    🤖 We're thrilled to have you on board! Our bot is here to assist you in exploring the balances of your wallet address across various networks like Ethereum (ETH), Binance Smart Chain (BSC), Polygon, and more. Additionally, it can provide insights into transactions performed using your wallet address. 📊💰
    
    🔍 To get started, simply provide your wallet address, and our bot will fetch the latest information regarding your holdings and recent transactions. Whether you're a crypto enthusiast, investor, or trader, our bot aims to streamline your experience and keep you updated on your assets' status. 💼💸
    
    💡 Need assistance or have questions? Feel free to reach out to us anytime. We're here to make your journey in the crypto world as seamless as possible! 🚀💬
    
    🔒 Rest assured, your privacy and security are of utmost importance to us. Your wallet address information will be handled with the utmost care and confidentiality. We're committed to ensuring a safe and secure environment for all our users. 🛡️🔐
    
    🌟 Thank you for choosing our Wallet Address AI Telegram Bot. Let's embark on this exciting crypto adventure together! Happy exploring! 🎉💎
      
    Enter /start to start the bot and /getAddress to enter and get the details of a wallet address.
    `);
  }
});


bot.onText(/\/getAddress/, async msg => {
    const chatId = msg.chat.id;

    // Send a message asking for input
    bot.sendMessage(chatId, 'Please enter your Wallet Address :');

    // Listen for the user's response
  
    bot.once('message', async (responseMsg) => {
        try{
            const userResponse = responseMsg.text;
            // Process the user's input (here, we'll just echo it back)
            // Make the POST request using Axios
            const requestData = {address:userResponse}
    
            if (userResponse.startsWith('0x')) {
                bot.sendMessage(chatId,"This might take a little while...")
               const res= await axios.post(String(process.env.BOT_SERVER_URL), requestData)

               const realData = await res.data;
               bot.sendMessage(chatId, `💰💰 Native Token balances and Transactions for wallet address ${userResponse} 💰💰.
               ETH , BSC , MATIC Balances :

               💰 Eth:\t ${ (Number(realData?.tokenBalance?.ethBalance.balance)/1e18  > 0)? Number(realData?.tokenBalance?.ethBalance?.balance)/1e18+" ETH"  : "0 ETH" }

               💰 BSC:\t ${ (Number(realData?.tokenBalance?.bscBalance.balance)/1e18  > 0)? Number(realData?.tokenBalance?.bscBalance?.balance)/1e18+" BSC"  : "0 BSC" }

               💰 MATIC:\t ${ (Number(realData?.tokenBalance?.polygonBalance.balance)/1e18  > 0)? Number(realData?.tokenBalance?.polygonBalance?.balance)/1e18+" MATIC"  : "0 MATIC" }
                \n\n
               Wallet Transactions :
             ${ await getTnxData(realData)} 

             🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

                `);

            } else {
                bot.sendMessage(chatId,'Input is not valid. It should start with "0x".');
            }
        }catch(err){
            console.log("error occured " , err)
        }


    });
});

async function getTnxData(realData){
    let output = ''; // Initialize an empty string to store the output

    realData?.response?.active_chains.forEach((item, index) => {
        const chain = item.chain;
        const chain_id = item.chain_id;
        const block_number = item.first_transaction.block_number;
        const block_timestamp = item.first_transaction.block_timestamp;
        const transaction_hash = item.first_transaction.transaction_hash;

        // Concatenate the values for the current item with its corresponding text
        output += `Tnx ${index + 1} \n Chain: \t ${chain} \t\t Chain ID: \t ${chain_id}  \t\t Block Number:\t ${block_number} \t\t Block Timestamp: \t ${block_timestamp} \t\t Transaction Hash: \t ${transaction_hash}\n\n`;
    });

    // Check if any data was found
    if (!output) {
        return 'No transaction data available.';
    }

    return output;
}

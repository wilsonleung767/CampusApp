// const OpenAI = require("openai");
// const apiKey = process.env.REACT_APP_CHATGPT_API_KEY;

// const openai = new OpenAI({apiKey : apiKey , dangerouslyAllowBrowser: true});


// async function getNLPResult(userInput) {
//     try{
//         const keyPhrase = await extractKeyPhrase(userInput);
//         console.log(keyPhrase); // This should output something like "nearest toilet"
//         return keyPhrase
//     }
//     catch(error){
//         console.log(error)
//     }
// };
// export default getNLPResult;


// // Dummy function to simulate extracting a key phrase from the conversation
// async function extractKeyPhrase(userInput) {
//     const response = await  openai.completions.create({
//         model: "gpt-3.5-turbo",
//         prompt: `Extract a simple key phrase representing a location-based service from the following user input: "${userInput}"\n\nKey Phrase:`,
//         max_tokens: 10,
//         temperature: 0.3,
//     });

//     return response.choices[0].text.trim();
// }



import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

// OPENAI API SETUP
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
// console.log(process.env.OPENAI_API_KEY);
const openapi = new OpenAIApi(configuration);
const lport = process.env.PORT;
// SERVER
const app = express();
//  middlewares
app.use(cors());
app.use(express.json());

// routes handling

app.get('/', async (req, res) => {
	res.send({
		message: 'Hello world',
	});
});

app.post('/', async (req, res) => {
	try {
		const prom = req.body.prompt;
		const response = await openapi.createCompletion({
			model: 'text-davinci-003',
			prompt: `${prom}`,
			temperature: 0, // Higher values means the model will take more risks.
			max_tokens: 3000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
			top_p: 1, // alternative to sampling with temperature, called nucleus sampling
			frequency_penalty: 0.5, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
			presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
		});

		res.send({
			bot: response.data.choices[0].text,
			// bot: response.data.choices[0].text,
		});
	} catch (error) {
		console.log(error);
		res.status(500).send(error || 'Something went wrong');
	}
});

app.listen(lport, () =>
	console.log(`AI server started on http://localhost:${lport}`)
);

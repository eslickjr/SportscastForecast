import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response } from 'express';
import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
//import { z } from "zod";
import { StructuredOutputParser } from 'langchain/output_parsers';

dotenv.config();

const port = process.env.PORT || 3001;
const apiKey = process.env.OPENAI_API_KEY;

// Check if the API key is defined
if (!apiKey) {
  console.error('OPENAI_API_KEY is not defined. Exiting...');
  process.exit(1);
}

const app = express();
app.use(express.json());

// TODO: Initialize the OpenAI model
const openAI = new OpenAI({
  apiKey: apiKey,
  modelName: "gpt-3.5-turbo",
  temperature: 0.5,
});

// TODO: Define the parser for the structured output
const parser = StructuredOutputParser.fromNamesAndDescriptions({
  Introduction: "The introduction for the weather forecast",
  Day1: "Day 1 of the weather forecast",
  Day2: "Day 2 of the weather forecast",
  Day3: "Day 3 of the weather forecast",
  Day4: "Day 4 of the weather forecast",
  Day5: "Day 5 of the weather forecast",
  Conclusion: "That's the weather forecast for {location}."
})

// TODO: Get the format instructions from the parser
const formatInstructions = parser.getFormatInstructions();

// TODO: Define the prompt template
const promptTemplate = new PromptTemplate({
  template: "You are a sports announcer presenting the five day weather forecast for {location}. {format_Instructions}",
  inputVariables: ["location"],
  partialVariables: { format_Instructions: formatInstructions }
})

console.log(promptTemplate);

// Create a prompt function that takes the user input and passes it through the call method
const promptFunc = async (input: string) => {
        // TODO: Format the prompt with the user input
        // TODO: Call the model with the formatted prompt
        // TODO: return the JSON response
        // TODO: Catch any errors and log them to the console
        const promptInput = await promptTemplate.format({ location: input });

       try {
        let response = await openAI.invoke(promptInput);
        
        response = response.replace("```json\n", "");
        response = response.replace("```", "");
        console.log(response);
        return response;
      } catch (error) {
        console.error(error);
        throw error;
      }
};

// Endpoint to handle request
app.post('/forecast', async (req: Request, res: Response): Promise<void> => {
  try {
    const location: string = req.body.location;
    if (!location) {
      res.status(400).json({
        error: 'Please provide a location in the request body.',
      });
    }
    const result: any = await promptFunc(location);

    console.log(JSON.stringify(result));
    res.json({result});
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

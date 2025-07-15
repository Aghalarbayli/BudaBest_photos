import { writeFile } from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

const origin = process.env.ALLOWED_ORIGIN;

const headersContent = `
/*
  Access-Control-Allow-Origin: ${origin}
  Access-Control-Allow-Methods: GET, OPTIONS
  Access-Control-Allow-Headers: *
`;

await writeFile('._headers', headersContent);
console.log(`✅ _headers file generated with origin: ${origin}`);

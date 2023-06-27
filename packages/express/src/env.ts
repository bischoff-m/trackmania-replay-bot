/*
This file is preloaded using "node -r <path>" (package.json) to set up dotenv
with the path to the global .env file.
Explanation why this file needs to be preloaded: 
https://www.npmjs.com/package/dotenv#how-do-i-use-dotenv-with-import

Useful stuff:
https://nodejs.org/api/cli.html#-r---require-module
https://github.com/motdotla/dotenv/issues/133#issuecomment-255298822

Alternative solution:
node -r ts-node/register -r dotenv/config src/index.ts dotenv_config_path=../../.env
*/
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '../../.env') })

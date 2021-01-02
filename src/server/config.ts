import dotenv from 'dotenv';
import findUp from 'find-up';
import path from 'path';
import fs from 'fs';

const IS_DEV = process.env.NODE_ENV !== 'production';

if (IS_DEV) {
  dotenv.config({ path: findUp.sync('.env') });
}

const packageJsonPath = path.join(process.cwd(), 'package.json');
const rawPackageJson = fs.readFileSync(packageJsonPath).toString();
const PackageJson = JSON.parse(rawPackageJson);
const { version: VERSION } = PackageJson;

// server
const SERVER_PORT = process.env.PORT || 3000;
const WEBPACK_PORT = 8085; // For dev environment only
const POSTGRES_URL = process.env.DATABASE_URL;

const COGNITO_URL = IS_DEV
  ? 'http://localhost:9229/'
  : 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_G18pbuB1j';
export { IS_DEV, VERSION, SERVER_PORT, WEBPACK_PORT, POSTGRES_URL, COGNITO_URL };

import fs from 'fs';

const LOG_FILE = './logfile.txt';

export default async function appLog(data: string) {
    let dataString = `${new Date()}\n[*] ${data}\n`;
    fs.appendFile(LOG_FILE, dataString, () => {});
}
const processGame = require('./process_game')

const pg = fname => {
    console.log(fname)
    const data = JSON.parse(require('fs').readFileSync(fname));
    const table = processGame(data).map(x => x.join(',')).join('\n') + '\n'
    // console.log(table);
    // console.log(table.map(x => x.join(',')).join('\n'));
    const csvFname = fname.replace(/^data/, 'csv').replace(/json$/, 'csv');
    require('fs').writeFileSync(csvFname, table, 'utf8');
}

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.prompt();

rl.on('line', function(line) {
    switch(line.trim()) {
        case '':
            break;
        default:
            pg(line);
            return;
        break;
    }
    rl.prompt();
}).on('close', function() {
    process.exit(0);
});


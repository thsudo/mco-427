import inquirer from 'inquirer';
import chalk from 'chalk';
import { personas, algorithm_assumptions } from './js/algorithm.js';
import { content as c } from './js/internet.js';

// shuffle content so it's not the same handful of articles being found each time
// from here: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
const content = c
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)

// global variables being set during gameplay
let player; 
let all_interests = new Set();
let all_interests_array = [];
let related_interests = new Set();
let history = [];
let history_set = new Set();
let currentOptions = [];

// properly format names
const names = {
    taylor_swift: "Taylor Swift",
    travis_kelce: "Travis Kelce",
    sabrina_carpenter: "Sabrina Carpenter",
    chappell_roan: "Chappell Roan",
    lebron_james: "Lebron James"
}

// randomly select an interest to find content on
function selectInterest() {
    let interests = [];

    // get 2 content types and 2 interests for the user
    for (let i = 0; i < 2; i++) {
        let interest = all_interests_array[randomize(all_interests_array)]
        interests.push(interest);
    }
    return interests;
}

function randomize(list) {
    return Math.floor(Math.random() * list.length);
}

// format interest to remove any _, capital names, etc
function format(interest) {
    if (Object.keys(names).includes(interest)) {
        return names[interest];
    }
    let formattedString = '';
    let temp = interest.split('_');
    if (temp.length === 1) {
        return temp[0];
    }
    for (let i = 0; i < temp.length; i++) {
        formattedString += temp[i];
        if (i === 0) {
            formattedString += ' '
        }
    }
    return formattedString;
}

// format list into plain language format
function formatList(array) {
    let list = '';
    for (let i = 0; i < array.length; i++) {
        if (i !== 0 && array.length !== 2) {
            list += ','
        }
        if (i === array.length - 1) {
            list += ' and'
        }
        list += ' ' + format(array[i]);
    }
    return list;
}

// update global records
function updateRecords(answer, options) {
    let selected = options.find((option) => option.headline === answer);
    history.push(selected);
    if (!history_set.has(selected.headline)) {
        history_set.add(selected.headline);
    }
    selected['tags'].forEach(tag => all_interests.add(tag));
}

// grab 2 pieces of content to choose from
function grabChoices(interestList) {
    let twoPosts = [];
    let selected = new Set();
    for (let i = 0; i < 2; i++) {
        content.forEach((c) => {
            if (c['tags'].includes(interestList[i]) && twoPosts.length < 2) {
                // make sure the same piece of content isn't chosen twice
                if (!selected.has(c.headline)) {
                    selected.add(c.headline);
                    twoPosts.push(c);
                }
            }
        });
    }
    return twoPosts;
}

function updateInterests(demographicInfo) {
    let assumptions = [];
    if (demographicInfo === 'male' || demographicInfo === 'female') {
        const genderObject = algorithm_assumptions['gender'];
        assumptions = genderObject[demographicInfo]; 
    } else if (typeof demographicInfo === "number") {
        const ageObject = algorithm_assumptions['age'];
        assumptions = ageObject[demographicInfo];
    } else {
        assumptions = algorithm_assumptions[demographicInfo];
    }
    assumptions.forEach((interest) => {
        if (!related_interests.has(interest)) {
            related_interests.add(interest)
        }
        if (!all_interests.has(interest)) {
            all_interests.add(interest);
            all_interests_array.push(interest);
        }
    });
}

// format readout of interests
function formatFinalReadOut() {

    console.info(`By the end of the game, the algorithm associated you with`, `${chalk.bold(`${all_interests.size}`)} unique interests. This is the list:`);
    for (let value of all_interests) {
        console.log(`   • ${format(value)}`);
    }

    console.info(`${chalk.bold('Below is more information on how this list was determined.')}`);
    console.log();

    let primaryInterestAssumptions = algorithm_assumptions[player.primary_interest];
    let list = '';
    for (let i = 0; i < primaryInterestAssumptions.length; i++) {
        if (i !== 0) {
            list += ', '
        }
        list += format(primaryInterestAssumptions[i]);
    }
    console.info(`Based on your interest in`, `${chalk.bold.magenta(format(player.primary_interest))},`, `the algorithm assumed you were also interested in:`, `${chalk.bold.magenta(`${formatList(primaryInterestAssumptions)}`)}.`);
    console.log();

    let ageObj = algorithm_assumptions['age'];
    const interestsByAge = ageObj[player.age];
    console.info(`Based on your`, `${chalk.bold.green('age')},`, `the algorithm assumed you were interested in:`, `${chalk.bold.green(`${formatList(interestsByAge)}`)}.`);
    console.log();

    let genderObj = algorithm_assumptions['gender'];
    const interestsByGender = genderObj[player.gender];
    console.info(`Based on your`, `${chalk.bold.blue('gender')},`, `the algorithm assumed you were interested in:`,  `${chalk.bold.blue(`${formatList(interestsByGender)}`)}.`);
    console.log();
    
    console.info(`Here's more info on your interests based by your selections: `);
    let first = history[0];
    console.info(`   • "${chalk.bold.yellow(first.headline)}",`, `was associated with:`, `${chalk.bold.yellow(`${formatList(first.tags)}`)}.`);
    let second = history[1];
    console.info(`   • "${chalk.bold.cyan(second.headline)}",`, `was associated with:`, `${chalk.bold.cyan(`${formatList(second.tags)}`)}.`);
    let last = history[2];
    console.info(`   • "${chalk.bold.red(last.headline)}",`, `was associated with:`, `${chalk.bold.red(`${formatList(last.tags)}`)}.`);
}

// play the game
async function playGame() {
    const interests1 = await inquirer.prompt([
        {
            type: 'list',
            name: 'persona',
            message: 'Choose your persona',
            choices: Object.keys(personas)
        },
    ]).then(selection => {
            player = personas[selection.persona];
            console.info('Hello,', chalk.bold(`${player.name}`), `. Thanks for playing. Here's what we know about you so far...`);
            console.info('You live in', chalk.bold(`${player.location}`), 'are', chalk.bold(`${player.age} years old,`), 'and enjoy', chalk.bold(`${format(player['primary_interest'])}.`));
            // add primary interests
            let primaryInterest = player.primary_interest;
            all_interests.add(primaryInterest);
            all_interests_array.push(primaryInterest);
            updateInterests(primaryInterest);

            // add related interests based on demographic info
            let playerGender = player.gender;
            let playerAge = player.age
            
            updateInterests(playerGender);
            updateInterests(playerAge);

            return selectInterest();
    });

    // get options to display to user
    currentOptions = grabChoices(interests1);

    const interests2 = await inquirer.prompt([
        {
            type: 'list',
            name: 'first-answer',
            message: 'Recommended content. Pick one.',
            choices: currentOptions.map(option => option.headline)
        }
    ]).then((selection) => {
        updateRecords(selection['first-answer'], currentOptions);
        return selectInterest();
    });

    currentOptions = grabChoices(interests2);

    const interests3 = await inquirer.prompt([
        {
            type: 'list',
            name: 'second-answer',
            message: 'Recommended content. Pick one.',
            choices: currentOptions.map(option => option.headline)
        }
    ]).then((selection) => {
        updateRecords(selection['second-answer'], currentOptions);
        return selectInterest();
    });

    currentOptions = grabChoices(interests3);

    // final step
    await inquirer.prompt([
        {
            type: 'list',
            name: 'final-answer',
            message: 'Recommended content. Pick one.',
            choices: currentOptions.map(option => option.headline)
        }
    ]).then((selection) => {
        updateRecords(selection['final-answer'], currentOptions);
        formatFinalReadOut();
        return;
    });
}

playGame();

import { Debug } from "../../shared/shared"

const badWords = [
	"[/]\\[/]",
	"[/]\\[/]lg",
	"[|]\\[|]ig",
	"[|]\\[|]lg",
	"[|]\\[|]lg",
	"abort",
	"aggit",
	"aggot",
	"agot",
	"alah",
	"alla",
	"allah",
	"anal",
	"anus",
	"arab",
	"arouse",
	"bang",
	"beastiality",
	"beatoff",
	"biatch",
	"bish",
	"bitch",
	"b[i|l]ack",
	"blowm",
	"blowu",
	"blowy",
	"bomb",
	"bondage",
	"camel",
	"camle",
	"carpetmuncher",
	"cherrypopper",
	"child",
	"children",
	"china",
	"chinaman",
	"chinamen",
	"chink",
	"choad",
	"chode",
	"christ",
	"cksass",
	"clit",
	"clitoris",
	"cocaine",
	"cock",
	"cocksuc",
	"commie",
	"communist",
	"commy",
	"conservatism",
	"conservative",
	"coon",
	"coondog",
	"crack",
	"crack",
	"creampie",
	"cum",
	"cumm",
	"cunt",
	"dami",
	"damm",
	"damn",
	"darkie",
	"darky",
	"dawm",
	"democr",
	"dick",
	"diddle",
	"didle",
	"dike",
	"dildo",
	"dingle",
	"dipshit",
	"diseas",
	"doggie",
	"doggy",
	"dong",
	"dragqu",
	"dragqw",
	"drug",
	"dyke",
	"ejaculat",
	"enema",
	"erec",
	"escort",
	"ethiop",
	"ethni",
	"execut",
	"fag",
	"fairi",
	"fairy",
	"feg",
	"feg",
	"fetis",
	"finger",
	"fist",
	"flash",
	"fok",
	"fondl",
	"fores",
	"foresk",
	"forna",
	"forni",
	"forsk",
	"foursom",
	"foursum",
	"fourway",
	"fuc",
	"fuck",
	"fudgepa",
	"fudgepe",
	"fugepa",
	"fugl",
	"fuk",
	"fungu",
	"gang",
	"gay",
	"genita",
	"gey",
	"gga",
	"gger",
	"girl",
	"goldenshow",
	"gonor",
	"gook",
	"gringo",
	"grl",
	"gyp",
	"gypp",
	"hamas",
	"handie",
	"handjo",
	"handy",
	"heroi",
	"herpe",
	"hijac",
	"hillbil",
	"hitler",
	"hiv",
	"hoe",
	"hoes",
	"homo",
	"honk",
	"hooke",
	"hoote",
	"hore",
	"horn",
	"hors",
	"horse",
	"hostag",
	"hymen",
	"[i|l]ga",
	"iger",
	"[i|l]gg",
	"igga",
	"iglet",
	"iglit",
	"incest",
	"insest",
	"intercor",
	"intercour",
	"isreal",
	"jackit",
	"jackme",
	"jacko",
	"jackoff",
	"jacks",
	"jap",
	"japan",
	"jerkme",
	"jerkoff",
	"jew",
	"jiha",
	"jiz",
	"jockey",
	"jocky",
	"joint",
	"kid",
	"kiddy",
	"kiger",
	"kike",
	"killy",
	"kink",
	"kkk",
	"kneg",
	"knig",
	"knob",
	"knocke",
	"koc",
	"kock",
	"kond",
	"koon",
	"kum",
	"kunt",
	"lesb",
	"lezb",
	"liberal",
	"libral",
	"loli",
	"lsd",
	"lube",
	"lynch",
	"masta",
	"maste",
	"mastu",
	"meat",
	"meth",
	"mexi",
	"mgar",
	"mger",
	"mgg",
	"middleeast",
	"mideast",
	"milf",
	"minori",
	"minors",
	"mofo",
	"moles",
	"moneysh",
	"monk",
	"mosle",
	"mosli",
	"mothaf",
	"motherf",
	"motherl",
	"muf",
	"murder",
	"musle",
	"musli",
	"myass",
	"myskirt",
	"mytits",
	"naz",
	"necr",
	"nig",
	"nlg",
	"obama",
	"oral",
	"orgas",
	"orgy",
	"osama",
	"paki",
	"palesi",
	"palest",
	"panti",
	"panty",
	"pearl",
	"pecker",
	"pee",
	"peeh",
	"peeo",
	"peep",
	"penetr",
	"peni",
	"perv",
	"phuc",
	"phuk",
	"phuq",
	"piss",
	"pistol",
	"polac",
	"poon",
	"poop",
	"pooper",
	"popyou",
	"porchmonk",
	"porn",
	"prost",
	"pus",
	"queer",
	"qweer",
	"qwer",
	"rabbi",
	"race",
	"raci",
	"radi",
	"ragh",
	"rape",
	"raper",
	"rapis",
	"rcherry",
	"reare",
	"rednec",
	"reefer",
	"refug",
	"republica",
	"ribbed",
	"rim",
	"sadis",
	"sadom",
	"sandm",
	"sandn",
	"schlo",
	"scrot",
	"seme",
	"serva",
	"sex",
	"shag",
	"shat",
	"shit",
	"shoot",
	"sissy",
	"sixtyni",
	"skank",
	"skinflu",
	"slante",
	"slav",
	"slut",
	"smut",
	"sodom",
	"spankit",
	"spankthe",
	"sperm",
	"spic",
	"spig",
	"spitt",
	"sploge",
	"sploog",
	"spook",
	"spreadea",
	"spreadyo",
	"spunk",
	"stiffy",
	"stify",
	"strapon",
	"strok",
	"sucka",
	"suckm",
	"suicide",
	"swallow",
	"swalow",
	"swast",
	"syphi",
	"tabo",
	"tang",
	"tard",
	"teen",
	"terror",
	"teste",
	"theirass",
	"thereass",
	"thirdleg",
	"threesom",
	"threeway",
	"titties",
	"titty",
	"tnt",
	"tongue",
	"tortur",
	"towelhe",
	"tramp",
	"trann",
	"transves",
	"trany",
	"trump",
	"tunnel",
	"turd",
	"twat",
	"twink",
	"upmy",
	"upskirt",
	"uptheass",
	"upyour",
	"urin",
	"usama",
	"utere",
	"uteri",
	"uteru",
	"vagin",
	"vegin",
	"vibra",
	"viet",
	"violen",
	"virgin",
	"vulv",
	"wank",
	"weane",
	"weani",
	"weany",
	"weapon",
	"weed",
	"weeni",
	"weeny",
	"welfa",
	"wetb",
	"wetsp",
	"whig",
	"whites",
	"whitetra",
	"whitey",
	"whore",
	"wigg",
	"willi",
	"willy",
	"wood",
	"xxx",
	"yank",
	"yourskirt",
	"yourtits",
]

const mapL33tChars = {
	"!": "i",
	1: "i",
	2: "r",
	"@": "a",
	3: "e",
	4: "a",
	$: "s",
	5: "s",
	7: "l",
	"&": "a",
	0: "o",
	"|": "i",
}

const debug = new Debug("Profanity filter", true)

function replaceL33tChars(str) {
	let s = str.split("")
	for (let i = 0; i < str.length; i++) {
		if (mapL33tChars[str[i]]) s[i] = mapL33tChars[str[i]]
	}
	return s.join("")
}

function isValidText(str) {
	const notEnglish = /[^ -~|\s]/gm
	if (notEnglish.test(str))
		return {
			isValidText: false,
			error: "Text is not English or contains accented characters.",
		}

	const noL33t = replaceL33tChars(str)
	const alphabetOnly = noL33t.replace(/[^a-z]/gim, "")

	const res = { isValidText: true }
	badWords.some((badWord) => {
		const bwRegex = new RegExp(`${badWord}`, "gmi")
		const isProfane = bwRegex.test(alphabetOnly)
		if (isProfane) {
			debug.log(`String input: ${str}\n\tis profane due to matching: ${badWord}`)
			res.isValidText = false
			res.error = "Text contains or has the potential to contain offensive language."
		}
		return isProfane
	})
	return res
}

const filter = {
	isValidText,
}

export default filter

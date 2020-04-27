const wordPos = require("wordpos");
const stemmer = require('stemmer');
var pluralize = require('pluralize');
const mysql = require('mysql');
const con = require('./dbConnect');
const bodyparser = require('body-parser');
const wordpos = new wordPos();
let str = "find the names roll_no of student having marks between 40 and 70";
const express = require('express')
const app = express();


let allTableCol = new Map(); // all table cols name 
let allTable = []; 			// all tales name


app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
})

app.post('/test', (req, res) => {
	// console.log(req.body)
	if (req.body.inputText) {
		str = req.body.inputText;
		res.end();
	}
	else {
		res.send("error");
	}
})


inputBreakdown(str);
// function prints noun verb .... from the input string
function inputBreakdown(inputStr) {
	wordpos.getNouns(inputStr).then(res => {
		console.log("Nouns: " + res);
	});
	wordpos.getVerbs(inputStr).then(result => {
		console.log("Verbs: " + result);
	});
	wordpos.getAdverbs(inputStr).then(res => {
		console.log("Adverbs: " + res);
	});
	wordpos.getAdjectives(inputStr).then(res => {
		console.log("Adjectives: " + res);
	});

}


let words = str.toLowerCase().split(" ");

var final_query;
var table_query = " from ";
var attributes_query;
var Initial_query;


deleteUnnecessary();

clauseIdentification();

console.log("Stemmers: " + stemmer(words));


break_words = ["in", "for", "at", "whose", "having", "where", "have", "who", "that", "with", "by", "under", "from", "all"];

Array.prototype.diff = function (arr2) {
	var ret = [];
	this.sort();
	arr2.sort();
	for (var i = 0; i < this.length; i += 1) {
		if (arr2.indexOf(this[i]) > -1) {
			ret.push(this[i]);
		}
	}
	return ret;
};

console.log("break_words: " + words.diff(break_words));



var rel_op_dict = { "greater": ">", "more": ">", "less": "<", "greater equal": ">=", "less equal": "<=", "equal": "=", "": "=", "except": "!=", "not": "!=" };

for (var i = 0; i < words.length; i++) {
	for (var key in rel_op_dict) {
		if (words[i] == key) {
			console.log("relative clause:" + rel_op_dict[key]);
		}
	}
}


var order_by_dict = { "ordered": "ASC", "sorted": "ASC", "alphabetical": "ASC", "alphabetically": "ASC", "increasing": "ASC", "decreasing": "DESC", "ascending": "ASC", "descending": "DESC", "reverse": "DESC", "alphabetic": "ASC" };

for (var i = 0; i < words.length; i++) {
	for (var key in order_by_dict) {
		if (words[i] == key) {
			console.log("ordered clause:" + order_by_dict[key]);
		}
	}
}


var aggregate_of_dict = { "number": "COUNT", "count": "COUNT", "total": "SUM", "sum": "SUM", "average": "AVG", "mean": "AVG" };

for (var i = 0; i < words.length; i++) {
	for (var key in aggregate_of_dict) {
		if (words[i] == key) {
			console.log("Aggregate clause:" + aggregate_of_dict[key]);
		}
	}
}


var aggregate_dict = { "maximum": "MAX", "highest": "MAX", "minimum": "MIN", "most": "MAX", "least": "MIN", "lowest": "MIN", "largest": "MAX", "smallest": "MIN" };

for (var i = 0; i < words.length; i++) {
	for (var key in aggregate_dict) {
		if (words[i] == key) {
			console.log("Aggreg clause:" + aggregate_dict[key]);
		}
	}
}


var limit_dict = { "maximum": "DESC", "highest": "DESC", "minimum": "ASC", "most": "DESC", "least": "ASC", "lowest": "ASC", "largest": "DESC", "smallest": "ASC" };

for (var i = 0; i < words.length; i++) {
	for (var key in limit_dict) {
		if (words[i] == key) {
			console.log("Limit clause:" + limit_dict[key]);
		}
	}
}


var limit_word_dict = { "first": 1, "second": 2, "third": 3, "fourth": 4, "fifth": 5, "sixth": 6, "seventh": 7, "eighth": 8, "ninth": 9, "tenth": 10 };

for (var i = 0; i < words.length; i++) {
	for (var key in limit_word_dict) {
		if (words[i] == key) {
			console.log("relative clause:" + limit_word_dict[key]);
		}
	}
}


var escape_array = ["find", "select", "publish", "print", "who", "where", "which", "what", "give", "list", "i", "we", "show"];
var insert_array = ["insert", "put"];
var update_array = ["update", "edit", "set", "change"];
var delete_array = ["delete", "remove"];

var insert_type = words.diff(insert_array);
var update_type = words.diff(update_array);
var delete_type = words.diff(delete_array);
var select_type = words.diff(escape_array);

var query_type;

if (insert_type.length > 0 || update_type.length > 0 || select_type > 0)
	query_type = "DDL";
else{
	query_type = "DML";
	Initial_query = "Select ";
	console.log("Initial query is " + Initial_query);
}

console.log("Type of query: " + query_type);
// console.log(words);



// ============================================= DB CONNECTION AND ALL TABLE INFO RETERIVE ===========================================

const objectifyRawPacket = row => ({ ...row });

con.promise().query("SHOW DATABASES")
	.then(([rows, fields]) => {
		// console.log(rows)
		rows = rows.map(objectifyRawPacket);
		getDatabaseInfo(rows).then(() => {
			// console.log('hmm')
		});
	})
	.catch((err) => console.log(err));

function runQuery(dbname) {
	return new Promise((resolve, reject) => {
		con.promise().query(`select TABLE_NAME , COLUMN_NAME from information_schema.columns where table_schema = '${dbname}' order by table_name,ordinal_position`)
			.then(([rows, fields]) => {
				rows = rows.map(objectifyRawPacket);
				resolve(rows);
			})
			.catch((err) => console.log(err));
	})
}


// Helper function for formatting the data recived from MYSQL DB
function modifyDataFormate(database_data) {
	database_data.forEach(element => {
		let temp = [];
		let tname;
		element.forEach(i => {
			tname = i.TABLE_NAME;
			temp.push(i.COLUMN_NAME);
		})
		if (tname) {
			allTable.push(tname);
			allTableCol.set(tname, temp);
			// console.log(allTableCol);
		}
	});
}
async function getDatabaseInfo(database) {
	let database_data = [];
	for (const iterator of database) {
		let x = await runQuery(iterator.Database);
		// console.log(typeof (x));
		x = JSON.stringify(x);
		x = JSON.parse(x);
		database_data.push(x);
	}
	modifyDataFormate(database_data);
	con.end();
}

// ============================================= DB CONNECTION END ===========================================



app.listen(4000, () => {
	console.log('server running at 4000...')
})








function deleteUnnecessary(){
	del_words = ["a","an","the","select","find","which","is","of","with","to","for","are","what"];
	
	words = words.filter( function( el ) {
		return !del_words.includes( el );
	});

	console.log("Words remaining: " + words);

}


function singularpluralCorrection() {
	for (var i = 0; i < words.length; i++) {
		console.log("Plural: " + pluralize(words[i]));
	}

	for (var i = 0; i < words.length; i++) {
		console.log("Singular:" + pluralize.singular(words[i]));
	}
}





function databaseAndTableIndentification(){
	let db = "Janvi & Jaadu";
	let table_name = "students";

	console.log("This is hello world");

	if(words.includes(db))
		console.log("databse is " + db);

	if(words.includes(table_name)) {
		console.log("Table is " + db);
		table_query = table_query.concat(table_name);
		console.log("Table query is " + table_query);
	}
}





function attributeIdentication(){
	attributes = ["names", "roll_no","age","marks"];
	attributesMatched = words.diff(attributes);
	console.log("Attributes: " + attributesMatched);
	attributes_query = attributesMatched;
	console.log("Attributes query is " + attributes_query);
}


function integerIdentifcation() { 
	for (var i = 0; i < words.length; i++) {
		console.log("Integers found are: " + words[i].match(/(\d+)/));  
	}
} 



function clauseIdentification() {
	var num = words.indexOf("having");
	words[num] = "where";
	final_query = "where";
	for (var i = num + 1; i < words.length; i++) {
		// console.log("wo" + words[i]);
		final_query = final_query.concat(" ", words[i]);
	}

	console.log("Clause query is: " + final_query);
}








deleteUnnecessary();
// clauseIdentification();
singularpluralCorrection();
databaseAndTableIndentification();
attributeIdentication();
integerIdentifcation();


console.log(Initial_query + attributes_query + table_query + final_query);

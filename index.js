var wordPos = require("wordpos");
var stemmer = require('stemmer');
var mysql = require('mysql');
var allTables = [];
const wordpos = new wordPos();
const dbconnection = require('./dbConnect');
var str = 'Find the student name where instructor name is ’Crick’ from bharat';

wordpos.getNouns(str).then(res => {
	console.log("Nouns: " + res);
});

wordpos.getVerbs(str).then(result => {
	console.log("Verbs: " + result);
});

wordpos.getAdverbs(str).then(res => {
	console.log("Adverbs: " + res);
});

wordpos.getAdjectives(str).then(res => {
	console.log("Adjectives: " + res);
});

var words = str.toLowerCase().split(" ");

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

var dtb = "";

const objectifyRawPacket = row => ({ ...row });

dbconnection.connect(function (err) {
	if (err) throw err;
	console.log("Connected!");
	dbconnection.query("SHOW DATABASES", (err, result) => {
		if (err) throw err;
		const databases = result.map(objectifyRawPacket);
		databases.forEach((db) => {
			let query = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE (TABLE_SCHEMA = '${db.Database}') ORDER BY TABLE_NAME`;
			dbconnection.query(query, (err, res) => {
				if (err) {
					console.log(err.message);
				}
				res = res.map(objectifyRawPacket);
				// console.log(db)
				res.forEach((table) => {
					let tempquery = `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = N'${table.TABLE_NAME}'`
					// console.log(table.TABLE_NAME);
					// allTables.courses[db.Database].push(table.TABLE_NAME);
					dbconnection.query(tempquery, (err, col) => {
						if (err)
							console.log(err)
						else {
							col =col.map(objectifyRawPacket);
							// console.log(r)
							// temp = {...temp ,r}
							col = JSON.stringify(col);
							// console.log(col)
							let x = { database: db.Database, table: table.TABLE_NAME, col};
							x = JSON.stringify(x);
							x = JSON.parse(x);
							// console.log(JSON.parse(x))
							allTables.push(x);
						}
					})
					// console.log(temp);
				})
			})
		})
	});
	setTimeout(()=>{
		console.log(allTables)
		console.log("db connection closed!")
		dbconnection.end();
	},5000)
});


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
else
	query_type = "DML";

console.log("Type of query: " + query_type);
	// console.log(words);

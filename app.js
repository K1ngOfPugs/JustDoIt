document.addEventListener("DOMContentLoaded", (event) => {
  autofillKey();
});
function toggleBox() {
	box = document.getElementById("apikey_box");
	if (box.hidden == false) {
		box.hidden = true;
	} else {
		box.hidden = false;
	}
}

function cleanUrl(url) {
	url = url.replace(/^https:\/\/emissary\.edgenuity\.com\//, "");
	url = url.replace(/\?.*$/, "");
	return url;
}

async function getText() {
	let url = document.getElementById("url_input").value;
	url = cleanUrl(url);

	let response = await fetch(url);
	let text = await response.text();

	let parser = new DOMParser();
	let doc = parser.parseFromString(text, "text/html");

	let element = doc.querySelector(".doc-container");

	try {
		return element.innerText;
	} catch {
		return "";
	}
	
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return "";
}


function autofillKey() {
	let apiKey = readCookie("apiKey");

	if (apiKey != "") {
		document.getElementById("apikey_input").value = apiKey;
	}
}

async function getResponse(prompt) {
	let apiKey = document.getElementById("apikey_input").value;

	let response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "gpt-3.5-turbo",
			messages: [{ role: "user", content: prompt }]
		})
	});

	let data = await response.json();
	
	return data.choices[0].message.content;
}

async function run() {
	let article;
	await getText().then(text => {article = text;});

	let question;
	question = document.getElementById("question_input").value;

	let prompt = "";

	if (article == "") {
		prompt = question;
	} else {
		prompt = prompt.concat("```", article, "```\nRead the above article. Then answer the question: ", question,  " Keep your answer short and concise.");
	}

	
	console.log(prompt)

	await getResponse(prompt).then(response => {output = response});

	document.getElementById("output").innerHTML = output;
}

function setCookie() {
	let value = document.getElementById("apikey_input").value;

	document.cookie = "apiKey=" + value + ";path=/";
}
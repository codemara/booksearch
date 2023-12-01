	/* All the JavaScript is here */
	
	// Global variable to store the total of books finally displayed on the page
	var booksShown;
	
	/* 
	displayItem(item) -> Called from the JSON onload function in getDetails() 
	item: is an Object array extracted from JSON for 1 book to be displayed
	*/
	function displayItem(item){
		//txtHTML -> String to add to the HTML after all elements are added
		//first, the book cover, url and title
		var txtHTML = "<div class='book'>"+
					"<a href='" + item.url + "' target='_blank'>" +
					"<img width='100%' src='" + item.cover.large + "' /></a>"+
					"<div class='label'>"+
					"<h4>" + item.title + "</h4>"+
					"<strong>";
		
		//if many authors -> display Authors: else if only 1 -> Author:
		txtHTML += (item.authors.length>1) ? "Authors:&nbsp; " : "Author:&nbsp; ";
		txtHTML += "</strong>"
		//loops through the authors list to get each name with a comma between each that is not the last one
		for (x=0;x<item.authors.length;x++){
			txtHTML += item.authors[x].name;
			if (x != item.authors.length -1) txtHTML += ", "
		}

		//displays only 1 publisher, the first one
		txtHTML += "<br/><br/><strong>Publisher</strong>:&nbsp; " + 
						item.publishers[0].name + "<br/><br/>";
		
		txtHTML += "<strong>"
		//if many subjects -> display Subjects: else if only 1 -> Subject:	
		txtHTML += (item.subjects.length>1) ? "Subjects:&nbsp; " : "Subject:&nbsp; ";
		txtHTML += "</strong>"
		//loops through the subjects list with a maximum of 12 subjects
		for (x=0;x<item.subjects.length;x++){
			txtHTML +=  "<a href='" + item.subjects[x].url + "' target='_blank'>" + 
							item.subjects[x].name + "</a>&nbsp; ";
			if (x > 12) break;
		}
		
		txtHTML += "</div>";
		
		//insert the new HTML item <div> book at the beginning of the <div> books (container for flex boxes)
		document.querySelector("#books").insertAdjacentHTML("afterBegin", txtHTML);

		
		
	}
	
	/* 
	getDetails(itemISBN, last) -> Called from a loop in getISBN() 
	itemISBN: is a String with a specific ISBN number for one item
	last: is a boolean which indicates true when getISBN() has reached the last iteration of its loop
	*/
	function getDetails(itemISBN, last){
		console.log("PRE----last:"+last+", bookShown"+booksShown);
		//A fetch GET call to Open Library's API with the specific ISBN number added to the url
		fetch("https://openlibrary.org/api/books?jscmd=data&format=json&bibkeys=ISBN:" + itemISBN ,{
			method: "GET",
		 })
		 .then(response => response.json())
		 .then(function(json){
			//When the JSON object is returnded from the API it is stored in item 
			let item = json[Object.keys(json)[0]];
			
		        console.log("IN----last:"+last+", bookShown"+booksShown);
			//Tests if the returned object contains the desired values: title, cover, url, author, publisher and subject 
			if (Object.keys(json).length != 0  && item.title != null && item.cover != null && item.url != null && item.subjects != null && item.authors != null && item.publishers != null) {
				//Global variable bookShown is incremented
				booksShown++;
				//if the object is valid it is displayed in HTML
				
		                console.log("PRE-DISPLAY----last:"+last+", bookShown"+booksShown);
				displayItem(item);
			}
			 
			 if (last) {
				 
		console.log("INLAST----last:"+last+", bookShown"+booksShown);
			    if (booksShown % 3 > 0){
				//if true -> a number of hidden div (1 or 2) is added 
				//at the end of the flex container for a better look
				for (x = 0; x < (3 - (booksShown % 3)); x++)				
					document.querySelector("#books").insertAdjacentHTML("beforeend", "<div class='book' style='opacity:0;'></div>");
				}else if (booksShown === 0) {
				    alert("Couldn't find any book, try another search");   
				    console.log("IN-ALERT----last:"+last+", bookShown"+booksShown);
			    }
			}
			 
			console.log("OUT----last:"+last+", bookShown"+booksShown);
		 })
		
		 .catch(console.error);
		
	}

	/* 
	readISBN(xmlText) -> Called from the XML onload function in getISBN() 
	xmlText: is a String with a text in XML format returned from the API
	*/
	function readISBN(jsonObj){
			
		//arrISBN: will contain the selected ISBN Strings that will be displayed
		let arrISBN = [];
		
		//Loops through all the titles in the XML Object
		for (i = 0; i < jsonObj.data.results.length; i++) {
			let isbn = jsonObj.data.results[i].id
			let isbnSpt = isbn.split('-');
			
			arrISBN[i] = isbnSpt[isbnSpt.length-1];
	
		}

		//If no book were stored alerts the user for a different search
		if (arrISBN.length == 0) {
		 	alert("Can't find any book, please try another keyword");
		}else {
			console.log("ISBN:"+arrISBN);
			//Otherwise -> shows the 'Book List' title fade in animation
			if (document.querySelector("#booktitle").classList.contains('fade-out')){
				document.querySelector("#booktitle").classList.replace('fade-out', 'fade-in');
			}else document.querySelector("#booktitle").classList.add('fade-in');
			
			//And loops through arrISBN from the end to the beginning
			//Because items are pushed at the begining of the <div> books container
			//So this way they will be displayed in the right order
			for (i = arrISBN.length-1; i >=0 ; i--){
				if (i == 0) {
					console.log("i==0::"+arrISBN[i]);
					//Calls getDetails() with boolean true when it's the last iteration
					getDetails(arrISBN[i], true);
				}
				else{
					console.log("i!=0::"+arrISBN[i]);
					//Calls getDetails() with boolean false all the other times
					getDetails(arrISBN[i], false);
				}
							
			}
			
		}
		
	}


	
	/* 
	getISBN(keyword) -> Called from searchBooks() 
	keyword: is a String obtained from the user's input
	*/



	function getISBN(keyword){
	
		//GET Request for a JSON Object from Penguin Random House's API with the keyword (query q) from the user

		//A fetch GET call to Open Library's API with the specific ISBN number added to the url
		fetch("https://api.penguinrandomhouse.com/resources/v2/title/domains/PRH.US/search?rows=100&docType=isbn&api_key=x2w6xdemsxy79fujj6z53hbh&q=" + keyword ,{
			method: "GET",
		 })
		 .then(response => response.json())
		 .then(function(json){
			//When the JSON object is returned from the API it is stored in item 
			//Callback function when the json is received
			console.log(json);
			 readISBN(json);
			
			
		 })
		 .catch(console.error);
		
	}
	/*
	searchBooks() -> Called from the EventListener when the user submits an input value 
	*/
	function searchBooks(){
		
		//Resets the page's state for a new Search and the booksShown global variable
		//Deletes all previous books displayed in <div> books container, if any
		//Fades out the 'Book List' title if it was displayed
		booksShown = 0;
		document.getElementById("books").innerHTML = "";
		
		if (document.querySelector("#booktitle").classList.contains('fade-in')){
			document.querySelector("#booktitle").classList.replace('fade-in', 'fade-out');
		}
		
		//keyword: stores the String of the user's input
		let keyword = document.querySelector("#searchInput").value;
		
		//If the input is not empty launch the json request
		if (keyword != ""){
			
			getISBN(keyword);
			
		}else alert("Can't find any book, please enter a valid search");
		
	}
	
	/*
	init() -> Called from the body onload 
	*/
	function init(){
		//Adds 2 listeners for the user's input, one fired when Search button is pressed 
		//the other with 'Enter' key pressed when in the input Search box
		document.getElementById("searchBtn").addEventListener("click", searchBooks);
		document.getElementById("searchInput").addEventListener("search", searchBooks);

		//Hides the 'Book List' title before any search is made
		document.querySelector("#booktitle").style.opacity = 0;
	}

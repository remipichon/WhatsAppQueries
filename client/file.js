loadFileFromModal = function(event) {
	$( this ).off( event );

	if ($("#new-conversation-name").val() === "") {
		log.error("there is no conversation name");
		return;
	}

	var file = document.getElementById('fileToUpload').files[0];
	if (file) {
		// create reader
		var reader = new FileReader();
		reader.readAsText(file);
		reader.onload = function(e) {
			console.log("reader.onload");
			var content = e.target.result;
			var options = {
				conversationName: $("#new-conversation-name").val(),
				filename: $("#fileToUpload").val(),
				add: true,
				rows: content.split("\n")
			}
			parseFile(options);
		};

		reader.onabort = function() {
			alert("The upload was aborted.");
		};

		reader.onerror = function() {
			alert("An error occured while reading the file.");
		};
	}
}
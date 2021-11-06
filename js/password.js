function passwd(){
	var password = prompt('enter the password to download the file');
	if (password.toLowerCase() == "lear")
	{
		window.open("files/test.zip" )
	}
	else{
		alert("incorrect password");
	}
}
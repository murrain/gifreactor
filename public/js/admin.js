$("#login").on("submit", function(event){
	if (event.preventDefault) { event.preventDefault(event); } else { event.returnValue = false; }
	$.ajax({
  		type: "POST",
  		url: "/login",
  		data: $(this).serialize(),
  		statusCode: {
			200: function() {
				alert("Success");
			},
			400: function(data)
			{
				alert(data.responseText);
			},
			401: function()
			{
				alert("Invalid Username/Password");
			}
		}
	});
});

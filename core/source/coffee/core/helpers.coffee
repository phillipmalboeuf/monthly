




Core.helpers =

	upload: (file, options={})->
		
		data = new FormData()
		data.append "file", file

		# Turbolinks.controller.adapter.progressBar.setValue(0)
		# Turbolinks.controller.adapter.progressBar.show()
		
		$.ajax
			type: "POST",
			url: Core.settings.api + "_upload",
			data: data
			cache: false
			processData: false
			contentType: false
			headers: {
				"X-Session-Secret": Core.cookies.get("Session-Secret")
			} 
			success: (response)->
				# Turbolinks.controller.adapter.progressBar.setValue(100)
				# Turbolinks.controller.adapter.progressBar.hide()
				
				options.success(response) if options.success?


	get_query_string: ->
		result = {}
		query_string = location.search.slice(1)
		regex = /([^&=]+)=([^&]*)/g
		m = null

		while (m = regex.exec(query_string))
			result[decodeURIComponent(m[1])] = decodeURIComponent(m[2])

		result




String.prototype.capitalize = ->
	array = this.split(" ")

	string = ""
	_.each array, (piece)->
		string += piece.charAt(0).toUpperCase() + piece.slice(1) + " "

	return string.trim()






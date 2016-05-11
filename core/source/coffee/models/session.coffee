class Core.Models.Session extends Core.Model

	urlRoot: Core.settings.api + "sessions"


	initialize: (options={})->
		this.set 
			secret: Core.cookies.get("Session-Secret")
			user_id: Core.cookies.get("User-Id")



	login: (data={}, options={})->
		Core.session.save data,
			success: (model, response)->
				Core.cookies.set "Session-Secret", response.secret
				Core.cookies.set "User-Id", response.user_id

				Core.user.initialize()



	logout: ->
		this.clear()

		Core.user.clear()

		Core.cookies.delete "Session-Secret"
		Core.cookies.delete "User-Id"
		
		window.location = window.location.pathname


	is_authenticated: ->
		Core.cookies.get("User-Id")?
		

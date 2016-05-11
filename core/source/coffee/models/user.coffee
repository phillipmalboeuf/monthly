class Core.Models.User extends Core.Model

	urlRoot: Core.settings.api + "users"


	initialize: (options={})->
		user_id = Core.cookies.get("User-Id")

		if user_id?
			this.set 
				_id: user_id

			this.fetch()
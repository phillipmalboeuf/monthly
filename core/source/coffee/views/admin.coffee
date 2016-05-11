
class Core.Views.Admin extends Core.View

	el: $("#admin")
	template: templates["admin/admin"]

	events: {
		"submit .js-submit_login": "submit_login"
		"click .js-show_new_post": "show_new_post"
		"submit .js-new_post_form": "submit_new_post_form"
		"click .js-logout": "logout"
	}


	initialize: ->
		$(document).on("keyup", this.check_escape)

		super()


	render: ->
		super()




	submit_login: (e)->
		e.preventDefault()

		Core.session.login({
			email: e.currentTarget["email"].value
			password: e.currentTarget["password"].value
		})


	logout: (e)->
		e.preventDefault() 

		Core.session.logout()


	show_new_post: (e)->
		this.$el.find(".js-show_new_post").addClass "hide"
		this.$el.find(".js-new_post_form").removeClass "hide"

	submit_new_post_form: (e)->
		e.preventDefault()

		model = new Core.Models.ListPost()
		model.urlRoot = Core.settings.api + "lists/"+window.list_id+"/posts"
		model.save {
			title: e.currentTarget["title"].value.trim()
			route: e.currentTarget["route"].value.trim().toLowerCase()
		},
			success: (model, response)->
				window.location = "/lists/blog/posts/"+model.attributes.route




	check_escape: (e)=>
		if e.keyCode == 27
			login_box = this.$el.find(".js-login_box")
			if login_box.hasClass "hide"
				login_box.removeClass "hide"
				login_box.find("[name='email']").focus()

			else
				login_box.addClass "hide"

				if Core.session.is_authenticated()
					Core.session.logout()
			
			




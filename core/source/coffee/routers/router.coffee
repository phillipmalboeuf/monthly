class Core.Routers.Router extends Backbone.Router



	routes: {
		# "lists/:list_route(/tags)(/authors)(/posts)(/:route)(/)": "list"
		"(/)": "index"
	}

	views: []
	

	initialize: ->



	execute: (callback, args)->

		for view in @views
			view.destroy()

		delete @views
		@views = []

		callback.apply(this, args) if callback?


		$("[data-piece-id]").each (index, element)=>
			model = new Core.Models.Piece({"_id": element.getAttribute("data-piece-id")})
			@views.push new Core.Views.Piece({
				el: element
				model: model
			})


		$("[data-scroll-to]").click (e)->
			scroll_to = $("#" + e.currentTarget.getAttribute("data-scroll-to"))

			if scroll_to.length > 0
				e.preventDefault()
				e.stopImmediatePropagation()
	
				scroll_to.velocity("scroll", { duration: 1500, easing: "easeOutQuart", offset: -80 })



	index: ->
		$("[data-show-setster]").click (e)->
			window['setster_'+e.currentTarget.getAttribute("data-show-setster")].show()
		




	list: (list_route, route)->
		$(".js-post").each (index, element)=>
			model = new Core.Models.ListPost()
			model.urlRoot = Core.settings.api + "lists/"+window.list_id+"/posts"
			@views.push new Core.Views.Post({
				el: element, 
				model: model
			})











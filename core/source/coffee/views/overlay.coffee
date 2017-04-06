
class Core.Views.Overlay extends Core.View

	el: $("#overlay")

	events: {
		"click .js-hide": "hide"
	}


	initialize: ->
		super()


	render: ->
		super()


	show: (e, src)->
		e.preventDefault() if e?

		this.$el.find("iframe").attr "src", src
		this.$el.addClass "overlay--show"



	hide: (e)->
		e.preventDefault() if e?

		this.$el.removeClass "overlay--show"


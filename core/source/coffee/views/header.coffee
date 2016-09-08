
class Core.Views.Header extends Core.View

	el: $("#header")

	events: { }


	initialize: ->
		$(window).on("scroll", this.check_scroll.bind(this))

		super()


	render: ->
		super()




	check_scroll: (e)->
		if window.pageYOffset > window.innerHeight
			this.$el.addClass "header--with_background" unless this.$el.hasClass "header--with_background"
		else
			this.$el.removeClass "header--with_background" if this.$el.hasClass "header--with_background"
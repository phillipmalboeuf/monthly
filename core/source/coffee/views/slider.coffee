
class Core.Views.Slider extends Backbone.View


	current_slide: 0

	events: {
		"click [data-next-slide-button]": "next_slide"
		"click [data-previous-slide-button]": "previous_slide"
		"click [data-slide-marker]": "slide_to"
		"click [data-add-new-slide]": "new_slide"
	}

	
	initialize: ->
		@slides_count = this.$el.find("[data-slide]").length

		if this.el.hasAttribute("data-current-slide")
			@current_slide = parseInt this.$el.attr("data-current-slide")

		this.render()

		



	render: ->

		this.$el.find("[data-slider-container]").css "width", @slides_count+"00%"
		this.$el.find("[data-slide]").css "width", (100/@slides_count)+"%"
		@previous_slide_height = this.$el.find("[data-slide="+@current_slide+"] [data-slide-content]").height()
		this.$el.find("[data-slider-container]").css "height", "-="+(this.$el.find("[data-slide="+@current_slide+"]").height() - @previous_slide_height)+"px"
		this.$el.find("[data-slide]").css "transform", "translateX(-"+@current_slide+"00%)"

		setTimeout =>
			this.$el.find("[data-slide]").css "visibility", "visible"
		, 666

		this



	next_slide: ->
		if @current_slide == @slides_count - 1
			this.slide_to(null, 0)

		else
			this.slide_to(null, @current_slide + 1)


	previous_slide: ->
		if @current_slide == 0
			this.slide_to(null, @slides_count - 1)

		else
			this.slide_to(null, @current_slide - 1)


	slide_to: (e, index)->
		if e?
			index = parseInt(e.currentTarget.getAttribute "data-slide-marker")
			e.currentTarget.blur()

		@current_slide = index
		this.$el.find("[data-slide-marker]").removeClass "slider__marker--active"
		this.$el.find("[data-slide-marker="+@current_slide+"]").addClass "slider__marker--active"

		slide_height = this.$el.find("[data-slide="+@current_slide+"] [data-slide-content]").height()
		this.$el.find("[data-slider-container]").css "height", "-="+(@previous_slide_height - slide_height)+"px"

		@previous_slide_height = slide_height

		this.$el.find("[data-slide]").css "transform", "translateX(-"+@current_slide+"00%)"



	new_slide: (e)->
		e.preventDefault()

		slide = this.$el.find("[data-slide]").last().clone()
		slide.attr "data-slide", @slides_count
		slide.find("[data-slide-image]").attr "src", "https://placehold.it/750x500?text=%2B"
		slide.find("[data-slide-content]").css "background-image", "none"
		slide.find("[data-slide-title]").text "<Mois>"
		@slides_count = @slides_count + 1

		this.$el.find("[data-slider-container]").append slide
		this.render()

		for view in Core.router.views
			view.render()

		this.slide_to null, @slides_count - 1
		





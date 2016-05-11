class Core.View extends Backbone.View

	template: null
	templates: null

	data: {}
	events: {}


	initialize: ->
		this.listenTo Core.session, "sync", this.render if Core.session?
		this.listenTo Core.user, "sync", this.render if Core.user?

		_.extend @data, 
			pieces: window.pieces


		this.render()




	render: ->
		_.extend @data, 
			session: Core.session.toJSON() if Core.session?
			user: Core.user.toJSON() if Core.user?
			is_authenticated: Core.session.has("user_id") if Core.session?

		if @templates?
			html = ""
			_.each @templates, (template)=>
				html += template(@data)

			this.$el.html(html)
			
		else
			this.$el.html @template(@data) if @template?


		super()

		$(document.links).filter(()->
			this.hostname != window.location.hostname
		).attr('target', '_blank')

		this.delegateEvents()

		this



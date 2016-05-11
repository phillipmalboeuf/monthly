class Core.Collection extends Backbone.Collection

	model: Core.Model
		



	fetch: (options={})->
		super Core.Model.prototype.set_secret_header(options)




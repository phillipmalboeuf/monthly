


window.Core =
	Collections:{}
	Models:{}
	Views:{}
	Routers:{}


	settings:
		cdn: "https://d3hy1swj29dtr7.cloudfront.net/"
		api: "http://127.0.0.1:5000/"



	init: ->

		@session = new Core.Models.Session()
		@user = new Core.Models.User()
		
		@admin_view = new Core.Views.Admin()


		@router = new Core.Routers.Router()
		Backbone.history.start
			pushState: true
	


		
		

Core = window.Core
_ = window._
Backbone = window.Backbone
jQuery = window.jQuery


_.extend Core.settings, window.core_settings if window.core_settings?


$ ->
	Core.init()















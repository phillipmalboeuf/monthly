
class Core.Views.Piece extends Core.View


	piece_admin_template: templates["admin/piece_admin"]
	piece_link_template: templates["admin/piece_link"]
	piece_hidden_template: templates["admin/piece_hidden"]
	piece_background_template: templates["admin/piece_background"]
	slide_admin_template: templates["admin/slide_admin"]


	events: {
		"click .js-save_piece": "save_piece"
		"input [data-key]": "key_input"
		"click [data-key]": "prevent_click"
		"click [data-image-key]": "trigger_upload"
		"click [data-slide-image]": "trigger_upload"
		"input [data-slide-title]": "key_input"
		"click [data-add-new-slide]": "new_slide"
		"change .js-image_input": "upload_image"
	}


	initialize: ->

		this.listenTo @model, "sync", this.render
		@model.fetch()


		super()


	render: ->

		super()


		if @data.is_authenticated
			this.$el.find("[data-key]").attr "contenteditable", "true"

			this.$el.find("[data-link-key]").each (index, link)=>
				$(link).before this.piece_link_template({
					key: link.getAttribute("data-link-key")
					link: link.getAttribute("href")
				})

				link.removeAttribute("data-link-key")

			if @model.attributes.content?
				this.$el.find("[data-hidden-key]").each (index, hidden)=>
					content = @model.attributes.content[hidden.getAttribute("data-hidden-key")]

					$(hidden).before this.piece_hidden_template({
						key: hidden.getAttribute("data-hidden-key")
						label: content.label
						value: content.value
					})

					hidden.removeAttribute("data-hidden-key")

			this.$el.find("[data-image-key]").each (index, image)=>
				$(image).addClass "img--clickable"


			this.$el.find("[data-slide-background]").each (index, element)=>
				$(element).append this.piece_background_template({
					image: $(element).css("background-image").slice(4, -1).replace(/"/g, "")
				})

				element.removeAttribute("data-slide-background")

			this.$el.find("[data-slides-key]").each (index, slides)=>
				$(slides).find("[data-slide-image]").addClass "img--clickable"
				$(slides).find("[data-slide-title]").attr "contenteditable", "true"

				$(slides).find("[data-slide-admin]").html this.slide_admin_template({

				})


			this.$el.find("[data-piece-admin]").html this.piece_admin_template(@data)
			@button = this.$el.find(".js-save_piece")

		this



	save_piece: (e)->
		e.preventDefault()

		if Core.settings.lang?
			this.$el.find("[data-key]").each (index, key)=>
				@model.attributes.content[key.getAttribute("data-key")].translations = {} unless @model.attributes.content[key.getAttribute("data-key")].translations?
				@model.attributes.content[key.getAttribute("data-key")].translations[Core.settings.lang] = key.innerHTML

			this.$el.find("[data-image-key]").each (index, key)=>
				@model.attributes.content[key.getAttribute("data-image-key")].translations = {} unless @model.attributes.content[key.getAttribute("data-image-key")].translations?
				@model.attributes.content[key.getAttribute("data-image-key")].translations[Core.settings.lang] = key.getAttribute("src")


		else
			this.$el.find("[data-key]").each (index, key)=>
				@model.attributes.content[key.getAttribute("data-key")].value = key.innerHTML

			this.$el.find("[data-image-key]").each (index, key)=>
				@model.attributes.content[key.getAttribute("data-image-key")].value = key.getAttribute("src")

			this.$el.find("[data-slides-key]").each (index, key)=>
				slides = []
				$(key).find("[data-slide-image]").each (index, image)=>
					slides.push {
						title: $(key).find("[data-slide-title]")[index].innerText
						image: image.src.replace(key.getAttribute("data-slides-cdn"), "")
					}

				@model.attributes.content[key.getAttribute("data-slides-key")].value = slides


		@model.save()


	key_input: (e)->
		if @button.attr "disabled"
			@button.removeAttr "disabled"


	trigger_upload: (e)->
		input = this.$el.find(".js-image_input")
		@image = e.currentTarget
		input.click()


	upload_image: (e)->

		file = e.currentTarget.files[0]
		if file.type.match('image.*')
			Core.helpers.upload file,
				success: (response)=>
					
					$(@image).attr "src", Core.settings.cdn+response.url
					this.key_input()


	new_slide: (e)->
		e.preventDefault()


	prevent_click: (e)->
		if @data.is_authenticated
			e.preventDefault()



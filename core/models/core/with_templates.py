from core import app
from core.helpers.json import to_json, json_formater

from flask import request, abort
from flask import render_template, json
from werkzeug.routing import Rule
from werkzeug.contrib.cache import SimpleCache

from core.models.cms.piece import Piece

from bson.objectid import ObjectId
import hashlib


with app.app_context():
	class WithTemplates():

		templates = [
			{
				'view_function': 'list_view',
				'template': 'layout.html',
				'response_key': 'documents'
			},
			{
				'view_function': 'get_view',
				'template': 'layout.html',
				'response_key': 'document'
			}
		]

		@classmethod
		def define_routes(cls):
			app.caches[cls.endpoint] = SimpleCache()

			return super().define_routes()
		

		@classmethod
		def preprocess(cls, document):
			app.caches[cls.endpoint].clear()

			return super().preprocess(document)


		@classmethod
		def _format_response(cls, response):
			try:
				if request.headers['Accept'] == 'application/json':
					return to_json(response)

				else:
					cached_template = app.caches[cls.endpoint].get(request.path)
					if cached_template is None or request.current_session_is_admin or app.config['DEBUG']:
						for template in cls.templates:
							if template['view_function'] == request.url_rule.route['view_function']:

								try:
									response = getattr(cls, template['prerender_process'])(response)
								except KeyError:
									pass


								response = {
									template['response_key']: response.copy(),
									'pieces': Piece._values(),
									'root': request.host_url,
									'debugging': app.config['DEBUG']
								}
								response['pieces_json'] = json.dumps(response['pieces'], sort_keys=False, default=json_formater)


								try:
									template['template'] = template['template'].replace('<route>', request.view_args['_id'])
								except KeyError:
									pass

								try:
									template['template'] = template['template'].replace('<parent_route>', request.view_args['parent_id'])
								except KeyError:
									pass

								render = render_template(template['template'], **response)
								if not request.current_session_is_admin:
									app.caches[cls.endpoint].set(request.path, render, timeout=0)
								
								return render

					else:
						return cached_template

			except KeyError:
				return to_json(response)
	








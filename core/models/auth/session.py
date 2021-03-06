from core import app
from flask import request, abort
from werkzeug.exceptions import NotFound

from core.models.core.model import Model
from core.models.core.has_routes import HasRoutes

from core.models.auth.token import Token
from core.models.auth.user import User
from core.helpers.validation_rules import validation_rules

from bson.objectid import ObjectId

import hashlib
import uuid


with app.app_context():
	class Session(HasRoutes, Model):

		collection_name = 'sessions'

		schema = {
			'token_id': validation_rules['text'],
			'email': validation_rules['email'],
			'password': validation_rules['password']
		}



		endpoint = '/sessions'
		routes = [
			{
				'route': '',
				'view_function': 'create_view',
				'methods': ['POST']
			},
			{
				'route': '/<ObjectId:_id>',
				'view_function': 'get_view',
				'methods': ['GET'],
				'requires_session': True
			},
			{
				'route': '/<ObjectId:_id>',
				'view_function': 'update_view',
				'methods': ['PATCH', 'PUT'],
				'requires_session': True
			},
			{
				'route': '/<ObjectId:_id>',
				'view_function': 'delete_view',
				'methods': ['DELETE'],
				'requires_session': True
			}
		]


		@classmethod
		def create(cls, document):

			if 'token_id' in document:
				try:
					document['token_id'] = Token.get_where({'_id': document['token_id']})['_id']

				except KeyError:
					abort(403)

				except NotFound:
					abort(400)


			secret = uuid.uuid4().hex
			document['secret_hash'] = hashlib.sha256(secret.encode('utf-8')).hexdigest()

			document['_id'] = ObjectId()
			document['session_id'] = document['_id']

			document = super().create(document)
			document['secret'] = secret

			try:
				document['user_id'] = request.user_id
			except AttributeError:
				pass

			return document
			

			



		@classmethod
		def preprocess(cls, document):

			try:
				if 'password' in document and document['password'] is not None:
					user = User.get_where({
						'email': document['email'],
						'password': hashlib.sha256(document['password'].encode('utf-8')).hexdigest()
					})

					document['user_id'] = user['_id']
					request.user_id = document['user_id']

					try:
						document['is_vendor'] = user['is_vendor']
					except KeyError:
						pass

					try:
						document['is_admin'] = user['is_admin']
					except KeyError:
						pass

					del document['email']
					del document['password']

				else:
					document['user_id'] = User.create({'email': document['email']})['_id']
					request.user_id = document['user_id']
					del document['email']


				
			except KeyError:
				pass


			return super().preprocess(document)


		@classmethod
		def postprocess(cls, document):

			try:
				del document['secret_hash']
				
			except KeyError:
				pass


			if 'is_admin' not in document:
				document['is_admin'] = False

			if 'is_vendor' not in document:
				document['is_vendor'] = False


			return document

	




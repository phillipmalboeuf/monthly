
from tornado.wsgi import WSGIContainer
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop

from core import app
from core.helpers.json import to_json


from flask import request, abort
import os


from core.models.core.upload import Upload
Upload.define_routes()


from core.models.auth.token import Token
from core.models.auth.session import Session
from core.models.auth.user import User

Token.define_routes()
Session.define_routes()
User.define_routes()


from core.models.cms.piece import Piece
from core.models.cms.author import Author
from core.models.cms.list import List
from core.models.cms.list_post import ListPost
from core.models.cms.comment import ListPostComment
from core.models.cms.survey import Survey
from core.models.cms.survey_answer import SurveyAnswer
from core.models.cms.comment import SurveyComment

Piece.define_routes()
Author.define_routes()
List.define_routes()
ListPost.define_routes()
ListPostComment.define_routes()
Survey.define_routes()
SurveyAnswer.define_routes()
SurveyComment.define_routes()



if __name__ == '__main__':
	if app.config['DEBUG']:
		app.run(threaded=True)

	else:
		http_server = HTTPServer(WSGIContainer(app))
		http_server.listen(5000)
		IOLoop.instance().start()


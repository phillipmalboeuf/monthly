(function() {
  var Backbone, Core, _, jQuery;

  window.Core = {
    Collections: {},
    Models: {},
    Views: {},
    Routers: {},
    settings: {
      cdn: "https://d3hy1swj29dtr7.cloudfront.net/",
      api: "http://127.0.0.1:5000/"
    },
    init: function() {
      this.session = new Core.Models.Session();
      this.user = new Core.Models.User();
      this.admin_view = new Core.Views.Admin();
      this.header_view = new Core.Views.Header();
      this.overlay_view = new Core.Views.Overlay();
      this.router = new Core.Routers.Router();
      return Backbone.history.start({
        pushState: true
      });
    }
  };

  Core = window.Core;

  _ = window._;

  Backbone = window.Backbone;

  jQuery = window.jQuery;

  if (window.core_settings != null) {
    _.extend(Core.settings, window.core_settings);
  }

  $(function() {
    return Core.init();
  });

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Core.Collection = (function(superClass) {
    extend(Collection, superClass);

    function Collection() {
      return Collection.__super__.constructor.apply(this, arguments);
    }

    Collection.prototype.model = Core.Model;

    Collection.prototype.fetch = function(options) {
      if (options == null) {
        options = {};
      }
      return Collection.__super__.fetch.call(this, Core.Model.prototype.set_secret_header(options));
    };

    return Collection;

  })(Backbone.Collection);

}).call(this);

(function() {
  window.Core.cookies = {
    set: function(name, value, expiry_days) {
      var d, expires;
      d = new Date();
      d.setTime(d.getTime() + (expiry_days * 24 * 60 * 60 * 1000));
      expires = "expires=" + d.toGMTString();
      return document.cookie = "X-" + name + "=" + value + "; " + expires + "; path=/";
    },
    set_for_a_session: function(name, value) {
      return document.cookie = "X-" + name + "=" + value + "; path=/";
    },
    get: function(name) {
      var cookie, cookies, fn, i, len, value;
      name = "X-" + name + "=";
      value = false;
      cookies = document.cookie.split(';');
      fn = function(cookie) {
        cookie = cookie.trim();
        if (cookie.indexOf(name) === 0) {
          return value = cookie.substring(name.length, cookie.length);
        }
      };
      for (i = 0, len = cookies.length; i < len; i++) {
        cookie = cookies[i];
        fn(cookie);
      }
      if (!value) {
        value = null;
      }
      return value;
    },
    "delete": function(name) {
      return document.cookie = 'X-' + name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    }
  };

}).call(this);

(function() {
  Core.helpers = {
    upload: function(file, options) {
      var data;
      if (options == null) {
        options = {};
      }
      data = new FormData();
      data.append("file", file);
      Turbolinks.controller.adapter.progressBar.setValue(0);
      Turbolinks.controller.adapter.progressBar.show();
      return $.ajax({
        type: "POST",
        url: Core.settings.api + "_upload",
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        headers: {
          "X-Session-Secret": Core.cookies.get("Session-Secret")
        },
        success: function(response) {
          Turbolinks.controller.adapter.progressBar.setValue(100);
          Turbolinks.controller.adapter.progressBar.hide();
          if (options.success != null) {
            return options.success(response);
          }
        }
      });
    },
    get_query_string: function() {
      var m, query_string, regex, result;
      result = {};
      query_string = location.search.slice(1);
      regex = /([^&=]+)=([^&]*)/g;
      m = null;
      while ((m = regex.exec(query_string))) {
        result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
      }
      return result;
    }
  };

  String.prototype.capitalize = function() {
    var array, string;
    array = this.split(" ");
    string = "";
    _.each(array, function(piece) {
      return string += piece.charAt(0).toUpperCase() + piece.slice(1) + " ";
    });
    return string.trim();
  };

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Core.Model = (function(superClass) {
    extend(Model, superClass);

    function Model() {
      return Model.__super__.constructor.apply(this, arguments);
    }

    Model.prototype.urlRoot = Core.settings.api + "models";

    Model.prototype.idAttribute = "_id";

    Model.prototype.save = function(data, options, local_only) {
      var e;
      if (options == null) {
        options = {};
      }
      if (local_only == null) {
        local_only = false;
      }
      if (this.local_storage != null) {
        this.set(data);
        try {
          localStorage.setItem(this.local_storage, JSON.stringify(this.toJSON()));
        } catch (_error) {
          e = _error;
          console.log("Warning: localStorage is disabled");
        }
      }
      if (local_only) {
        if (options.success != null) {
          return options.success(this, this.toJSON());
        }
      } else {
        return Model.__super__.save.call(this, data, this.set_secret_header(options));
      }
    };

    Model.prototype.fetch = function(options) {
      if (options == null) {
        options = {};
      }
      if ((this.local_storage != null) && (localStorage.getItem(this.local_storage) != null)) {
        this.set(this.parse(JSON.parse(localStorage.getItem(this.local_storage))));
      }
      if (this.id != null) {
        return Model.__super__.fetch.call(this, this.set_secret_header(options));
      }
    };

    Model.prototype.destroy = function(options) {
      if (options == null) {
        options = {};
      }
      if (this.local_storage != null) {
        localStorage.removeItem(this.local_storage);
      }
      return Model.__super__.destroy.call(this, this.set_secret_header(options));
    };

    Model.prototype.clear = function() {
      if (this.local_storage != null) {
        localStorage.removeItem(this.local_storage);
      }
      return Model.__super__.clear.call(this);
    };

    Model.prototype.set_secret_header = function(options) {
      if (options.headers == null) {
        options.headers = {};
      }
      options.headers['Accept'] = 'application/json';
      options.headers['X-Session-Secret'] = Core.cookies.get("Session-Secret");
      return options;
    };

    return Model;

  })(Backbone.Model);

}).call(this);

(function() {
  Handlebars.registerHelper('first', function(models, options) {
    if ((models != null) && (models[0] != null)) {
      return options.fn(models[0]);
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('last', function(models, options) {
    if ((models != null) && (models[models.length - 1] != null)) {
      return options.fn(models[models.length - 1]);
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('get', function(model, key) {
    if ((model != null) && (model[key] != null)) {
      return model[key];
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('if_get', function(model, key, options) {
    if ((model[key] != null) && model[key]) {
      return options.fn(this);
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('unless_get', function(model, key, options) {
    if ((model[key] != null) && model[key]) {
      return null;
    } else {
      return options.fn(this);
    }
  });

  Handlebars.registerHelper('if_equal', function(left, right, options) {
    if (left === right) {
      return options.fn(this);
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('if_lower', function(left, right, options) {
    if (left < right) {
      return options.fn(this);
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('if_higher', function(left, right, options) {
    if (left > right) {
      return options.fn(this);
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('if_get_equal', function(model, key, right, options) {
    if ((model[key] != null) && model[key] === right) {
      return options.fn(this);
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('unless_equal', function(left, right, options) {
    if (left !== right) {
      return options.fn(this);
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('if_in_array', function(array, right, options) {
    if ((array != null) && _.contains(array, right)) {
      return options.fn(this);
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('date', function(date) {
    date = new Date(date);
    return date.toLocaleDateString();
  });

  Handlebars.registerHelper('if_dates_equal', function(left, right, options) {
    left = new Date(left);
    right = new Date(right);
    if (left.toLocaleDateString() === right.toLocaleDateString()) {
      return options.fn(this);
    } else {
      return null;
    }
  });

  Handlebars.registerHelper('json', function(json) {
    return JSON.stringify(JSON.parse(json), void 0, 2);
  });

  Handlebars.registerHelper('address', function(address) {
    var address_text;
    address_text = "";
    if (address != null) {
      if (address.name != null) {
        address.first_name = address.name;
        address.last_name = "";
      }
      address_text += address.first_name + " " + address.last_name + "<br>" + address.street;
      if ((address.street_continued != null) && address.street_continued !== "") {
        address_text += address.street_continued;
      }
      address_text += " " + address.city + ", " + address.region + ", " + address.country + " " + address.zip;
    }
    return address_text;
  });

  Handlebars.registerHelper('percentage', function(value) {
    return (value * 100) + "%";
  });

  Handlebars.registerHelper('ms', function(value) {
    return (parseFloat(value)).toFixed(3) + "ms";
  });

  Handlebars.registerHelper('plus', function(left, right) {
    return left + right;
  });

  Handlebars.registerHelper('minus', function(left, right) {
    return left - right;
  });

  Handlebars.registerHelper('times', function(value, times) {
    return value * times;
  });

  Handlebars.registerHelper('divide', function(left, right) {
    return left / right;
  });

  Handlebars.registerHelper('encode_uri', function(url) {
    return encodeURIComponent(url);
  });

  Handlebars.registerHelper('first_letter', function(string) {
    if (string != null) {
      return string[0].toUpperCase();
    }
  });

  Handlebars.registerHelper('first_word', function(string) {
    if (string != null) {
      return string.split(" ")[0];
    }
  });

  Handlebars.registerHelper('name_from_email', function(email) {
    if (email != null) {
      return email.split("@")[0];
    }
  });

  Handlebars.registerHelper('first_name_from_name', function(name) {
    if (name != null) {
      return name.split(" ")[0];
    }
  });

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Core.View = (function(superClass) {
    extend(View, superClass);

    function View() {
      return View.__super__.constructor.apply(this, arguments);
    }

    View.prototype.template = null;

    View.prototype.templates = null;

    View.prototype.data = {};

    View.prototype.events = {};

    View.prototype.initialize = function() {
      if (Core.session != null) {
        this.listenTo(Core.session, "sync", this.render);
      }
      if (Core.user != null) {
        this.listenTo(Core.user, "sync", this.render);
      }
      _.extend(this.data, {
        pieces: window.pieces
      });
      return this.render();
    };

    View.prototype.render = function() {
      var html;
      _.extend(this.data, Core.session != null ? {
        session: Core.session.toJSON()
      } : void 0, Core.user != null ? {
        user: Core.user.toJSON()
      } : void 0, Core.session != null ? {
        is_authenticated: Core.session.has("user_id")
      } : void 0);
      if (this.templates != null) {
        html = "";
        _.each(this.templates, (function(_this) {
          return function(template) {
            return html += template(_this.data);
          };
        })(this));
        this.$el.html(html);
      } else {
        if (this.template != null) {
          this.$el.html(this.template(this.data));
        }
      }
      View.__super__.render.call(this);
      $(document.links).filter(function() {
        return this.hostname !== window.location.hostname;
      }).attr('target', '_blank');
      this.delegateEvents();
      return this;
    };

    return View;

  })(Backbone.View);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Core.Models.List = (function(superClass) {
    extend(List, superClass);

    function List() {
      return List.__super__.constructor.apply(this, arguments);
    }

    List.prototype.urlRoot = Core.settings.api + "lists";

    return List;

  })(Core.Model);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Core.Models.ListPost = (function(superClass) {
    extend(ListPost, superClass);

    function ListPost() {
      return ListPost.__super__.constructor.apply(this, arguments);
    }

    return ListPost;

  })(Core.Model);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Core.Models.Piece = (function(superClass) {
    extend(Piece, superClass);

    function Piece() {
      return Piece.__super__.constructor.apply(this, arguments);
    }

    Piece.prototype.urlRoot = Core.settings.api + "pieces";

    return Piece;

  })(Core.Model);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Core.Models.Survey = (function(superClass) {
    extend(Survey, superClass);

    function Survey() {
      return Survey.__super__.constructor.apply(this, arguments);
    }

    Survey.prototype.urlRoot = Core.settings.api + "surveys";

    return Survey;

  })(Core.Model);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Core.Models.SurveyAnswer = (function(superClass) {
    extend(SurveyAnswer, superClass);

    function SurveyAnswer() {
      return SurveyAnswer.__super__.constructor.apply(this, arguments);
    }

    return SurveyAnswer;

  })(Core.Model);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Core.Models.Session = (function(superClass) {
    extend(Session, superClass);

    function Session() {
      return Session.__super__.constructor.apply(this, arguments);
    }

    Session.prototype.urlRoot = Core.settings.api + "sessions";

    Session.prototype.initialize = function(options) {
      if (options == null) {
        options = {};
      }
      return this.set({
        secret: Core.cookies.get("Session-Secret"),
        user_id: Core.cookies.get("User-Id")
      });
    };

    Session.prototype.login = function(data, options) {
      if (data == null) {
        data = {};
      }
      if (options == null) {
        options = {};
      }
      return Core.session.save(data, {
        success: function(model, response) {
          Core.cookies.set("Session-Secret", response.secret);
          Core.cookies.set("User-Id", response.user_id);
          return Core.user.initialize();
        }
      });
    };

    Session.prototype.logout = function() {
      this.clear();
      Core.user.clear();
      Core.cookies["delete"]("Session-Secret");
      Core.cookies["delete"]("User-Id");
      return window.location = window.location.pathname;
    };

    Session.prototype.is_authenticated = function() {
      return Core.cookies.get("User-Id") != null;
    };

    return Session;

  })(Core.Model);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Core.Models.User = (function(superClass) {
    extend(User, superClass);

    function User() {
      return User.__super__.constructor.apply(this, arguments);
    }

    User.prototype.urlRoot = Core.settings.api + "users";

    User.prototype.initialize = function(options) {
      var user_id;
      if (options == null) {
        options = {};
      }
      user_id = Core.cookies.get("User-Id");
      if (user_id != null) {
        this.set({
          _id: user_id
        });
        return this.fetch();
      }
    };

    return User;

  })(Core.Model);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Core.Views.Editable = (function(superClass) {
    extend(Editable, superClass);

    function Editable() {
      return Editable.__super__.constructor.apply(this, arguments);
    }

    Editable.prototype.edit_admin_template = templates["admin/edit_admin"];

    Editable.prototype.tag_input_template = templates["admin/tag_input"];

    Editable.prototype.tag_template = templates["admin/tag"];

    Editable.prototype.initialize = function() {
      this.events["click .js-save_edit"] = "save_edit";
      this.events["click .js-destroy"] = "destroy";
      this.events["keypress [name='tag_input']"] = "input_tag";
      this.events["blur [name='tag_input']"] = "blur_tag";
      this.listenTo(this.model, "sync", this.render);
      this.model.set({
        _id: this.$el.attr("data-id")
      });
      this.model.fetch();
      return Editable.__super__.initialize.call(this);
    };

    Editable.prototype.render = function() {
      _.extend(this.data, {
        model: this.model.toJSON()
      });
      Editable.__super__.render.call(this);
      if (this.data.is_authenticated) {
        this.$el.find("[data-tag]").attr("contenteditable", "true");
        this.$el.find("[data-tag-input]").html(this.tag_input_template(this.data));
        this.$el.find("[data-admin]").html(this.edit_admin_template(this.data));
        this.delegateEvents();
      }
      return this;
    };

    Editable.prototype.save_edit = function(e) {
      var tags;
      this.model.set({
        is_online: this.$el.find("[name='is_online']")[0].checked
      });
      tags = [];
      this.$el.find("[data-tag]").each((function(_this) {
        return function(index, tag) {
          return tags.push(tag.innerHTML);
        };
      })(this));
      this.model.attributes.tags = tags;
      return this.model.save();
    };

    Editable.prototype.destroy = function() {
      if (confirm("Are you sure?")) {
        return this.model.destroy({
          success: function(model, response) {
            return window.location = "/lists/" + window.list_route;
          }
        });
      }
    };

    Editable.prototype.input_tag = function(e) {
      if (e.keyCode === 13) {
        e.preventDefault();
        return this.insert_tag(e.currentTarget);
      }
    };

    Editable.prototype.blur_tag = function(e) {
      var value;
      value = e.currentTarget.value.trim();
      if (value !== "") {
        e.preventDefault();
        this.insert_tag(e.currentTarget);
        return $(e.currentTarget).focus();
      }
    };

    Editable.prototype.insert_tag = function(target) {
      var fn, i, len, value, values;
      values = target.value.trim().split(",");
      fn = (function(_this) {
        return function(value) {
          return $(_this.tag_template({
            tag: value.trim().toLowerCase()
          })).insertBefore($(target).parent());
        };
      })(this);
      for (i = 0, len = values.length; i < len; i++) {
        value = values[i];
        fn(value);
      }
      return target.value = "";
    };

    return Editable;

  })(Core.View);

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Core.Views.Admin = (function(superClass) {
    extend(Admin, superClass);

    function Admin() {
      this.check_escape = bind(this.check_escape, this);
      return Admin.__super__.constructor.apply(this, arguments);
    }

    Admin.prototype.el = $("#admin");

    Admin.prototype.template = templates["admin/admin"];

    Admin.prototype.events = {
      "submit .js-submit_login": "submit_login",
      "click .js-show_new_post": "show_new_post",
      "submit .js-new_post_form": "submit_new_post_form",
      "click .js-logout": "logout"
    };

    Admin.prototype.initialize = function() {
      $(document).on("keyup", this.check_escape);
      return Admin.__super__.initialize.call(this);
    };

    Admin.prototype.render = function() {
      return Admin.__super__.render.call(this);
    };

    Admin.prototype.submit_login = function(e) {
      e.preventDefault();
      return Core.session.login({
        email: e.currentTarget["email"].value,
        password: e.currentTarget["password"].value
      });
    };

    Admin.prototype.logout = function(e) {
      e.preventDefault();
      return Core.session.logout();
    };

    Admin.prototype.show_new_post = function(e) {
      this.$el.find(".js-show_new_post").addClass("hide");
      return this.$el.find(".js-new_post_form").removeClass("hide");
    };

    Admin.prototype.submit_new_post_form = function(e) {
      var model;
      e.preventDefault();
      model = new Core.Models.ListPost();
      model.urlRoot = Core.settings.api + "lists/" + window.list_id + "/posts";
      return model.save({
        title: e.currentTarget["title"].value.trim(),
        route: e.currentTarget["route"].value.trim().toLowerCase()
      }, {
        success: function(model, response) {
          return window.location = "/lists/blog/posts/" + model.attributes.route;
        }
      });
    };

    Admin.prototype.check_escape = function(e) {
      var login_box;
      if (e.keyCode === 27) {
        login_box = this.$el.find(".js-login_box");
        if (login_box.hasClass("hide")) {
          login_box.removeClass("hide");
          return login_box.find("[name='email']").focus();
        } else {
          login_box.addClass("hide");
          if (Core.session.is_authenticated()) {
            return Core.session.logout();
          }
        }
      }
    };

    return Admin;

  })(Core.View);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Core.Views.Header = (function(superClass) {
    extend(Header, superClass);

    function Header() {
      return Header.__super__.constructor.apply(this, arguments);
    }

    Header.prototype.el = $("#header");

    Header.prototype.events = {};

    Header.prototype.initialize = function() {
      this.check_scroll();
      $(window).on("scroll", this.check_scroll.bind(this));
      return Header.__super__.initialize.call(this);
    };

    Header.prototype.render = function() {
      return Header.__super__.render.call(this);
    };

    Header.prototype.check_scroll = function(e) {
      if (window.pageYOffset > window.innerHeight) {
        if (!this.$el.hasClass("header--with_background")) {
          return this.$el.addClass("header--with_background");
        }
      } else {
        if (this.$el.hasClass("header--with_background")) {
          return this.$el.removeClass("header--with_background");
        }
      }
    };

    return Header;

  })(Core.View);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Core.Views.Overlay = (function(superClass) {
    extend(Overlay, superClass);

    function Overlay() {
      return Overlay.__super__.constructor.apply(this, arguments);
    }

    Overlay.prototype.el = $("#overlay");

    Overlay.prototype.events = {
      "click .js-hide": "hide"
    };

    Overlay.prototype.initialize = function() {
      return Overlay.__super__.initialize.call(this);
    };

    Overlay.prototype.render = function() {
      return Overlay.__super__.render.call(this);
    };

    Overlay.prototype.show = function(e, src) {
      if (e != null) {
        e.preventDefault();
      }
      this.$el.find("iframe").attr("src", src);
      return this.$el.addClass("overlay--show");
    };

    Overlay.prototype.hide = function(e) {
      if (e != null) {
        e.preventDefault();
      }
      return this.$el.removeClass("overlay--show");
    };

    return Overlay;

  })(Core.View);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Core.Views.Piece = (function(superClass) {
    extend(Piece, superClass);

    function Piece() {
      return Piece.__super__.constructor.apply(this, arguments);
    }

    Piece.prototype.piece_admin_template = templates["admin/piece_admin"];

    Piece.prototype.piece_link_template = templates["admin/piece_link"];

    Piece.prototype.piece_hidden_template = templates["admin/piece_hidden"];

    Piece.prototype.piece_background_template = templates["admin/piece_background"];

    Piece.prototype.slide_admin_template = templates["admin/slide_admin"];

    Piece.prototype.events = {
      "click .js-save_piece": "save_piece",
      "input [data-key]": "key_input",
      "click [data-key]": "prevent_click",
      "click [data-image-key]": "trigger_upload",
      "click [data-slide-image]": "trigger_upload",
      "input [data-slide-title]": "key_input",
      "change .js-image_input": "upload_image"
    };

    Piece.prototype.initialize = function() {
      this.listenTo(this.model, "sync", this.render);
      this.model.fetch();
      return Piece.__super__.initialize.call(this);
    };

    Piece.prototype.render = function() {
      Piece.__super__.render.call(this);
      if (this.data.is_authenticated) {
        this.$el.find("[data-key]").attr("contenteditable", "true");
        this.$el.find("[data-link-key]").each((function(_this) {
          return function(index, link) {
            $(link).before(_this.piece_link_template({
              key: link.getAttribute("data-link-key"),
              link: link.getAttribute("href")
            }));
            return link.removeAttribute("data-link-key");
          };
        })(this));
        if (this.model.attributes.content != null) {
          this.$el.find("[data-hidden-key]").each((function(_this) {
            return function(index, hidden) {
              var content;
              content = _this.model.attributes.content[hidden.getAttribute("data-hidden-key")];
              $(hidden).before(_this.piece_hidden_template({
                key: hidden.getAttribute("data-hidden-key"),
                label: content.label,
                value: content.value
              }));
              return hidden.removeAttribute("data-hidden-key");
            };
          })(this));
        }
        this.$el.find("[data-image-key]").each((function(_this) {
          return function(index, image) {
            return $(image).addClass("img--clickable");
          };
        })(this));
        this.$el.find("[data-slide-background]").each((function(_this) {
          return function(index, element) {
            $(element).append(_this.piece_background_template({
              image: $(element).css("background-image").slice(4, -1).replace(/"/g, "")
            }));
            return element.removeAttribute("data-slide-background");
          };
        })(this));
        this.$el.find("[data-slides-key]").each((function(_this) {
          return function(index, slides) {
            $(slides).find("[data-slide-image]").addClass("img--clickable");
            $(slides).find("[data-slide-title]").attr("contenteditable", "true");
            return $(slides).find("[data-slide-admin]").html(_this.slide_admin_template({}));
          };
        })(this));
        this.$el.find("[data-piece-admin]").html(this.piece_admin_template(this.data));
        this.button = this.$el.find(".js-save_piece");
      }
      return this;
    };

    Piece.prototype.save_piece = function(e) {
      e.preventDefault();
      if (Core.settings.lang != null) {
        this.$el.find("[data-key]").each((function(_this) {
          return function(index, key) {
            if (_this.model.attributes.content[key.getAttribute("data-key")].translations == null) {
              _this.model.attributes.content[key.getAttribute("data-key")].translations = {};
            }
            return _this.model.attributes.content[key.getAttribute("data-key")].translations[Core.settings.lang] = key.innerHTML;
          };
        })(this));
        this.$el.find("[data-image-key]").each((function(_this) {
          return function(index, key) {
            if (_this.model.attributes.content[key.getAttribute("data-image-key")].translations == null) {
              _this.model.attributes.content[key.getAttribute("data-image-key")].translations = {};
            }
            return _this.model.attributes.content[key.getAttribute("data-image-key")].translations[Core.settings.lang] = key.getAttribute("src");
          };
        })(this));
      } else {
        this.$el.find("[data-key]").each((function(_this) {
          return function(index, key) {
            return _this.model.attributes.content[key.getAttribute("data-key")].value = key.innerHTML;
          };
        })(this));
        this.$el.find("[data-image-key]").each((function(_this) {
          return function(index, key) {
            return _this.model.attributes.content[key.getAttribute("data-image-key")].value = key.getAttribute("src");
          };
        })(this));
        this.$el.find("[data-slides-key]").each((function(_this) {
          return function(index, key) {
            var slides;
            slides = [];
            $(key).find("[data-slide-image]").each(function(index, image) {
              return slides.push({
                title: $(key).find("[data-slide-title]").length > 0 ? $(key).find("[data-slide-title]")[index].innerText : void 0,
                image: image.src.replace(key.getAttribute("data-slides-cdn"), "")
              });
            });
            return _this.model.attributes.content[key.getAttribute("data-slides-key")].value = slides;
          };
        })(this));
      }
      return this.model.save();
    };

    Piece.prototype.key_input = function(e) {
      if (this.button.attr("disabled")) {
        return this.button.removeAttr("disabled");
      }
    };

    Piece.prototype.trigger_upload = function(e) {
      this.image = e.currentTarget;
      return this.$el.find(".js-image_input").first().click();
    };

    Piece.prototype.upload_image = function(e) {
      var file;
      file = e.currentTarget.files[0];
      if (file.type.match('image.*')) {
        return Core.helpers.upload(file, {
          success: (function(_this) {
            return function(response) {
              $(_this.image).attr("src", Core.settings.cdn + response.url);
              return _this.key_input();
            };
          })(this)
        });
      }
    };

    Piece.prototype.prevent_click = function(e) {
      if (this.data.is_authenticated) {
        return e.preventDefault();
      }
    };

    return Piece;

  })(Core.View);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Core.Views.Post = (function(superClass) {
    extend(Post, superClass);

    function Post() {
      return Post.__super__.constructor.apply(this, arguments);
    }

    Post.prototype.author_input_template = templates["admin/author_input"];

    Post.prototype.author_template = templates["admin/author"];

    Post.prototype.events = {
      "click .js-maximize": "maximize",
      "click .js-minimize": "minimize"
    };

    Post.prototype.initialize = function() {
      return Post.__super__.initialize.call(this);
    };

    Post.prototype.render = function() {
      Post.__super__.render.call(this);
      if (this.data.is_authenticated) {
        this.$el.find("[data-title]").attr("contenteditable", "true");
        this.$el.find("[data-published-date]").attr("contenteditable", "true");
        this.$el.find("[data-content-key]").attr("contenteditable", "true");
        this.delegateEvents();
      }
      return this;
    };

    Post.prototype.save_edit = function(e) {
      var value;
      this.model.set({
        title: this.$el.find("[data-title]").html(),
        published_date: this.$el.find("[data-published-date]").html()
      });
      value = "";
      this.$el.find("[data-content-key]").each((function(_this) {
        return function(index, content) {
          value = content.innerHTML;
          if (content.getAttribute("data-is-markdown") != null) {
            value = toMarkdown(content.innerHTML);
            content.innerHTML = marked(value);
          }
          return _this.model.attributes.content[content.getAttribute("data-content-key")].value = value;
        };
      })(this));
      return Post.__super__.save_edit.call(this);
    };

    Post.prototype.maximize = function(e) {
      e.preventDefault();
      $(e.currentTarget).addClass("hide");
      this.$el.find(".js-minimize").removeClass("hide");
      this.$el.find(".blog__post__content").removeClass("blog__post__content--minimized");
      return Core.router.navigate(e.currentTarget.getAttribute("href"));
    };

    Post.prototype.minimize = function(e) {
      e.preventDefault();
      $(e.currentTarget).addClass("hide");
      this.$el.find(".js-maximize").removeClass("hide");
      this.$el.find(".blog__post__content").addClass("blog__post__content--minimized");
      return Core.router.navigate("/lists/blog");
    };

    return Post;

  })(Core.Views.Editable);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Core.Views.Slider = (function(superClass) {
    extend(Slider, superClass);

    function Slider() {
      return Slider.__super__.constructor.apply(this, arguments);
    }

    Slider.prototype.current_slide = 0;

    Slider.prototype.events = {
      "click [data-next-slide-button]": "next_slide",
      "click [data-previous-slide-button]": "previous_slide",
      "click [data-slide-marker]": "slide_to",
      "click [data-add-new-slide]": "new_slide"
    };

    Slider.prototype.initialize = function() {
      this.slides_count = this.$el.find("[data-slide]").length;
      if (this.el.hasAttribute("data-current-slide")) {
        this.current_slide = parseInt(this.$el.attr("data-current-slide"));
      }
      return this.render();
    };

    Slider.prototype.render = function() {
      this.$el.find("[data-slider-container]").css("width", this.slides_count + "00%");
      this.$el.find("[data-slide]").css("width", (100 / this.slides_count) + "%");
      this.previous_slide_height = this.$el.find("[data-slide=" + this.current_slide + "] [data-slide-content]").height();
      this.$el.find("[data-slider-container]").css("height", "-=" + (this.$el.find("[data-slide=" + this.current_slide + "]").height() - this.previous_slide_height) + "px");
      this.$el.find("[data-slide]").css("transform", "translateX(-" + this.current_slide + "00%)");
      setTimeout((function(_this) {
        return function() {
          return _this.$el.find("[data-slide]").css("visibility", "visible");
        };
      })(this), 666);
      return this;
    };

    Slider.prototype.next_slide = function() {
      if (this.current_slide === this.slides_count - 1) {
        return this.slide_to(null, 0);
      } else {
        return this.slide_to(null, this.current_slide + 1);
      }
    };

    Slider.prototype.previous_slide = function() {
      if (this.current_slide === 0) {
        return this.slide_to(null, this.slides_count - 1);
      } else {
        return this.slide_to(null, this.current_slide - 1);
      }
    };

    Slider.prototype.slide_to = function(e, index) {
      var slide_height;
      if (e != null) {
        index = parseInt(e.currentTarget.getAttribute("data-slide-marker"));
        e.currentTarget.blur();
      }
      this.current_slide = index;
      this.$el.find("[data-slide-marker]").removeClass("slider__marker--active");
      this.$el.find("[data-slide-marker=" + this.current_slide + "]").addClass("slider__marker--active");
      slide_height = this.$el.find("[data-slide=" + this.current_slide + "] [data-slide-content]").height();
      this.$el.find("[data-slider-container]").css("height", "-=" + (this.previous_slide_height - slide_height) + "px");
      this.previous_slide_height = slide_height;
      return this.$el.find("[data-slide]").css("transform", "translateX(-" + this.current_slide + "00%)");
    };

    Slider.prototype.new_slide = function(e) {
      var i, len, ref, slide, view;
      e.preventDefault();
      slide = this.$el.find("[data-slide]").last().clone();
      slide.attr("data-slide", this.slides_count);
      slide.find("[data-slide-image]").attr("src", "https://placehold.it/750x500?text=%2B");
      slide.find("[data-slide-content]").css("background-image", "none");
      slide.find("[data-slide-title]").text("<Mois>");
      this.slides_count = this.slides_count + 1;
      this.$el.find("[data-slider-container]").append(slide);
      this.render();
      ref = Core.router.views;
      for (i = 0, len = ref.length; i < len; i++) {
        view = ref[i];
        view.render();
      }
      return this.slide_to(null, this.slides_count - 1);
    };

    return Slider;

  })(Backbone.View);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Core.Views.Survey = (function(superClass) {
    extend(Survey, superClass);

    function Survey() {
      return Survey.__super__.constructor.apply(this, arguments);
    }

    Survey.prototype.el = $(".js-survey");

    Survey.prototype.events = {
      "focus .js-input": "focus_input",
      "submit .js-form": "submit_form",
      "click .js-reset": "reset"
    };

    Survey.prototype.initialize = function() {
      this.answers = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.whitespace,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: pieces.survey.answers
      });
      this.survey = new Core.Models.Survey({
        "_id": "56b60e72f5f9e96ffb235c64"
      });
      this.survey.fetch();
      return this.listenTo(this.survey, "sync", this.render);
    };

    Survey.prototype.render = function() {
      var answers, count, highest_count, key, second_answers;
      if (localStorage.getItem("survey_answer") != null) {
        answers = this.survey.get("questions")[0]["answers"];
        second_answers = this.survey.get("questions")[1]["answers"];
        highest_count = 0;
        for (key in answers) {
          count = answers[key];
          if (second_answers[key] != null) {
            answers[key] = answers[key] + second_answers[key];
            delete second_answers[key];
          }
        }
        for (key in second_answers) {
          count = second_answers[key];
          answers[key] = second_answers[key];
        }
        for (key in answers) {
          count = answers[key];
          if (answers[key] > highest_count) {
            highest_count = answers[key];
          }
        }
        this.$el.find(".js-answers").html(templates["answers"]({
          answers: answers,
          highest_count: highest_count
        }));
        this.$el.find(".js-results").removeClass("hide");
        setTimeout((function(_this) {
          return function() {
            return _this.$el.find(".js-results").removeClass("fade_out");
          };
        })(this), 1);
      } else {
        $("body").removeClass("white_back");
        this.$el.find(".js-questions").removeClass("hide");
        this.$el.find(".js-typeahead").typeahead({
          hint: true,
          highlight: true,
          minLength: 1
        }, {
          source: this.answers,
          name: "answers",
          templates: {
            suggestion: templates["answer"]
          }
        });
        setTimeout((function(_this) {
          return function() {
            _this.$el.find(".js-questions").removeClass("fade_out");
            return _this.$el.find(".js-question")[1].focus();
          };
        })(this), 1);
      }
      return this;
    };

    Survey.prototype.focus_input = function(e) {
      this.$el.find(".js-input").addClass("input_box--faded");
      $(e.currentTarget).removeClass("input_box--faded");
      return $(e.currentTarget).removeClass("input_box--hidden");
    };

    Survey.prototype.submit_form = function(e) {
      var answers, form, i, len, question, ref;
      e.preventDefault();
      form = e.currentTarget;
      answers = [];
      ref = this.survey.get("questions");
      for (i = 0, len = ref.length; i < len; i++) {
        question = ref[i];
        if (form[question["key"]] != null) {
          if (form[question["key"]].value === "") {
            $(form[question["key"]]).focus();
            return false;
          }
          answers.push({
            question_key: question["key"],
            value: form[question["key"]].value.capitalize()
          });
        }
      }
      this.survey_answer = new Core.Models.SurveyAnswer();
      this.survey_answer.local_storage = "survey_answer";
      this.survey_answer.urlRoot = Core.settings.api + "surveys/" + this.survey.id + "/answers";
      return this.survey_answer.save({
        answers: answers
      }, {
        success: (function(_this) {
          return function(model, response) {
            _this.$el.find(".js-questions").addClass("fade_out");
            return setTimeout(function() {
              _this.$el.find(".js-questions").addClass("hide");
              return _this.survey.fetch();
            }, 666);
          };
        })(this)
      });
    };

    Survey.prototype.reset = function(e) {
      e.preventDefault();
      this.$el.find(".js-results").addClass("fade_out");
      this.$el.find(".js-form")[0].reset();
      this.$el.find(".js-typeahead").typeahead("destroy");
      localStorage.removeItem("survey_answer");
      return setTimeout((function(_this) {
        return function() {
          return _this.render();
        };
      })(this), 666);
    };

    return Survey;

  })(Backbone.View);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Core.Routers.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.routes = {
      "(/)": "index"
    };

    Router.prototype.views = [];

    Router.prototype.initialize = function() {};

    Router.prototype.execute = function(callback, args) {
      var i, len, ref, view;
      ref = this.views;
      for (i = 0, len = ref.length; i < len; i++) {
        view = ref[i];
        view.destroy();
      }
      delete this.views;
      this.views = [];
      if (callback != null) {
        callback.apply(this, args);
      }
      $("[data-piece-id]").each((function(_this) {
        return function(index, element) {
          var model;
          model = new Core.Models.Piece({
            "_id": element.getAttribute("data-piece-id")
          });
          return _this.views.push(new Core.Views.Piece({
            el: element,
            model: model
          }));
        };
      })(this));
      $("[data-scroll-to]").click(function(e) {
        var scroll_to;
        scroll_to = $("#" + e.currentTarget.getAttribute("data-scroll-to"));
        if (scroll_to.length > 0) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return scroll_to.velocity("scroll", {
            duration: 1500,
            easing: "easeOutQuart",
            offset: -80
          });
        }
      });
      $("[data-slider]").each((function(_this) {
        return function(index, element) {
          return _this.views.push(new Core.Views.Slider({
            el: element
          }));
        };
      })(this));
      if (typeof ga !== "undefined" && ga !== null) {
        return $("[data-click-event]").click(function(e) {
          return ga("send", "event", "reservations", "click", e.currentTarget.getAttribute("data-click-event"));
        });
      }
    };

    Router.prototype.index = function() {
      $("[data-show-setster]").click(function(e) {
        return window['setster_' + e.currentTarget.getAttribute("data-show-setster")].show();
      });
      if (window.location.host === "localhost:5000" || window.location.host === "monthly.apps.deming.tech") {
        return $("[data-show-resurva]").click(function(e) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return Core.overlay_view.show(e, e.currentTarget.getAttribute("data-show-resurva"));
        });
      }
    };

    Router.prototype.list = function(list_route, route) {
      return $(".js-post").each((function(_this) {
        return function(index, element) {
          var model;
          model = new Core.Models.ListPost();
          model.urlRoot = Core.settings.api + "lists/" + window.list_id + "/posts";
          return _this.views.push(new Core.Views.Post({
            el: element,
            model: model
          }));
        };
      })(this));
    };

    return Router;

  })(Backbone.Router);

}).call(this);

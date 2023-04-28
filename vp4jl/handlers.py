import json
import os
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado


def insertToObj(obj, path, value):
    for k in path[:-1]:
        obj = obj[k]
    obj[path[-1]] = value


class RouteHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        nodes_foler = os.path.join(os.path.dirname(__file__), "vp_nodes")
        libraries = {}
        for folder, dirs, files in os.walk(nodes_foler):
            relativeFolder = folder[len(nodes_foler) + 1:]
            for file in files:
                path = os.path.join(folder, file)
                content = None
                try:
                    with open(path, "r") as f:
                        content = json.load(f)
                except:
                    print("Error reading file: " + path)
                    continue
                if content is not None:
                    insertToObj(libraries, os.path.join(
                        relativeFolder, os.path.splitext(file)[0]).split(os.sep), content)
            for dir in dirs:
                insertToObj(libraries, os.path.join(
                    relativeFolder, dir).split(os.sep), {'__isPackage__': True})
        self.finish(json.dumps({
            "packages": libraries
        }))


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "vp4jl", "get_node_libraries")
    handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, handlers)

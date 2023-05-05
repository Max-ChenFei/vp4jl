import json
import os
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado
import shutil

NODE_TYPE_FOLDER = os.path.join(os.path.dirname(__file__), "nodeextension")
NODE_TYPE_REGISTER = {}


def insertToObj(obj, path, value):
    for k in path[:-1]:
        obj = obj[k] if k in obj.keys() else obj['subpackages'][k]
    if ('isPackage' in obj.keys()):
        obj['subpackages'][path[-1]] = value
    else:
        obj[path[-1]] = value


def loadNodeExtensions():
    nodes_foler = NODE_TYPE_FOLDER
    register = NODE_TYPE_REGISTER
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
                insertToObj(register, os.path.join(
                    relativeFolder, os.path.splitext(file)[0]).split(os.sep), content)
        for dir in dirs:
            insertToObj(register, os.path.join(
                relativeFolder, dir).split(os.sep), {'isPackage': True, 'subpackages': {}})


class RouteHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server

    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({
            "packages": NODE_TYPE_REGISTER,
        }))

    def delete(self):
        path = self.request.body.decode(
            'utf-8').split('.')
        if (len(path) == 0):
            self.finish(json.dumps({
                "message": "the input path is empty",
            }))
            return
        # delete in the register
        filePath = ''
        isDir = False
        isContent = False
        if (len(path) == 1):
            isDir = True
            filePath = path[0]
            del NODE_TYPE_REGISTER[path[0]]
        else:
            if (path[0] not in NODE_TYPE_REGISTER.keys()):
                self.finish(json.dumps({
                    "message": "fail, the input path is not valid",
                }))
                return
            package = NODE_TYPE_REGISTER[path[0]]
            for i in range(1, len(path) - 1):
                package = package[path[i]]
            filePath = os.sep.join(path[:-1])
            if package['isPackage']:
                if path[-1] in package.keys():
                    filePath = os.path.join(filePath, path[-1])
                    isDir = 'isPackage' in package[path[-1]].keys()
                    del package[path[-1]]
                else:
                    package = package["__init__"]
                    filePath = os.path.join(filePath, "__init__")
                    isContent = True
                    if (path[-1] in package['nodes'].keys()):
                        del package['nodes'][path[-1]]
                    else:
                        self.finish(json.dumps({
                            "message": "fail, the input path is not valid"
                        }))
                        return
            else:
                if (path[-1] in package['nodes'].keys()):
                    isContent = True
                    del package['nodes'][path[-1]]
                else:
                    self.finish(json.dumps({
                        "message": "fail, the input path is not valid"
                    }))
                    return

        # delete in the file system
        if (isDir):
            shutil.rmtree(os.path.join(NODE_TYPE_FOLDER, filePath))
        elif isContent == False:
            os.remove(os.path.join(NODE_TYPE_FOLDER, filePath) + ".json")
        else:
            with open(os.path.join(NODE_TYPE_FOLDER, filePath) + ".json", "r") as f:
                content = json.load(f)
            del content['nodes'][path[-1]]
            with open(os.path.join(NODE_TYPE_FOLDER, filePath) + ".json", "w") as f:
                json.dump(content, f)
        self.finish(json.dumps({
            "message": "success"
        }))


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "vp4jl", "get_node_libraries")
    loadNodeExtensions()
    handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, handlers)

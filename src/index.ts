import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { VPModelFactory, VP_MODEL_FACTORY } from './model-factory';
import { VPWidgetFactory } from './widget-factory';
import { requestAPI } from './handler';
import { LoadLibrary } from 'visual-programming-editor2';
import lib_example from './VPLibraryExample.json';

/**
 * Initialization data for the vp4jl extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'vp4jl:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension vp4jl is activated!');
    const VP_FILE_TYPE = 'vp4jl';
    const VP_WIDGET_FACTORY = 'VP Editor';

    requestAPI<any>('get_example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The vp4jl server extension appears to be missing.\n${reason}`
        );
      });

    // move to the server side
    LoadLibrary(lib_example);

    const widgetFactory = new VPWidgetFactory({
      name: VP_WIDGET_FACTORY,
      modelName: VP_MODEL_FACTORY,
      fileTypes: [VP_FILE_TYPE],
      defaultFor: [VP_FILE_TYPE]
    });
    app.docRegistry.addWidgetFactory(widgetFactory);
    app.docRegistry.addModelFactory(new VPModelFactory());
    app.docRegistry.addFileType({
      name: VP_FILE_TYPE,
      displayName: 'VP File',
      mimeTypes: ['text/json', 'application/json'],
      extensions: ['.vp4jl'],
      fileFormat: 'text',
      contentType: 'file'
    });
  }
};

export default plugin;
